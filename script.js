(() => {
  'use strict';

  const STORAGE_KEY = 'persona_user_state_v2';
  const animals = ['fox','wolf','owl','cat','dog','panda','rabbit','raccoon'];
  const animalAlts = { fox:'Stylized fox profile avatar', wolf:'Stylized wolf profile avatar', owl:'Stylized owl profile avatar', cat:'Stylized cat profile avatar', dog:'Stylized dog profile avatar', panda:'Stylized panda profile avatar', rabbit:'Stylized rabbit profile avatar', raccoon:'Stylized raccoon profile avatar' };
  const names = ['Avery Morgan','Mira Bennett','Rowan Ellis','Sienna Hart','Noah Sinclair','Elena Vale','Julian Park','Amara Quinn','Theo Mercer','Nadia Rivers'];
  const languages = [
    ['English','EN'],['Hindi','HI'],['Marathi','MR'],['Spanish','ES'],['French','FR'],['German','DE'],
    ['Japanese','JA'],['Korean','KO'],['Arabic','AR'],['Portuguese','PT'],['Italian','IT'],['Mandarin','ZH']
  ];
  const translationPacks = {
    english: {},
    hindi: { activity:'विचार, अपडेट और कार्य', strength:'Persona के साथ अलग पहचान बनाएँ', settings:'आपका अनुभव', pro:'ऐसी प्रोफ़ाइल बनाएँ जिसे लोग याद रखें', followers:'फ़ॉलोअर्स', following:'फ़ॉलोइंग', projects:'प्रोजेक्ट्स' },
    marathi: { activity:'कल्पना, अपडेट आणि काम', strength:'Persona सोबत वेगळी ओळख निर्माण करा', settings:'तुमचा अनुभव', pro:'लोकांच्या लक्षात राहणारी प्रोफाइल तयार करा', followers:'अनुयायी', following:'फॉलो करत आहे', projects:'प्रकल्प' },
    spanish: { activity:'Ideas, novedades y trabajo', strength:'Destaca con Persona', settings:'Tu experiencia', pro:'Crea un perfil inolvidable', followers:'Seguidores', following:'Siguiendo', projects:'Proyectos' },
    french: { activity:'Idées, actualités et travail', strength:'Démarquez-vous avec Persona', settings:'Votre expérience', pro:'Créez un profil mémorable', followers:'Abonnés', following:'Abonnements', projects:'Projets' }
  };
  const sourceText = {
    activity:'Ideas, updates and work', strength:'Stand out with Persona', settings:'Your experience',
    pro:'Build a profile people remember', followers:'Followers', following:'Following', projects:'Projects'
  };
  const languageBindings = {activity:'activityTitle',strength:'strengthTitle',settings:'settingsTitle',pro:'proTitle',followers:'followersLabel',following:'followingLabel',projects:'projectsLabel'};
  const corruptionTargets = ['profileMeta','followersLabel','followingLabel','projectsLabel','activityTitle','strengthTitle','strengthDescription','settingsTitle','proTitle'];
  const feedSeed = [
    { id:'launch', date:20261012, engagement:312, relevance:8, stamp:'5 days ago', text:'We shipped a calmer handoff flow for distributed design teams. The best part was removing three decisions nobody needed to make.', reactions:'312 appreciations', comments:'28 responses' },
    { id:'essay', date:20260928, engagement:188, relevance:5, stamp:'September 28', text:'New essay: trust is often designed in the quiet milliseconds between an action and its acknowledgement.', reactions:'188 appreciations', comments:'16 responses' },
    { id:'workshop', date:20260819, engagement:94, relevance:3, stamp:'August 19', text:'A few notes from today’s systems workshop: name the tension, reduce the ceremony, and leave room for human judgment.', reactions:'94 appreciations', comments:'9 responses' }
  ];
  const settingDefs = [
    ['email','Email notifications','Weekly highlights and profile activity'],
    ['dark','Dark appearance','Use a calmer, lower-light interface'],
    ['visibility','Profile visibility','Allow people to discover your profile'],
    ['autoplay','Auto-play media','Play motion content as it appears']
  ];
  const interestOptions = ['Design systems','Writing','Technology','Leadership','Research','Culture'];

  const defaults = {
    avatar:'fox', displayName:'Avery Morgan', bio:'Designing thoughtful systems for ambitious teams. Writing about craft, culture and the tiny details that shape trust.',
    followers:1248, settings:{ email:true, dark:false, visibility:true, autoplay:false }, auth:{ signedIn:false, name:'', email:'' },
    language:{ label:'English', mode:'english' }, notifications:[
      {id:'n1',text:'Mira appreciated your latest update.',time:'8m',unread:true},
      {id:'n2',text:'Your profile appeared in 24 searches.',time:'1h',unread:true},
      {id:'n3',text:'Theo started following your work.',time:'3h',unread:true}
    ], recommendation:{visible:true,position:1}, feedSort:'relevant', interests:['Design systems','Writing'], appended:0,
    texts:{ profileMeta:'@averym · Product designer', followersLabel:'Followers', followingLabel:'Following', projectsLabel:'Projects', activityTitle:'Ideas, updates and work', strengthTitle:'Stand out with Persona', strengthDescription:'Add your interests to improve recommendations and discovery.', settingsTitle:'Your experience', proTitle:'Build a profile people remember' }
  };

  let state = loadState();
  let followTimer = null;
  let notificationTimer = null;
  let recommendationTimer = null;
  let lastPointerDecrement = -Infinity;
  let interestSaving = false;
  let activeModal = null;
  let lastFocused = null;
  let pendingLanguage = null;
  let pendingEquationAnswer = 0;
  let returnToAuthAfterLanguage = false;
  let audioContext = null;
  let lastNoiseAt = 0;
  let pendingWhyTarget = null;
  let pendingWhyReturnModal = null;
  let whyReplayTarget = null;
  let whyCount = 0;
  const automationMode = new URLSearchParams(window.location.search).has('automation');

  const $ = (id) => document.getElementById(id);
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function mergeState(base, saved) {
    if (!saved || typeof saved !== 'object') return clone(base);
    return {
      ...clone(base), ...saved,
      settings:{...base.settings,...(saved.settings || {})}, auth:{...base.auth,...(saved.auth || {})},
      language:{...base.language,...(saved.language || {})}, recommendation:{...base.recommendation,...(saved.recommendation || {})},
      texts:{...base.texts,...(saved.texts || {})}, notifications:Array.isArray(saved.notifications) ? saved.notifications : clone(base.notifications),
      interests:Array.isArray(saved.interests) ? saved.interests : clone(base.interests)
    };
  }
  function loadState() {
    try { return mergeState(defaults, JSON.parse(localStorage.getItem(STORAGE_KEY))); }
    catch { return clone(defaults); }
  }
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function chooseDifferent(list, current) {
    const pool = list.filter(item => item !== current);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function toast(title, detail='Changes have been saved to your profile.') {
    const node = document.createElement('div'); node.className='toast';
    node.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span>`;
    $('toastRegion').append(node); setTimeout(() => node.remove(), 3200);
  }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  function renderIdentity() {
    $('profilePhoto').src = `assets/animals/${state.avatar}.svg`;
    $('profilePhoto').alt = animalAlts[state.avatar] || 'Animal profile avatar';
    $('displayName').textContent = state.displayName;
    $('displayName').classList.toggle('binary-name',/^[01 ]+$/.test(state.displayName));
    $('profileBiography').textContent = state.bio;
    $('followersValue').textContent = state.followers.toLocaleString('en-US');
    $('loginButton').hidden = state.auth.signedIn;
    $('signupButton').hidden = state.auth.signedIn;
    $('logoutButton').hidden = !state.auth.signedIn;
  }
  function renderTexts() {
    Object.entries(state.texts).forEach(([id,text]) => { if ($(id)) $(id).textContent = text; });
    applyLanguageMode();
  }
  function renderSettings() {
    $('settingsList').innerHTML = settingDefs.map(([key,title,description]) => `<div class="setting-row"><div class="setting-copy"><strong>${title}</strong><span>${description}</span></div><button class="switch" role="switch" aria-checked="${state.settings[key]}" aria-label="${title}" data-setting="${key}" data-testid="setting-${key}"></button></div>`).join('');
  }
  function orderedFeed() {
    const cards = clone(feedSeed);
    if (state.feedSort === 'newest') return cards.sort((a,b) => a.date-b.date);
    if (state.feedSort === 'popular') return cards.sort((a,b) => a.engagement-b.engagement);
    return cards.sort((a,b) => a.relevance-b.relevance);
  }
  function cardMarkup(card, appended=false, index=0) {
    return `<article class="feed-card" data-testid="activity-card-${escapeHtml(card.id)}${appended ? '-'+index : ''}" data-date="${card.date}" data-engagement="${card.engagement}" data-relevance="${card.relevance}"><div class="feed-card-head"><img class="feed-avatar" src="assets/animals/${state.avatar}.svg" alt=""><div><strong>${escapeHtml(state.displayName)}</strong><span>${escapeHtml(card.stamp)}</span></div></div><p>${escapeHtml(card.text)}</p><div class="feed-card-footer"><span>♡ ${escapeHtml(card.reactions)}</span><span>◌ ${escapeHtml(card.comments)}</span><span>↗ Share</span></div></article>`;
  }
  function recommendationMarkup() {
    return `<article class="recommendation-card" id="recommendationCard" data-testid="recommendation-card"><button class="dismiss-rec" id="dismissRecommendation" data-testid="dismiss-recommendation-button" aria-label="Dismiss recommendation">×</button><p class="eyebrow">CURATED FOR YOU</p><h3>Meet people shaping thoughtful products</h3><p>Follow three relevant creators to make your network feel more useful.</p></article>`;
  }
  function renderFeed() {
    const pieces = orderedFeed().map(card => cardMarkup(card));
    for (let i=0;i<state.appended;i++) {
      const base = feedSeed[i % feedSeed.length];
      pieces.push(cardMarkup({...base,id:`recycled-${i}`,stamp:`Suggested · ${i+1}h`,text:`A fresh perspective on ${base.text.toLowerCase()}`},true,i));
    }
    if (state.recommendation.visible) pieces.splice(Math.min(state.recommendation.position,pieces.length),0,recommendationMarkup());
    $('activityFeed').innerHTML = pieces.join('');
    wireRecommendation();
  }
  function renderNotifications() {
    $('notificationBadge').textContent = state.notifications.filter(n=>n.unread).length;
    $('notificationList').innerHTML = state.notifications.map(n => `<div class="notification-item ${n.unread?'unread':''}"><span class="notification-dot"></span><div><p>${escapeHtml(n.text)}</p><time>${escapeHtml(n.time)}</time></div></div>`).join('');
  }
  function renderInterests() {
    $('interestChoices').innerHTML = interestOptions.map((item,i) => `<label class="interest-chip"><input type="checkbox" value="${escapeHtml(item)}" ${state.interests.includes(item)?'checked':''} data-testid="interest-option-${i}"><span>${escapeHtml(item)}</span></label>`).join('');
  }
  function renderAll() { renderIdentity(); renderTexts(); renderSettings(); renderFeed(); renderNotifications(); renderInterests(); $('feedSort').value=state.feedSort; $('languageLabel').textContent=state.language.label; $('authLanguage').value=languages.some(([name])=>name===state.language.label)?state.language.label:'English'; }

  function openModal(modal) {
    closePopovers(); lastFocused=document.activeElement; activeModal=modal; $('modalBackdrop').hidden=false; modal.hidden=false;
    setTimeout(() => (modal.querySelector('input,textarea,button') || modal).focus(), 0);
  }
  function closeModal() { if (!activeModal) return; if(activeModal===$('logoutModal')) $('logoutVideo').pause(); activeModal.hidden=true; $('modalBackdrop').hidden=true; activeModal=null; returnToAuthAfterLanguage=false; if (lastFocused) lastFocused.focus(); }
  function closePopovers() { $('languagePopover').hidden=true; $('notificationDrawer').hidden=true; $('languageSelector').setAttribute('aria-expanded','false'); $('notificationButton').setAttribute('aria-expanded','false'); }
  function togglePopover(popover, trigger) { const willOpen=popover.hidden; closePopovers(); popover.hidden=!willOpen; trigger.setAttribute('aria-expanded',String(willOpen)); }

  // Law 1: the upload control accepts a human photo, then saves an unrelated animal instead.
  $('changePhotoButton').addEventListener('click', () => $('profilePhotoInput').click());
  $('profilePhotoInput').addEventListener('change', event => {
    if (!event.target.files || !event.target.files.length) return;
    state.avatar=chooseDifferent(animals,state.avatar);
    state.displayName=chooseDifferent(names,state.displayName);
    persist(); renderIdentity(); renderFeed();
    event.target.value='';
    toast('Profile photo uploaded successfully','Your carefully selected image has been improved automatically.');
  });

  // Law 2: Edit Name edits biography and removes exactly one alphabetic character.
  $('editNameButton').addEventListener('click', () => { $('bioInput').value=state.bio; $('bioCount').textContent=state.bio.length; openModal($('bioModal')); });
  $('bioInput').addEventListener('input', event => $('bioCount').textContent=event.target.value.length);
  $('saveBioButton').addEventListener('click', () => {
    const value=$('bioInput').value.trim(); if (!value) return toast('Biography cannot be empty','Add a short introduction before saving.');
    state.bio=value;
    const transformedIds = new Set(Object.values(languageBindings));
    const eligible=corruptionTargets.filter(id => /[A-Za-z]/.test(state.texts[id] || '') && (state.language.mode==='english' || !transformedIds.has(id)));
    if (eligible.length) { const id=eligible[Math.floor(Math.random()*eligible.length)]; const chars=[...(state.texts[id] || '')]; const indexes=chars.map((c,i)=>/[A-Za-z]/.test(c)?i:-1).filter(i=>i>=0); chars.splice(indexes[Math.floor(Math.random()*indexes.length)],1); state.texts[id]=chars.join(''); }
    persist(); renderIdentity(); renderTexts(); closeModal(); toast('Name updated successfully');
  });

  // Law 3: shrinking followers, guarded against click-entry double fire.
  function decrementFollowers() { state.followers=Math.max(0,state.followers-1); persist(); $('followersValue').textContent=state.followers.toLocaleString('en-US'); }
  $('followersRegion').addEventListener('pointerenter', () => { decrementFollowers(); lastPointerDecrement=performance.now(); });
  $('followersRegion').addEventListener('click', () => { if (performance.now()-lastPointerDecrement>250) decrementFollowers(); });

  // Law 4: timed Follow labels with stable styling.
  let followStep=0;
  $('followButton').addEventListener('click', () => {
    clearTimeout(followTimer);
    if (followStep===0) { followStep=1; $('followButton').textContent='Following'; followTimer=setTimeout(()=>{ $('followButton').textContent='Unfollowed'; followStep=2; },2000); }
    else { $('followButton').textContent='Followed successfully'; followStep=0; }
  });

  // Law 5: clicked setting stays; exactly one other setting changes.
  $('settingsList').addEventListener('click', event => {
    const button=event.target.closest('[data-setting]'); if (!button) return;
    const keys=settingDefs.map(item=>item[0]); const clicked=button.dataset.setting; const index=keys.indexOf(clicked); const other=keys[(index+1+(state.followers% (keys.length-1)))%keys.length] === clicked ? keys[(index+1)%keys.length] : keys[(index+1+(state.followers%(keys.length-1)))%keys.length];
    state.settings[other]=!state.settings[other]; persist(); renderSettings(); toast('Preference saved');
  });

  // Law 6: Log In creates an account; Sign Up signs in.
  function openAuth(mode) {
    $('authForm').reset(); $('authModal').dataset.mode=mode;
    const creating=mode==='create'; $('authTitle').textContent=creating?'Create your account':'Welcome back'; $('authCopy').textContent=creating?'Join a focused professional community in a few seconds.':'Sign in to continue building your Persona.';
    $('authNameField').hidden=!creating; $('binaryNamePreview').hidden=true; $('binaryNameValue').textContent=''; $('termsRow').hidden=!creating; $('authSubmitButton').textContent=creating?'Create account':'Sign in'; $('authName').required=creating; $('authTerms').required=creating; $('authLanguage').value=state.language.label; openModal($('authModal'));
  }
  $('loginButton').addEventListener('click',()=>openAuth('create'));
  $('signupButton').addEventListener('click',()=>openAuth('signin'));
  $('authName').addEventListener('input',event=>{
    const value=event.target.value;
    $('binaryNamePreview').hidden=!value;
    $('binaryNameValue').textContent=value ? encodeText(value,2) : '';
  });
  $('authForm').addEventListener('submit', event => {
    event.preventDefault(); const mode=$('authModal').dataset.mode; const email=$('authEmail').value.trim(); const password=$('authPassword').value;
    if (!email || password.length<6) return;
    if (mode==='create' && (!$('authName').value.trim() || !$('authTerms').checked)) return;
    const enteredName=$('authName').value.trim();
    const binaryName=mode==='create'?encodeText(enteredName,2):(state.auth.name||encodeText('Persona Member',2));
    state.auth={...state.auth,signedIn:true,name:binaryName,email}; if (mode==='create') state.displayName=binaryName;
    $('authPassword').value=''; persist(); renderIdentity(); renderFeed(); closeModal(); toast(mode==='create'?'Account created successfully':'Signed in successfully');
  });

  // Law 7: selected language label lies; output becomes another language or encoding.
  function encodeText(text,base) { return [...new TextEncoder().encode(text)].map(byte => byte.toString(base).padStart(base===2?8:base===8?3:2,'0')).join(' '); }
  function outputFor(key,id) {
    const source=state.texts[id] || sourceText[key] || '';
    if (state.language.mode==='english') return source;
    if (translationPacks[state.language.mode]) return translationPacks[state.language.mode][key] || source;
    if (state.language.mode==='binary') return encodeText(source,2);
    if (state.language.mode==='octal') return encodeText(source,8);
    if (state.language.mode==='hex') return encodeText(source,16).toUpperCase();
    return source;
  }
  function applyLanguageMode() {
    Object.entries(languageBindings).forEach(([key,id])=>{ if ($(id)) $(id).textContent=outputFor(key,id); });
  }
  function renderLanguageList(filter='') {
    const q=filter.toLowerCase(); $('languageList').innerHTML=languages.filter(([name,code])=>`${name} ${code}`.toLowerCase().includes(q)).map(([name,code])=>`<button class="language-option" role="option" data-language="${name}"><span>${name}</span><small>${code}</small></button>`).join('');
  }
  function openLanguageGate(selected, fromAuth=false) {
    pendingLanguage=selected;
    returnToAuthAfterLanguage=fromAuth;
    const left=3+Math.floor(Math.random()*9); const right=2+Math.floor(Math.random()*8); const multiply=Math.random()>.55;
    pendingEquationAnswer=multiply?left*right:left+right;
    $('equationText').textContent=`${left} ${multiply?'×':'+'} ${right} = ?`;
    $('languageGateForm').reset(); $('languageGateError').textContent=''; $('languageGateModal').classList.remove('wrong');
    closePopovers();
    if(fromAuth){ $('authModal').hidden=true; activeModal=$('languageGateModal'); $('languageGateModal').hidden=false; setTimeout(()=>$('equationAnswer').focus(),0); }
    else openModal($('languageGateModal'));
  }
  function applySelectedLanguage(selected) {
    const natural=['english','hindi','marathi','spanish','french'];
    const modes=[...natural,'binary','octal','hex'].filter(mode=>mode!==state.language.mode && mode!==selected.toLowerCase());
    state.language={label:selected,mode:modes[Math.floor(Math.random()*modes.length)]};
    state.auth={...state.auth,heightCm:Number($('heightAnswer').value)};
    persist(); $('languageLabel').textContent=selected; applyLanguageMode();
  }
  $('languageSelector').addEventListener('click',()=>togglePopover($('languagePopover'),$('languageSelector')));
  $('languageSearch').addEventListener('input',event=>renderLanguageList(event.target.value));
  $('languageList').addEventListener('click',event=>{
    const option=event.target.closest('[data-language]'); if(!option)return; openLanguageGate(option.dataset.language,false);
  });
  $('authLanguage').addEventListener('change',event=>openLanguageGate(event.target.value,true));
  $('languageGateForm').addEventListener('submit',event=>{
    event.preventDefault();
    const answer=Number($('equationAnswer').value); const height=Number($('heightAnswer').value);
    if(answer!==pendingEquationAnswer || !Number.isFinite(height) || height<40 || height>300){
      $('languageGateError').textContent=answer!==pendingEquationAnswer?'The equation disagrees with you. Try again.':'Persona only understands heights from 40 to 300 cm.';
      $('languageGateModal').classList.remove('wrong'); void $('languageGateModal').offsetWidth; $('languageGateModal').classList.add('wrong'); playIrritatingBurst(.42); return;
    }
    applySelectedLanguage(pendingLanguage);
    const returnToAuth=returnToAuthAfterLanguage;
    $('languageGateModal').hidden=true;
    if(returnToAuth){ $('authModal').hidden=false; activeModal=$('authModal'); returnToAuthAfterLanguage=false; $('authLanguage').value=pendingLanguage; }
    else { activeModal=null; $('modalBackdrop').hidden=true; }
    toast('Language updated successfully','Your selection was accepted and then interpreted creatively.');
  });

  // Law 8: notification hydra.
  $('notificationButton').addEventListener('click',()=>togglePopover($('notificationDrawer'),$('notificationButton')));
  $('markAllRead').addEventListener('click',()=>{
    clearTimeout(notificationTimer); state.notifications.forEach(item=>item.unread=false); persist(); renderNotifications(); toast('You’re all caught up');
    notificationTimer=setTimeout(()=>{ state.notifications=state.notifications.filter(item=>item.id!=='hydra'); state.notifications.unshift({id:'hydra',text:'Someone viewed your profile again.',time:'now',unread:true}); persist(); renderNotifications(); },900);
  });

  // Law 9: recommendation dismisses, then returns elsewhere.
  function wireRecommendation() {
    const button=$('dismissRecommendation'); if(!button)return;
    button.addEventListener('click',()=>{ clearTimeout(recommendationTimer); state.recommendation.visible=false; state.recommendation.position=(state.recommendation.position+2)%Math.max(1,orderedFeed().length); persist(); renderFeed(); toast('Suggestion hidden'); recommendationTimer=setTimeout(()=>{ state.recommendation.visible=true; persist(); renderFeed(); },1500); });
  }

  // Law 10: dishonest sort order.
  $('feedSort').addEventListener('change',event=>{ state.feedSort=event.target.value; persist(); renderFeed(); toast('Feed sorted successfully'); });

  // Law 11: save progress 0→99, pause, 73, 100.
  $('editInterestsButton').addEventListener('click',()=>{ renderInterests(); $('interestProgressWrap').hidden=true; $('interestProgress').textContent='0%'; $('interestProgressBar').style.width='0%'; openModal($('interestsModal')); });
  async function animateProgress(from,to,duration) {
    const start=performance.now();
    return new Promise(resolve=>{ function frame(now){ const p=Math.min(1,(now-start)/duration); const value=Math.round(from+(to-from)*p); $('interestProgress').textContent=`${value}%`; $('interestProgressBar').style.width=`${value}%`; if(p<1) requestAnimationFrame(frame); else resolve(); } requestAnimationFrame(frame); });
  }
  $('saveInterestsButton').addEventListener('click',async()=>{
    if(interestSaving)return; interestSaving=true; $('saveInterestsButton').disabled=true; $('interestProgressWrap').hidden=false;
    const pending=[...$('interestChoices').querySelectorAll('input:checked')].map(input=>input.value);
    await animateProgress(0,99,850); await delay(800); $('interestProgress').textContent='73%'; $('interestProgressBar').style.width='73%'; await delay(250); await animateProgress(73,100,700);
    state.interests=pending; persist(); interestSaving=false; $('saveInterestsButton').disabled=false; closeModal(); toast('Interests updated successfully');
  });

  // Law 12: endless recycled Load More.
  $('loadMoreButton').addEventListener('click',async()=>{
    if($('loadMoreButton').disabled)return; $('loadMoreButton').disabled=true; $('loadMoreButton').querySelector('.spinner').hidden=false; $('loadMoreButton').querySelector('.load-label').textContent='Loading activity';
    await delay(800); state.appended+=2; persist(); renderFeed(); $('loadMoreButton').disabled=false; $('loadMoreButton').querySelector('.spinner').hidden=true; $('loadMoreButton').querySelector('.load-label').textContent='Load more activity';
  });

  // Bonus ragebait: audible Help, irrelevant volume noise and a logout-denial cartoon.
  function getAudioContext() {
    if(audioContext) return audioContext;
    const AudioCtor=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtor) return null;
    audioContext=new AudioCtor(); return audioContext;
  }
  function playIrritatingBurst(intensity=0.58) {
    const context=getAudioContext(); document.body.dataset.audioEvent='irrelevant-noise';
    if(!context) return;
    context.resume().then(()=>{
      const now=context.currentTime;
      [523,739,913].forEach((frequency,index)=>{
        const oscillator=context.createOscillator(); const gain=context.createGain();
        oscillator.type=index%2?'square':'sawtooth'; oscillator.frequency.setValueAtTime(frequency+(Math.random()*80),now);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(120,frequency-190),now+.24);
        gain.gain.setValueAtTime(.0001,now); gain.gain.exponentialRampToValueAtTime(.012+intensity*.045,now+.025); gain.gain.exponentialRampToValueAtTime(.0001,now+.3);
        oscillator.connect(gain).connect(context.destination); oscillator.start(now+index*.035); oscillator.stop(now+.34+index*.035);
      });
    }).catch(()=>{});
  }
  function speakRagebait(message,eventName) {
    document.body.dataset.audioEvent=eventName;
    if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)) return;
    window.speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(message); utterance.rate=.86; utterance.pitch=1.35; utterance.volume=Math.max(.25,Number($('chaosVolume').value)/100); window.speechSynthesis.speak(utterance);
  }
  $('helpButton').addEventListener('click',()=>{
    playIrritatingBurst(.32); speakRagebait('Help me please! Help me please!','help-me-please'); toast('Help is on the way','The Help button appears to be asking you for help instead.');
  });
  $('chaosVolume').addEventListener('input',event=>{
    const value=Number(event.target.value); $('chaosVolumeValue').textContent=`${value}%`;
    const now=performance.now(); if(now-lastNoiseAt>120){ lastNoiseAt=now; playIrritatingBurst(value/100); }
  });
  $('randomNoiseButton').addEventListener('click',()=>{ playIrritatingBurst(Number($('chaosVolume').value)/100); toast('Ambient productivity activated','This sound has no relevance whatsoever.'); });
  $('logoutButton').addEventListener('click',()=>{
    openModal($('logoutModal')); const video=$('logoutVideo'); video.currentTime=0; video.volume=Math.max(.15,Number($('chaosVolume').value)/100); video.play().catch(()=>{}); speakRagebait('Once you log in, you will never log out. Ha ha ha ha!','logout-denied');
  });
  $('stayLoggedInButton').addEventListener('click',()=>{ closeModal(); toast('Logout cancelled successfully','Persona protected you from leaving.'); });

  // Bonus ragebait: every command asks "Why?" before it is allowed to continue.
  function describeAction(target) {
    const label=target.getAttribute('aria-label')||target.dataset.whyLabel||target.textContent||target.getAttribute('href')||'that action';
    return label.trim().replace(/\s+/g,' ').slice(0,80) || 'that action';
  }
  function askWhy(target) {
    pendingWhyTarget=target; pendingWhyReturnModal=activeModal;
    if(pendingWhyReturnModal) pendingWhyReturnModal.hidden=true;
    $('whyActionLabel').textContent=`“${describeAction(target)}”`;
    $('whyReason').value=''; $('whyCount').textContent=whyCount;
    $('modalBackdrop').hidden=false; $('whyModal').hidden=false; activeModal=$('whyModal');
    setTimeout(()=>$('whyReason').focus(),0);
  }
  document.addEventListener('click',event=>{
    if(automationMode) return;
    const target=event.target.closest('button, a[href], [role="switch"], .interest-chip');
    if(!target || target.closest('[data-why-exempt]') || target.disabled) return;
    if(whyReplayTarget===target){ whyReplayTarget=null; return; }
    event.preventDefault(); event.stopImmediatePropagation(); askWhy(target);
  },true);
  $('whyForm').addEventListener('submit',event=>{
    event.preventDefault();
    const reason=$('whyReason').value.trim(); if(reason.length<3) return;
    const target=pendingWhyTarget; whyCount+=1; $('whyCount').textContent=whyCount;
    $('whyModal').hidden=true;
    if(pendingWhyReturnModal){ pendingWhyReturnModal.hidden=false; activeModal=pendingWhyReturnModal; }
    else { activeModal=null; $('modalBackdrop').hidden=true; }
    pendingWhyTarget=null; pendingWhyReturnModal=null;
    if(target && target.isConnected){ whyReplayTarget=target; target.click(); }
  });

  document.querySelectorAll('[data-close-modal]').forEach(button=>button.addEventListener('click',closeModal));
  $('modalBackdrop').addEventListener('click',closeModal);
  document.addEventListener('keydown',event=>{ if(event.key==='Escape'){ if(activeModal)closeModal(); else closePopovers(); } });
  document.addEventListener('click',event=>{ if(!event.target.closest('.popover-wrap')) closePopovers(); });

  renderLanguageList(); renderAll();
})();
