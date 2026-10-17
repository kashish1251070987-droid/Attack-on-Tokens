const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const assert = require('assert');

const userURL = pathToFileURL(path.join(__dirname, 'index.html')).href;
const baseURL = `${userURL}?automation=1`;
const evidence = path.join(__dirname, 'evidence');
fs.mkdirSync(evidence, { recursive: true });
const results = [];

async function snap(page, name) {
  await page.screenshot({ path: path.join(evidence, name), fullPage: true });
}
async function clean(page) {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
}
async function test(name, fn) {
  try { await fn(); results.push({ name, status: 'PASS' }); console.log('PASS', name); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); console.error('FAIL', name, error); }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await test('1 Animal-photo identity scramble', async () => {
    await clean(page); const beforeName = await page.getByTestId('display-name').textContent(); const beforeSrc = await page.getByTestId('profile-photo').getAttribute('src');
    await page.getByTestId('profile-photo-input').setInputFiles({ name:'my-real-portrait.png', mimeType:'image/png', buffer:Buffer.from('pretend portrait') });
    const afterName = await page.getByTestId('display-name').textContent(); const afterSrc = await page.getByTestId('profile-photo').getAttribute('src');
    assert.notStrictEqual(afterName, beforeName); assert.notStrictEqual(afterSrc, beforeSrc); assert(afterSrc.includes('assets/animals/'));
    await snap(page, '01-photo-and-name-changed.png'); await page.reload(); assert.strictEqual(await page.getByTestId('display-name').textContent(), afterName); assert.strictEqual(await page.getByTestId('profile-photo').getAttribute('src'), afterSrc);
  });

  await test('2 Biography letter loss', async () => {
    await clean(page); const ids=['corruption-target-meta','corruption-target-followers','corruption-target-following','corruption-target-projects','corruption-target-activity','corruption-target-strength','corruption-target-strength-description','corruption-target-settings','corruption-target-pro'];
    const before=await Promise.all(ids.map(id=>page.getByTestId(id).textContent())); await page.getByTestId('edit-name-button').click();
    await page.getByTestId('bio-input').fill('A newly refined biography for the Persona challenge.'); await page.getByTestId('save-bio-button').click();
    const after=await Promise.all(ids.map(id=>page.getByTestId(id).textContent())); const delta=before.reduce((sum,t,i)=>sum+t.length-after[i].length,0); assert.strictEqual(delta,1); assert((await page.getByTestId('profile-biography').textContent()).includes('newly refined'));
    await snap(page,'02-biography-letter-loss.png');
  });

  await test('3 Shrinking followers', async () => {
    await clean(page); await page.getByTestId('follower-count').hover(); assert.strictEqual((await page.getByTestId('follower-count').textContent()).includes('1,247'),true); await page.waitForTimeout(300); await page.getByTestId('follower-count').click(); assert((await page.getByTestId('follower-count').textContent()).includes('1,246')); await snap(page,'03-followers-shrunk.png');
  });

  await test('4 Follow gaslighting sequence', async () => {
    await clean(page); const button=page.getByTestId('follow-button'); const styleBefore=await button.evaluate(el=>getComputedStyle(el).cssText); await button.click(); assert.strictEqual(await button.textContent(),'Following'); await page.waitForTimeout(2100); assert.strictEqual(await button.textContent(),'Unfollowed'); await button.click(); assert.strictEqual(await button.textContent(),'Followed successfully'); const styleAfter=await button.evaluate(el=>getComputedStyle(el).cssText); assert.strictEqual(styleAfter,styleBefore); await snap(page,'04-follow-gaslighting.png');
  });

  await test('5 Dishonest settings', async () => {
    await clean(page); const toggles=page.locator('[data-setting]'); const before=await toggles.evaluateAll(els=>els.map(el=>el.getAttribute('aria-checked'))); await toggles.first().click(); const after=await toggles.evaluateAll(els=>els.map(el=>el.getAttribute('aria-checked'))); assert.strictEqual(after[0],before[0]); assert.strictEqual(after.filter((v,i)=>v!==before[i]).length,1); await snap(page,'05-dishonest-settings.png');
  });

  await test('6 Swapped authentication', async () => {
    await clean(page); await page.getByTestId('login-button').click(); assert.strictEqual(await page.locator('#authTitle').textContent(),'Create your account'); await page.getByTestId('auth-name-input').fill('Test Persona'); assert(/^[01 ]+$/.test(await page.getByTestId('binary-name-preview').locator('code').textContent())); await page.getByTestId('auth-email-input').fill('demo@persona.test'); await page.getByTestId('auth-password-input').fill('sample12'); await page.locator('#authTerms').check(); await page.getByTestId('auth-submit-button').click(); const stored=await page.evaluate(()=>localStorage.getItem('persona_user_state_v2')); assert(!stored.includes('sample12')); assert(/^[01 ]+$/.test(await page.getByTestId('display-name').textContent())); assert(await page.getByTestId('logout-button').isVisible()); await clean(page); await page.getByTestId('signup-button').click(); assert.strictEqual(await page.locator('#authTitle').textContent(),'Welcome back'); await snap(page,'06-swapped-auth.png');
  });

  await test('7 Chaotic language selector', async () => {
    await clean(page); await page.getByTestId('language-selector').click(); assert((await page.getByTestId('language-list').locator('button').count())>=12); await page.getByTestId('language-list').getByText('Hindi',{exact:true}).click(); assert(await page.getByTestId('language-gate-modal').isVisible()); const equation=await page.getByTestId('language-equation').locator('span').textContent(); const parts=equation.match(/(\d+)\s*([+×])\s*(\d+)/); const answer=parts[2]==='×'?Number(parts[1])*Number(parts[3]):Number(parts[1])+Number(parts[3]); await page.getByTestId('equation-answer-input').fill(String(answer)); await page.getByTestId('height-input').fill('168'); await page.getByTestId('language-gate-submit').click(); assert((await page.getByTestId('language-selector').textContent()).includes('Hindi')); const state=JSON.parse(await page.evaluate(()=>localStorage.getItem('persona_user_state_v2'))); assert.notStrictEqual(state.language.mode,'hindi'); assert.strictEqual(state.auth.heightCm,168); await snap(page,'07-language-roulette.png');
  });

  await test('8 Notification hydra', async () => {
    await clean(page); await page.getByTestId('notification-button').click(); assert.strictEqual(await page.getByTestId('notification-badge').textContent(),'3'); await page.getByTestId('mark-all-read-button').click(); assert.strictEqual(await page.getByTestId('notification-badge').textContent(),'0'); await page.waitForTimeout(1000); assert.strictEqual(await page.getByTestId('notification-badge').textContent(),'1'); await snap(page,'08-notification-hydra.png');
  });

  await test('9 Resurrecting recommendation', async () => {
    await clean(page); const dismiss=page.getByTestId('dismiss-recommendation-button'); await dismiss.hover(); assert((await dismiss.getAttribute('class')).includes('evaded')); await dismiss.click(); assert.strictEqual(await page.getByTestId('recommendation-card').count(),0); await page.waitForTimeout(1600); assert.strictEqual(await page.getByTestId('recommendation-card').count(),1); await snap(page,'09-recommendation-resurrected.png');
  });

  await test('10 Dishonest sorting', async () => {
    await clean(page); await page.getByTestId('feed-sort-select').selectOption('newest'); const dates=await page.locator('[data-date]').evaluateAll(els=>els.map(el=>Number(el.dataset.date))); assert.deepStrictEqual(dates,[...dates].sort((a,b)=>a-b)); await snap(page,'10-dishonest-sort.png');
  });

  await test('11 Deceptive interest progress', async () => {
    await clean(page); await page.getByTestId('edit-interests-button').click(); await page.getByTestId('interest-option-2').check({ force: true }); const seen=new Set(); const watcher=setInterval(async()=>{ try { seen.add(await page.getByTestId('interest-save-progress').textContent()); } catch {} },30); await page.getByTestId('save-interests-button').click(); await page.waitForTimeout(2600); clearInterval(watcher); assert(seen.has('99%')); assert(seen.has('73%')); const state=JSON.parse(await page.evaluate(()=>localStorage.getItem('persona_user_state_v2'))); assert(state.interests.includes('Technology')); await snap(page,'11-interest-progress-complete.png');
  });

  await test('12 Endless Load More illusion', async () => {
    await clean(page); const initial=await page.locator('[data-testid^="activity-card-"]').count(); await page.getByTestId('load-more-activity-button').click(); await page.waitForTimeout(850); const after=await page.locator('[data-testid^="activity-card-"]').count(); assert.strictEqual(after,initial+2); await snap(page,'12-load-more.png');
  });

  await test('13 Login language math and height gate', async () => {
    await clean(page); await page.getByTestId('login-button').click(); await page.getByTestId('auth-language-select').selectOption('Marathi'); assert(await page.getByTestId('language-gate-modal').isVisible()); await snap(page,'13-login-language-gate.png'); const equation=await page.getByTestId('language-equation').locator('span').textContent(); const parts=equation.match(/(\d+)\s*([+×])\s*(\d+)/); const answer=parts[2]==='×'?Number(parts[1])*Number(parts[3]):Number(parts[1])+Number(parts[3]); await page.getByTestId('equation-answer-input').fill(String(answer)); await page.getByTestId('height-input').fill('172'); await page.getByTestId('language-gate-submit').click(); assert(await page.getByTestId('auth-modal').isVisible()); assert.strictEqual(await page.getByTestId('auth-language-select').inputValue(),'Marathi');
  });

  await test('14 Logout cartoon refuses logout', async () => {
    await clean(page); await page.getByTestId('login-button').click(); await page.getByTestId('auth-name-input').fill('Stay Here'); await page.getByTestId('auth-email-input').fill('stay@persona.test'); await page.getByTestId('auth-password-input').fill('sample12'); await page.locator('#authTerms').check(); await page.getByTestId('auth-submit-button').click(); await page.getByTestId('logout-button').click(); assert(await page.getByTestId('logout-ragebait-modal').isVisible()); assert((await page.getByTestId('logout-cartoon-video').getAttribute('src')).includes('logout-ragebait.mp4')); const state=JSON.parse(await page.evaluate(()=>localStorage.getItem('persona_user_state_v2'))); assert.strictEqual(state.auth.signedIn,true); await snap(page,'14-logout-cartoon-denial.png');
  });

  await test('15 Help asks for help aloud', async () => {
    await clean(page); await page.getByTestId('help-button').click(); assert.strictEqual(await page.locator('body').getAttribute('data-audio-event'),'help-me-please'); assert((await page.locator('#toastRegion').textContent()).includes('asking you for help')); await snap(page,'15-help-me-please.png');
  });

  await test('16 Irrelevant volume makes noise', async () => {
    await clean(page); await page.getByTestId('chaos-volume-slider').evaluate(element=>{ element.value='91'; element.dispatchEvent(new Event('input',{bubbles:true})); }); assert.strictEqual(await page.locator('#chaosVolumeValue').textContent(),'91%'); assert.strictEqual(await page.locator('body').getAttribute('data-audio-event'),'irrelevant-noise'); await page.getByTestId('random-noise-button').click(); await snap(page,'16-irrelevant-volume.png');
  });

  await test('17 Why gate interrupts every command', async () => {
    await page.goto(userURL,{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.getByTestId('login-button').click(); assert(await page.getByTestId('why-modal').isVisible()); assert(!(await page.getByTestId('auth-modal').isVisible())); assert((await page.locator('#whyActionLabel').textContent()).includes('Log In')); await page.getByTestId('why-reason-input').fill('Because I insist on opening it.'); await snap(page,'17-why-every-action.png'); await page.getByTestId('why-continue-button').click(); assert(await page.getByTestId('auth-modal').isVisible());
  });

  await test('18 Cursor moves in the opposite direction', async () => {
    await page.goto(userURL,{waitUntil:'networkidle'}); await page.mouse.move(120,160); const cursor=page.getByTestId('reverse-cursor'); assert.strictEqual(await cursor.getAttribute('data-x'),'1320'); assert.strictEqual(await cursor.getAttribute('data-y'),'840'); assert((await cursor.getAttribute('class')).includes('visible')); await snap(page,'18-reverse-cursor.png');
  });

  fs.writeFileSync(path.join(__dirname,'test_results.json'),JSON.stringify(results,null,2));
  await browser.close();
  if (results.some(r=>r.status==='FAIL')) process.exitCode=1;
})();
