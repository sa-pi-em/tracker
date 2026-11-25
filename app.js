(() => {
  'use strict';
  const STORE_KEY = 'fieldnote-engineering-prep-v1';
  const CLOUD_AUTH_KEY = 'fieldnote-supabase-session-v1';
  const DEFAULT_EXAM_DATES = { gate:'2027-02-06', ese:'2027-01-31' };
  const DEFAULT_WHEEL = [
    'Kirchhoff’s laws', 'Fourier transforms', 'MOSFET circuits', 'Control-system stability',
    'Digital modulation', 'Maxwell equations', 'Engineering aptitude', 'Past-paper revision'
  ];
  const DAILY_RATINGS = [
    { value:'satisfied', label:'Very satisfied', className:'rating-satisfied', mark:'✓' },
    { value:'average', label:'Average', className:'rating-average', mark:'~' },
    { value:'bad', label:'Very bad', className:'rating-bad', mark:'!' }
  ];
  const PREP_THEMES = {
    starting:{label:'LAUNCH / BUILD YOUR FIRST SIGNAL',headline:'You’ve begun; the next step is already possible.',sidebar:'A beginning worth backing.',quietQuotes:['Showing up today is already a win.','You don’t need a perfect streak to make a strong comeback.','Every strong preparation began with a first step.','This start counts; keep showing up and progress will follow.','You’re building a future answer one quiet session at a time.','Your effort today is proof that you haven’t given up.']},
    building:{label:'FOUNDATIONS / STEADY WORK IS TAKING ROOT',headline:'Your repeatable study days are building strength.',sidebar:'Foundations in motion.',quietQuotes:['The days you return to your desk are shaping your result.','Your effort is becoming a rhythm, and rhythm becomes strength.','Every chapter you face makes the exam feel more familiar.','You’re further along than the version of you who first began.','Consistency is quietly turning work into confidence.','One day at a time, the syllabus is becoming yours.']},
    surge:{label:'MOMENTUM / YOUR RECENT RHYTHM IS RISING',headline:'Your study rhythm is gaining speed.',sidebar:'Momentum is building.',quietQuotes:['Look at the rhythm you’ve built; you earned this momentum.','Your hard work is starting to sound like confidence.','Keep your spark; this is what progress feels like.','Every return to the desk is making your goal more real.','Your effort is becoming difficult to ignore.','You’re showing yourself what steady commitment can do.']},
    mastery:{label:'CONSOLIDATION / TURN COVERAGE INTO COMMAND',headline:'You’re turning syllabus coverage into exam readiness.',sidebar:'Practice into mastery.',quietQuotes:['You’ve covered a lot; your preparation is ready to meet the exam.','Every completed topic is a promise you kept to yourself.','You’ve made the difficult familiar. Keep believing that.','Your preparation is adding up, one page at a time.','You’re becoming the engineer who can stay calm and solve.','You’ve earned the confidence to keep moving forward.']},
    checkpoint:{label:'CHECKPOINT / STRENGTHEN THE MIDDLE',headline:'Half the syllabus is behind you; keep the momentum yours.',sidebar:'Checkpoint reached.',quietQuotes:['Halfway is not a wall; it’s proof you’re already moving.','Look how far you’ve come. The next stretch is within reach.','Big goals get smaller each time you show up.','Your effort is carrying you through the middle miles.','You don’t have to finish today; just keep believing you can continue.','The syllabus is shrinking because you keep showing up.']},
    'final-stretch':{label:'FINAL STRETCH / SHARPEN WHAT YOU KNOW',headline:'The finish line is close; trust how far you’ve come.',sidebar:'Final stretch.',quietQuotes:['The finish is in view. Trust the work you’ve put in.','You’ve come this far; every focused day brings you closer.','Your preparation has depth. Let your confidence catch up.','You are closer than the first day you started.','Every revision is a vote for the result you want.','You have done hard things to get here. Keep going.','The last stretch is yours to shape.']},
    recovery:{label:'RESET / RECOVER, THEN RETURN',headline:'One difficult stretch cannot erase how far you’ve come.',sidebar:'Recover and return.',quietQuotes:['A slow chapter is still part of the story. You can begin again.','Your progress is not erased by one difficult day.','You can be proud of the effort it took to return.','You are allowed to pause, and still be committed.','One hard week does not decide the result.','You’ve made it through every difficult study day so far.','A fresh start is already a kind of progress.']}
  };
  const FIRST_BLOCK_QUOTES = ['Showing up is the first win of the day.','The first minutes are hardest; you crossed them by beginning.','One small start can turn into a day you’re proud of.','Your goal is not far from the person you are becoming.','Every session starts with this one choice: begin.','You’re here. That is how progress starts.'];
  const FOCUS_HOUR_QUOTES = ['One hour of effort: a promise kept to your future self.','Your focus is building the confidence you want to feel.','Every hour invested is another step toward exam day.','You’re proving your commitment to yourself, one hour at a time.','Your preparation is stronger than it was an hour ago.','You’re doing the hard part: staying with your goal.','That hour counts; your future self is already benefiting.','You are more prepared now than you were an hour ago.','Your effort is adding up, even when progress feels quiet.','Keep going: this hour belongs to your goal.','One more hour of focus is one more reason to believe.','You can be proud of the effort you gave this hour.'];
  const BREAK_QUOTES = ['Two focused hours: stand, drink water, and take 5–10 minutes away from your screen.','Four hours logged: take a proper 15–20 minute break before another block.','Six hours is a long study day. Refuel, stretch, and consider winding down.','Pause the timer and give your eyes a screen-free break.','Take a brief walk; movement can make the next block feel clearer.','Refuel before a timed set, then return only if your attention feels fresh.','Use the break to move and rest, not to scroll through another feed.','If focus is fading, call today’s study complete and rest.','Step away for lunch; a rested mind can make the afternoon block sharper.','After a long stretch, take a screen-free pause and reset your posture.','Check in with your energy before deciding to start another block.','A full study day needs recovery too; close the books when focus is gone.'];
  const content = document.getElementById('content');
  const state = loadState();
  const TOTAL_SYLLABUS_TOPICS = Object.values(window.SYLLABI).reduce((sum,course)=>sum+course.chapters.reduce((count,chapter)=>count+chapter.topics.length,0),0);
  const cloudConfig = window.SUPABASE_CONFIG || {};
  const cloudBase = String(cloudConfig.url || '').trim().replace(/\/+$/, '');
  const cloudKey = String(cloudConfig.publishableKey || '').trim();
  let cloudAuth = loadCloudAuth();
  let cloudUser = null;
  let cloudSyncTimer = null;
  let cloudSyncChain = Promise.resolve();
  let cloudSaveVersion = 0;
  let cloudSyncReadyUserId = '';
  let applyingCloudData = false;
  let pendingCloudChoice = null;
  let confirmingCloudReplace = false;
  let authMode = 'signin';
  let activePage = 'overview';
  let activeCourse = 'gate';
  let calendarMonth = new Date();
  let calendarSelectedDate = localKey(new Date());
  let prepThemeDate = localKey(new Date());
  let syllabusFilter = 'All sections';
  let showAllSessions = false;
  let wheelRotation = 0;
  let spinLocked = false;
  let toastTimer;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return {
        progress: saved.progress && typeof saved.progress === 'object' ? saved.progress : {},
        sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
        timer: saved.timer && Number.isFinite(saved.timer.startedAt) ? saved.timer : null,
        wheelTopics: Array.isArray(saved.wheelTopics) ? saved.wheelTopics.filter(x => typeof x === 'string') : DEFAULT_WHEEL.slice(),
        examDates: { ...DEFAULT_EXAM_DATES, ...(saved.examDates && typeof saved.examDates === 'object' ? saved.examDates : {}) },
        dailyRatings: sanitizeDailyRatings(saved.dailyRatings),
        cloudUserId: typeof saved.cloudUserId === 'string' ? saved.cloudUserId : '',
        cloudDirty: saved.cloudDirty === true
      };
    } catch (_) {
      return { progress: {}, sessions: [], timer: null, wheelTopics: DEFAULT_WHEEL.slice(), examDates: { ...DEFAULT_EXAM_DATES }, dailyRatings: {} };
    }
  }
  function sanitizeDailyRatings(source) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) return {};
    return Object.fromEntries(Object.entries(source).filter(([date, entry]) =>
      /^\d{4}-\d{2}-\d{2}$/.test(date) && DAILY_RATINGS.some(rating => rating.value === entry?.rating)
    ).map(([date, entry]) => [date, { rating:entry.rating, updatedAt:Number.isFinite(entry.updatedAt)?entry.updatedAt:0 }]));
  }
  function loadCloudAuth() {
    try { return JSON.parse(localStorage.getItem(CLOUD_AUTH_KEY) || 'null'); }
    catch (_) { return null; }
  }
  function storeCloudAuth() {
    try {
      if (cloudAuth) localStorage.setItem(CLOUD_AUTH_KEY, JSON.stringify(cloudAuth));
      else localStorage.removeItem(CLOUD_AUTH_KEY);
    } catch (_) {}
  }
  function cloudConfigured() { return !!(cloudBase && cloudKey); }
  function cloudAutoSyncReady() { return !!cloudUser&&(state.cloudUserId===cloudUser.id||cloudSyncReadyUserId===cloudUser.id); }
  function setCloudStatus(text, mode='') {
    const label=document.getElementById('cloud-status-text');if(label)label.textContent=text;
    const trigger=document.getElementById('cloud-trigger');if(trigger)trigger.className=`cloud-trigger ${mode}`.trim();
    const action=document.getElementById('cloud-trigger-action');if(action)action.textContent=cloudUser?'Account':'Connect';
  }
  function setCloudMessage(text, error=false) {
    const el=document.getElementById('cloud-message');if(!el)return;
    el.textContent=text;el.classList.toggle('error',!!error);
  }
  function updateCloudModal() {
    const choosingData=!!pendingCloudChoice;
    const switchingAccounts=choosingData&&pendingCloudChoice.switchingAccounts;
    const emptyTarget=switchingAccounts&&!pendingCloudChoice.remoteHasData;
    document.getElementById('cloud-setup-panel').hidden=cloudConfigured();
    document.getElementById('cloud-auth-panel').hidden=!cloudConfigured()||!!cloudUser||choosingData;
    document.getElementById('cloud-account-panel').hidden=!cloudUser||choosingData;
    document.getElementById('cloud-data-choice-panel').hidden=!choosingData||confirmingCloudReplace;
    document.getElementById('cloud-replace-confirm-panel').hidden=!choosingData||!confirmingCloudReplace;
    document.getElementById('cloud-dialog-title').textContent=choosingData?(switchingAccounts?'Switch tracker account?':'Choose which study data to keep.'):'Your progress, wherever you study.';
    document.querySelector('.cloud-intro').textContent=choosingData?(switchingAccounts?`This browser is linked to a different account. Choose how to use its saved copy with ${cloudUser?.email||'the account you just signed into'}.`:'Saved tracker data exists in this browser and in your account. Choose how to continue.'):'Sign in to sync this tracker across your devices. Your current browser data stays saved locally too.';
    if(choosingData){
      document.getElementById('cloud-choice-lead').textContent=emptyTarget?'This browser has saved data, but the account you signed into has no study data yet. Choose whether to start that account empty or copy this browser’s data into it.':switchingAccounts?'This browser’s tracker data belongs to a different account. Choose what to keep in the account you just signed into.':'Both copies contain saved tracker data. Choose how you want to continue.';
      document.getElementById('cloud-choice-note').textContent=emptyTarget?'The previous account’s cloud data stays unchanged. Download the browser copy below before starting this account empty if you may need it later.':switchingAccounts?'Merge or replace copies this browser’s data into the new account. The previous account’s cloud record stays unchanged. “Use account data” replaces this browser’s copy.':'Merge keeps completed checkmarks from either copy, combines sessions and wheel topics, and uses the account’s exam dates. “Use account data” replaces this browser’s tracker copy.';
      document.getElementById('cloud-replace-note').textContent=emptyTarget?'This will copy this browser’s tracker data into the account you just signed into. That account has no saved study data yet; the previous account’s cloud record stays unchanged.':switchingAccounts?'This overwrites the account you just signed into with this browser’s copy. The previous account’s cloud data stays unchanged.':'This will overwrite the signed-in account’s tracker data with this browser’s copy, and cannot be undone in the tracker. Choose “Merge both” to keep data from both copies.';
      document.getElementById('cloud-choice-merge').hidden=emptyTarget;
      document.getElementById('cloud-choice-account').textContent=emptyTarget?'Start with empty account':'Use account data';
      document.getElementById('cloud-choice-replace').textContent=emptyTarget?'Copy browser data into account':'Replace account data with this browser';
      document.getElementById('cloud-replace-confirm-heading').textContent=emptyTarget?'Copy browser data?':'Replace the account copy?';
      document.getElementById('cloud-choice-confirm-replace').textContent=emptyTarget?'Confirm and copy':'Confirm replacement';
    }
    document.getElementById('export-account-choice').hidden=!choosingData||!pendingCloudChoice.remoteExists;
    if(cloudUser)document.getElementById('cloud-account-email').textContent=cloudUser.email||'Signed-in account';
    setCloudMessage('');
  }
  function openCloudModal() {
    updateCloudModal();document.getElementById('cloud-modal').hidden=false;
    const focus=document.querySelector('#cloud-data-choice-panel:not([hidden]) [data-cloud-choice]:not([hidden]), #cloud-replace-confirm-panel:not([hidden]) [data-cloud-choice]:not([hidden]), #cloud-auth-panel:not([hidden]) input[name="email"]')||document.getElementById('cloud-close');focus.focus();
  }
  function closeCloudModal() { document.getElementById('cloud-modal').hidden=true; }
  async function responseData(response) {
    const text=await response.text();let data=null;
    if(text){try{data=JSON.parse(text);}catch(_){data={message:text};}}
    if(!response.ok){const detail=data?.msg||data?.message||data?.error_description||data?.error||`Request failed (${response.status})`;throw new Error(detail);}
    return data;
  }
  async function authRequest(path, body) {
    const response=await fetch(`${cloudBase}/auth/v1${path}`,{method:'POST',headers:{apikey:cloudKey,'Content-Type':'application/json'},body:JSON.stringify(body)});
    return responseData(response);
  }
  async function refreshCloudAuth() {
    if(!cloudAuth?.refresh_token)throw new Error('Your session expired. Please sign in again.');
    const refreshed=await authRequest('/token?grant_type=refresh_token',{refresh_token:cloudAuth.refresh_token});
    cloudAuth={...refreshed,expiresAt:Date.now()+Number(refreshed.expires_in||3600)*1000};storeCloudAuth();
    if(refreshed.user)cloudUser=refreshed.user;
    return cloudAuth.access_token;
  }
  async function validAccessToken() {
    if(!cloudAuth?.access_token)throw new Error('Sign in to sync your data.');
    if(!cloudAuth.expiresAt||cloudAuth.expiresAt<Date.now()+60000)await refreshCloudAuth();
    return cloudAuth.access_token;
  }
  async function cloudRequest(path, options={}, retry=true) {
    const token=await validAccessToken();
    const headers={apikey:cloudKey,Authorization:`Bearer ${token}`,...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})};
    const response=await fetch(`${cloudBase}${path}`,{...options,headers});
    if(response.status===401&&retry){await refreshCloudAuth();return cloudRequest(path,options,false);}
    return responseData(response);
  }
  function cloudSnapshot(source=state) {
    return {progress:source.progress||{},sessions:source.sessions||[],timer:source.timer||null,wheelTopics:source.wheelTopics||[],examDates:source.examDates||{...DEFAULT_EXAM_DATES},dailyRatings:sanitizeDailyRatings(source.dailyRatings)};
  }
  function hasStudyData(source) {
    const dates=source.examDates||{};
    const hasCustomDate=Object.keys(DEFAULT_EXAM_DATES).some(key=>dates[key]&&dates[key]!==DEFAULT_EXAM_DATES[key]);
    const hasCompletedLevels=Object.values(source.progress||{}).some(bits=>Array.isArray(bits)&&bits.some(Boolean));
    return hasCompletedLevels||(source.sessions||[]).length>0||!!source.timer||Object.keys(source.dailyRatings||{}).length>0||hasCustomDate||
      JSON.stringify(source.wheelTopics||DEFAULT_WHEEL)!==JSON.stringify(DEFAULT_WHEEL);
  }
  function hasLocalStudyData() { return hasStudyData(state); }
  function copyStudyData(source) { return JSON.parse(JSON.stringify(cloudSnapshot(source))); }
  function emptyStudyData() { return {progress:{},sessions:[],timer:null,wheelTopics:DEFAULT_WHEEL.slice(),examDates:{...DEFAULT_EXAM_DATES},dailyRatings:{}}; }
  function requestCloudDataChoice(remote, switchingAccounts=false, remoteExists=true) {
    pendingCloudChoice={local:copyStudyData(state),remote:copyStudyData(remote),userId:cloudUser.id,switchingAccounts,remoteExists,remoteHasData:hasStudyData(remote)};
    confirmingCloudReplace=false;setCloudStatus('Choose data','');updateCloudModal();document.getElementById('cloud-modal').hidden=false;
    document.querySelector(pendingCloudChoice.remoteHasData?'#cloud-data-choice-panel [data-cloud-choice="merge"]':'#cloud-data-choice-panel [data-cloud-choice="account"]')?.focus();return false;
  }
  function mergeStudyData(local, remote) {
    const progress={...(local.progress||{}),...(remote.progress||{})};
    for(const [key,remoteBits] of Object.entries(remote.progress||{})){
      if(Array.isArray(local.progress?.[key])&&Array.isArray(remoteBits)){
        progress[key]=[0,1,2].map(i=>!!local.progress[key][i]||!!remoteBits[i]);
      }
    }
    const sessions=new Map();
    [...(local.sessions||[]),...(remote.sessions||[])].forEach((session,index)=>{
      const id=session.id||`${session.date||'day'}-${session.createdAt||index}`;sessions.set(id,{...session,id});
    });
    const wheelTopics=[...new Map([...(local.wheelTopics||[]),...(remote.wheelTopics||[])].map(topic=>[String(topic).toLowerCase(),topic])).values()];
    const dailyRatings=sanitizeDailyRatings(local.dailyRatings);
    for(const [date,entry] of Object.entries(sanitizeDailyRatings(remote.dailyRatings))){
      if(!dailyRatings[date]||entry.updatedAt>=dailyRatings[date].updatedAt)dailyRatings[date]=entry;
    }
    return {progress,sessions:[...sessions.values()],timer:local.timer||remote.timer||null,wheelTopics,examDates:{...local.examDates,...remote.examDates},dailyRatings};
  }
  function applyCloudSnapshot(snapshot, userId, dirty=false) {
    applyingCloudData=true;
    state.progress=snapshot.progress&&typeof snapshot.progress==='object'?snapshot.progress:{};
    state.sessions=Array.isArray(snapshot.sessions)?snapshot.sessions:[];
    state.timer=snapshot.timer&&Number.isFinite(snapshot.timer.startedAt)?snapshot.timer:null;
    state.wheelTopics=Array.isArray(snapshot.wheelTopics)?snapshot.wheelTopics:DEFAULT_WHEEL.slice();
    state.examDates={...DEFAULT_EXAM_DATES,...(snapshot.examDates||{})};
    state.dailyRatings=sanitizeDailyRatings(snapshot.dailyRatings);
    state.cloudUserId=userId;state.cloudDirty=dirty;
    try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(_){}
    applyingCloudData=false;
  }
  async function uploadCloudSnapshot(version=cloudSaveVersion) {
    if(!cloudUser||!cloudConfigured()||version!==cloudSaveVersion)return;
    setCloudStatus('Syncing…','syncing');
    await cloudRequest(`/rest/v1/study_data?on_conflict=user_id`,{
      method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({user_id:cloudUser.id,data:cloudSnapshot(),updated_at:new Date().toISOString()})
    });
    if(version===cloudSaveVersion){state.cloudUserId=cloudUser.id;state.cloudDirty=false;try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(_){};setCloudStatus('Cloud synced','connected');}
    else scheduleCloudSave();
  }
  function scheduleCloudSave() {
    if(!cloudUser||!cloudAutoSyncReady()||applyingCloudData||pendingCloudChoice)return;
    cloudSaveVersion++;const version=cloudSaveVersion;clearTimeout(cloudSyncTimer);setCloudStatus('Saving…','syncing');
    cloudSyncTimer=setTimeout(()=>{cloudSyncChain=cloudSyncChain.then(()=>uploadCloudSnapshot(version)).catch(error=>{setCloudStatus('Local copy saved','');setCloudMessage(error.message,true);});},800);
  }
  async function synchronizeCloud() {
    if(!cloudUser||!cloudConfigured())return true;
    if(pendingCloudChoice)return false;
    clearTimeout(cloudSyncTimer);const syncVersion=++cloudSaveVersion;
    setCloudStatus('Syncing…','syncing');
    const path=`/rest/v1/study_data?select=data,updated_at&user_id=eq.${encodeURIComponent(cloudUser.id)}&limit=1`;
    const rows=await cloudRequest(path);
    if(syncVersion!==cloudSaveVersion)return true;
    const switchingAccounts=!!state.cloudUserId&&state.cloudUserId!==cloudUser.id;
    cloudSyncReadyUserId=cloudUser.id;
    const remote=Array.isArray(rows)&&rows.length?rows[0].data:null;
    if(!remote){
      if(switchingAccounts&&hasLocalStudyData())return requestCloudDataChoice(emptyStudyData(),true,false);
      applyCloudSnapshot(cloudSnapshot(),cloudUser.id,true);
      await uploadCloudSnapshot(cloudSaveVersion);
      render();return true;
    }
    if(switchingAccounts&&hasLocalStudyData())return requestCloudDataChoice(remote,true,true);
    if(state.cloudUserId===cloudUser.id&&state.cloudDirty){
      applyCloudSnapshot(cloudSnapshot(),cloudUser.id,true);
      await uploadCloudSnapshot(cloudSaveVersion);
    }else if(hasLocalStudyData()&&state.cloudUserId!==cloudUser.id){
      if(hasStudyData(remote)){
        return requestCloudDataChoice(remote);
      }
      applyCloudSnapshot(cloudSnapshot(),cloudUser.id,true);
      await uploadCloudSnapshot(cloudSaveVersion);
    }else{
      applyCloudSnapshot(remote,cloudUser.id,false);
      setCloudStatus('Cloud synced','connected');
    }
    render();
    return true;
  }
  async function resolveCloudChoice(choice) {
    if(!pendingCloudChoice||!cloudUser||pendingCloudChoice.userId!==cloudUser.id)return;
    if(choice==='replace'){
      confirmingCloudReplace=true;updateCloudModal();document.querySelector('#cloud-replace-confirm-panel [data-cloud-choice="confirm-replace"]')?.focus();return;
    }
    if(choice==='cancel-replace'){
      confirmingCloudReplace=false;updateCloudModal();document.querySelector('#cloud-data-choice-panel [data-cloud-choice="replace"]')?.focus();return;
    }
    if(choice==='cancel-switch'){
      pendingCloudChoice=null;confirmingCloudReplace=false;await signOutCloud();closeCloudModal();toast('Switch cancelled. This browser copy is unchanged.');return;
    }
    const pending=pendingCloudChoice;
    try{
      if(choice==='account'){
        applyCloudSnapshot(pending.remote,cloudUser.id,false);
        setCloudStatus(pending.remoteExists?'Cloud synced':'Cloud connected','connected');
        render();
      }else if(choice==='merge'){
        applyCloudSnapshot(mergeStudyData(pending.local,pending.remote),cloudUser.id,true);await uploadCloudSnapshot(cloudSaveVersion);render();
      }else if(choice==='confirm-replace'){
        applyCloudSnapshot(pending.local,cloudUser.id,true);await uploadCloudSnapshot(cloudSaveVersion);render();
      }else return;
      pendingCloudChoice=null;confirmingCloudReplace=false;updateCloudModal();closeCloudModal();
      toast(choice==='account'?'Using your account data.':choice==='merge'?'Local and account data merged.':'Account data replaced with this browser copy.');
    }catch(error){setCloudMessage(`Could not finish syncing. Your browser data is still saved. ${error.message}`,true);}
  }
  async function initializeCloudSession() {
    if(!cloudConfigured()){setCloudStatus('Local only','');return;}
    if(!cloudAuth?.access_token){setCloudStatus('Connect to sync','');return;}
    try{
      await validAccessToken();
      cloudUser=await cloudRequest('/auth/v1/user');
      if(!cloudUser?.id)throw new Error('Could not restore your account session.');
      setCloudStatus('Cloud connected','connected');
      await synchronizeCloud();
    }catch(error){
      if(String(error.message).includes('linked to a different account')){cloudUser=null;cloudAuth=null;storeCloudAuth();setCloudStatus('Connect to sync','');}
      else setCloudStatus(cloudUser?'Sync needs attention':'Connect to sync',cloudUser?'':'');
      if(activePage==='overview')toast(`Cloud sync needs attention: ${error.message}`);
    }
  }
  function setAuthMode(mode) {
    authMode=mode;
    document.querySelectorAll('[data-cloud-mode]').forEach(button=>button.classList.toggle('active',button.dataset.cloudMode===mode));
    const submit=document.getElementById('cloud-auth-submit');
    submit.textContent=mode==='signup'?'Create account':'Sign in';
    document.querySelector('#cloud-auth-form input[name="password"]').autocomplete=mode==='signup'?'new-password':'current-password';
    setCloudMessage('');
  }
  async function submitCloudAuth(form) {
    if(!cloudConfigured()){setCloudMessage('Add your Supabase URL and publishable key to backend-config.js first.',true);return;}
    const formData=new FormData(form);const email=String(formData.get('email')||'').trim();const password=String(formData.get('password')||'');
    const submit=document.getElementById('cloud-auth-submit');submit.disabled=true;submit.textContent=authMode==='signup'?'Creating…':'Signing in…';
    try{
      const data=authMode==='signup'
        ? await authRequest('/signup',{email,password})
        : await authRequest('/token?grant_type=password',{email,password});
      if(!data.access_token){
        setAuthMode('signin');setCloudMessage('Account created. Check your email to confirm, then sign in here.');return;
      }
      const user=data.user;
      cloudAuth={...data,expiresAt:Date.now()+Number(data.expires_in||3600)*1000};cloudUser=user;storeCloudAuth();
      form.reset();
      updateCloudModal();setCloudStatus('Cloud connected','connected');setCloudMessage('Signed in. Syncing your study data…');
      const synced=await synchronizeCloud();if(synced){closeCloudModal();toast('Cloud sync is connected.');}
    }catch(error){setCloudMessage(error.message||'Sign-in failed. Please try again.',true);}
    finally{submit.disabled=false;submit.textContent=authMode==='signup'?'Create account':'Sign in';}
  }
  async function signOutCloud() {
    try{if(cloudAuth?.access_token&&cloudConfigured())await cloudRequest('/auth/v1/logout',{method:'POST'});}catch(_){}
    cloudAuth=null;cloudUser=null;cloudSyncReadyUserId='';pendingCloudChoice=null;confirmingCloudReplace=false;storeCloudAuth();setCloudStatus(cloudConfigured()?'Connect to sync':'Local only','');
    if(state.cloudUserId){state.cloudDirty=true;try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(_){}}
    updateCloudModal();setCloudMessage('Signed out. This browser copy remains saved locally.');
  }
  async function manualCloudSync() {
    const button=document.getElementById('cloud-sync-now');button.disabled=true;button.textContent='Syncing…';
    try{const synced=await synchronizeCloud();if(synced)setCloudMessage('Your tracker is up to date.');}
    catch(error){setCloudStatus('Sync needs attention','');setCloudMessage(error.message||'Sync failed. Your local copy is still saved.',true);}
    finally{button.disabled=false;button.textContent='↻ Sync now';}
  }
  function saveState() {
    if (pendingCloudChoice) pendingCloudChoice.local=copyStudyData(state);
    updatePrepTheme();
    if (cloudUser && !applyingCloudData && !pendingCloudChoice && cloudAutoSyncReady()) {
      state.cloudUserId = cloudUser.id;
      state.cloudDirty = true;
    }
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      const status = document.getElementById('save-status-text');
      if (status) status.textContent = 'Saved on this device';
    } catch (_) {
      const status = document.getElementById('save-status-text');
      if (status) status.textContent = 'Storage is unavailable';
    }
    if (cloudUser && !applyingCloudData && !pendingCloudChoice && cloudAutoSyncReady()) scheduleCloudSave();
  }
  function esc(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
  }
  function localKey(date) {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function dateFromKey(key) { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d,12); }
  function prettyDate(date, options={weekday:'short', month:'short', day:'numeric'}) {
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  }
  function getTopics(courseId) {
    return window.SYLLABI[courseId].chapters.flatMap(ch => ch.topics.map((label,index) => ({
      key: `${courseId}:${ch.id}:${index}`, courseId, chapter:ch, index, label
    })));
  }
  function bitsFor(topic) {
    const bits = state.progress[topic.key];
    return Array.isArray(bits) ? [!!bits[0],!!bits[1],!!bits[2]] : [false,false,false];
  }
  function getStats(courseId) {
    const chapters = window.SYLLABI[courseId].chapters;
    let count = 0;
    const levelDone = [0,0,0];
    const chapter = {};
    chapters.forEach(ch => {
      const nums = [0,0,0];
      ch.topics.forEach((label,index) => {
        const bits = bitsFor({key:`${courseId}:${ch.id}:${index}`});
        count++;
        bits.forEach((done,level) => { if (done) { levelDone[level]++; nums[level]++; } });
      });
      chapter[ch.id] = { total:ch.topics.length, done:nums, pct:nums.map(n => ch.topics.length ? Math.round(n/ch.topics.length*100) : 0) };
    });
    return { count, levelDone, levelPct:levelDone.map(n => count ? Math.round(n/count*100) : 0), totalPct:count ? Math.round(levelDone.reduce((a,b)=>a+b,0)/(count*3)*100) : 0, chapter };
  }
  function allStats() {
    const gate = getStats('gate'); const ese = getStats('ese');
    const total = gate.count + ese.count;
    const done = gate.levelDone.map((v,i)=>v+ese.levelDone[i]);
    return { courses:{gate,ese}, count:total, levelDone:done, levelPct:done.map(n=>total?Math.round(n/total*100):0), totalPct:total?Math.round(done.reduce((a,b)=>a+b,0)/(total*3)*100):0 };
  }
  function fmtHours(minutes) { const val = minutes / 60; return Number.isInteger(val) ? `${val}h` : `${val.toFixed(1)}h`; }
  function fmtSessionDuration(minutes) { const value=Math.max(0,Math.round(Number(minutes)||0));const hours=Math.floor(value/60),mins=value%60;return hours?`${hours}h${mins?` ${mins}m`:''}`:`${mins}m`; }
  function totalMinutes() { return state.sessions.reduce((sum,s)=>sum+(Number(s.minutes)||0),0); }
  function minutesFor(key) { return state.sessions.filter(s=>s.date===key).reduce((sum,s)=>sum+(Number(s.minutes)||0),0); }
  function courseMinutes(courseId) { return state.sessions.filter(s=>s.course===courseId).reduce((sum,s)=>sum+(Number(s.minutes)||0),0); }
  function studyStreak() {
    let key = localKey(new Date());
    if (!minutesFor(key)) { const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1); key = localKey(yesterday); }
    let count = 0;
    while (minutesFor(key) > 0 && count < 365) { count++; const d = dateFromKey(key); d.setDate(d.getDate()-1); key = localKey(d); }
    return count;
  }
  function weekDays() {
    const today = new Date(); const days=[];
    for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);const key=localKey(d);days.push({key,date:d,minutes:minutesFor(key)});}
    return days;
  }
  function prepClimate() {
    const today=localKey(new Date()),recentStart=new Date(),previousStart=new Date();
    recentStart.setDate(recentStart.getDate()-6);previousStart.setDate(previousStart.getDate()-13);
    const recentStartKey=localKey(recentStart),previousStartKey=localKey(previousStart),minutesByDay=new Map();let todaySessionCount=0,todayMinutes=0;
    state.sessions.forEach(session=>{if(typeof session.date!=='string'||session.date<previousStartKey||session.date>today)return;const minutes=Number(session.minutes)||0;minutesByDay.set(session.date,(minutesByDay.get(session.date)||0)+minutes);if(session.date===today){todaySessionCount++;todayMinutes+=minutes;}});
    const daysFor=(startOffset,endOffset)=>Array.from({length:endOffset-startOffset+1},(_,index)=>{const date=new Date();date.setDate(date.getDate()-(endOffset-index));const key=localKey(date);return {key,minutes:minutesByDay.get(key)||0};});
    const recentDays=daysFor(0,6),previousDays=daysFor(7,13),recentMinutes=recentDays.reduce((sum,day)=>sum+day.minutes,0),activeDays=recentDays.filter(day=>day.minutes>0).length;
    const previousMinutes=previousDays.reduce((sum,day)=>sum+day.minutes,0);
    const recentRatings=Object.entries(state.dailyRatings||{}).filter(([date])=>date>=recentDays[0].key&&date<=today).sort(([a],[b])=>b.localeCompare(a));
    const latestRating=recentRatings.length?recentRatings[0][1].rating:'';
    let ratingTotal=0,ratingWeight=0;
    recentRatings.forEach(([date,entry])=>{const dayIndex=recentDays.findIndex(day=>day.key===date),weight=dayIndex+1;ratingTotal+=(entry.rating==='satisfied'?1:entry.rating==='bad'?-1:0)*weight;ratingWeight+=weight;});
    const ratingBalance=ratingWeight?ratingTotal/ratingWeight:0;
    const completedLevels=Object.values(state.progress).reduce((sum,bits)=>sum+(Array.isArray(bits)?bits.filter(Boolean).length:0),0);
    const syllabusPct=TOTAL_SYLLABUS_TOPICS?Math.round(Math.min(completedLevels,TOTAL_SYLLABUS_TOPICS*3)/(TOTAL_SYLLABUS_TOPICS*3)*100):0;
    const syllabusStage=syllabusPct<20?'Foundations':syllabusPct<50?'Building':syllabusPct<80?'Consolidating':'Final review';
    const objectiveMomentum=(activeDays>=4&&recentMinutes>=180&&(previousMinutes===0||recentMinutes>=previousMinutes*.8))||(activeDays>=3&&recentMinutes>=240&&recentMinutes>previousMinutes*1.15);
    const goodMomentum=objectiveMomentum||(activeDays>=3&&recentMinutes>=120&&ratingBalance>=.25);
    const needsRecovery=latestRating==='bad'||ratingBalance<=-.3||(activeDays===0&&previousMinutes>=120);
    let mode;
    if(needsRecovery)mode='recovery';
    else if(syllabusPct>=80)mode='final-stretch';
    else if(goodMomentum&&syllabusPct>=50)mode='mastery';
    else if(goodMomentum)mode='surge';
    else if(syllabusPct>=50)mode='checkpoint';
    else if(activeDays>0||syllabusPct>0||latestRating==='satisfied'||latestRating==='average')mode='building';
    else mode='starting';
    const profile=PREP_THEMES[mode],seed=`${today}:${mode}`.split('').reduce((hash,char)=>(hash*31+char.charCodeAt(0))>>>0,7);
    const todayHours=Math.floor(todayMinutes/60);let quote=profile.quietQuotes[seed%profile.quietQuotes.length],quoteCue='RECENT PREP / 7-DAY REFLECTION';
    if(todaySessionCount&&todayHours===0){quote=FIRST_BLOCK_QUOTES[seed%FIRST_BLOCK_QUOTES.length];quoteCue='TODAY / FIRST BLOCK';}
    else if(todaySessionCount&&todayHours>0&&todayHours%2===0){quote=BREAK_QUOTES[(seed+todayHours/2-1)%BREAK_QUOTES.length];quoteCue=`${todayHours} HOURS / BREAK CHECK`;}
    else if(todaySessionCount&&todayHours>0){quote=FOCUS_HOUR_QUOTES[(seed+Math.floor((todayHours-1)/2))%FOCUS_HOUR_QUOTES.length];quoteCue=`${todayHours} ${todayHours===1?'HOUR':'HOURS'} / FOCUS CHECK`;}
    const latestLabel=DAILY_RATINGS.find(rating=>rating.value===latestRating)?.label;
    const detail=`${todaySessionCount?`Today: ${fmtSessionDuration(todayMinutes)}`:'No sessions today'} · Week: ${activeDays} days / ${fmtSessionDuration(recentMinutes)} · Syllabus: ${syllabusPct}% ${syllabusStage} · ${latestLabel?`Review: ${latestLabel}`:'No review this week'}.`;
    return {mode,label:profile.label,headline:profile.headline,quote,quoteCue,sidebar:profile.sidebar,detail};
  }
  function updatePrepTheme() {
    const climate=prepClimate();
    document.documentElement.dataset.prepMood=climate.mode;
    const motto=document.getElementById('prep-motto-line'),mottoDetail=document.getElementById('prep-motto-quote');
    if(motto)motto.textContent=climate.sidebar;
    if(mottoDetail)mottoDetail.textContent=climate.quote;
    return climate;
  }
  function levelBars(courseId, stats) {
    return `<div class="level-bars">${['L1','L2','L3'].map((level,i)=>`<div class="level-item"><div class="level-bar-label"><span>${level}</span><b data-course-progress="${courseId}" data-level="${i}">${stats.levelPct[i]}%</b></div><div class="bar-track"><div class="bar-fill" data-course-bar="${courseId}" data-level="${i}" style="width:${stats.levelPct[i]}%"></div></div></div>`).join('')}</div>`;
  }
  function weekChart() {
    const days=weekDays(); const max=Math.max(60,...days.map(d=>d.minutes));
    return `<div class="week-chart">${days.map((day,i)=>`<div class="week-col ${i===6?'today':''}"><span class="week-hours">${day.minutes?fmtHours(day.minutes):' '}</span><div class="week-bar-wrap"><div class="week-bar" style="--h:${Math.max(3,day.minutes/max*100)}%"></div></div><span class="week-day">${prettyDate(day.date,{weekday:'narrow'})}</span></div>`).join('')}</div>`;
  }
  function countdownParts(courseId) {
    const date=state.examDates[courseId]||DEFAULT_EXAM_DATES[courseId];
    const [year,month,day]=date.split('-').map(Number);
    const target=new Date(year,month-1,day).getTime();
    const seconds=Math.max(0,Math.floor((target-Date.now())/1000));
    return { date, seconds, days:Math.floor(seconds/86400), hours:Math.floor(seconds%86400/3600), minutes:Math.floor(seconds%3600/60), secs:seconds%60 };
  }
  function renderCountdownCard(courseId) {
    const gate=courseId==='gate';const countdown=countdownParts(courseId);
    const title=gate?'GATE EC':'UPSC ESE E&T';
    const context=gate?'EXAM WINDOW OPENS':'PRELIMS · PAPER I & II';
    const date=prettyDate(dateFromKey(countdown.date),{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    const href=gate?'https://gate2027.iitm.ac.in/important_dates':'https://www.upsc.gov.in/active-examinations/engineering-services-preliminary-examination-2027/';
    return `<article class="countdown-card ${gate?'countdown-gate':'countdown-ese'}"><div class="countdown-card-top"><span class="countdown-tag">${context}</span><a href="${href}" target="_blank" rel="noopener" aria-label="Official ${esc(title)} exam date information">↗</a></div><h3>${title}</h3><p class="countdown-date">${esc(date)}</p><div class="countdown-clock" data-countdown="${courseId}"><strong data-countdown-days>${String(countdown.days).padStart(3,'0')}</strong><span class="countdown-unit">DAYS</span><span class="countdown-time"><b data-countdown-hours>${String(countdown.hours).padStart(2,'0')}</b><i>:</i><b data-countdown-minutes>${String(countdown.minutes).padStart(2,'0')}</b><i>:</i><b data-countdown-seconds>${String(countdown.secs).padStart(2,'0')}</b></span></div><div class="countdown-foot">${gate?'GATE 2027 window starts 6 Feb; EC slot is not announced yet.':'Official UPSC Preliminary exam date.'}</div></article>`;
  }
  function courseProgressCard(courseId) {
    const course=window.SYLLABI[courseId], stats=getStats(courseId);
    return `<article class="course-progress"><div class="course-progress-top"><div class="course-id"><span class="exam-sigil ${courseId==='gate'?'gate-sigil':'ese-sigil'}">${course.sigil}</span><span><b>${esc(course.short)}</b><small>${courseId==='gate'?'Electronics & Communication':'Prelims · E&T'}</small></span></div><span class="course-total" data-course-total="${courseId}">${stats.totalPct}% total</span></div>${levelBars(courseId,stats)}</article>`;
  }
  function renderOverview(climate=prepClimate()) {
    const stats=allStats(); const today=minutesFor(localKey(new Date()));
    const fullyDone=Object.keys(state.progress).filter(k=>state.progress[k]?.length===3&&state.progress[k].every(Boolean)).length;
    content.innerHTML=`
      <section class="hero-card">
        <div class="hero-copy"><div class="hero-kicker">${climate.label}</div><h1 class="hero-title">${climate.headline}</h1><div class="quote-cue">${climate.quoteCue}</div><blockquote class="hero-quote">“${climate.quote}”</blockquote><p class="prep-reason">${climate.detail}</p><button class="btn" data-go="syllabus">Open syllabus tracker <span>↗</span></button></div>
        <div class="hero-visual"><div class="hero-radar"><span class="radar-cross"></span><span class="radar-h"></span><span class="radar-sweep"></span><span class="radar-point"></span><span class="radar-label one">FOCUS / 01</span><span class="radar-label two">REPEAT / 03</span></div></div>
      </section>
      <section class="countdown-section"><div class="panel-heading"><div><h2>Exam countdowns</h2><p>Stay close to the dates that matter.</p></div><span class="countdown-mark">2027 / TARGETS</span></div><div class="countdown-grid">${renderCountdownCard('gate')}${renderCountdownCard('ese')}</div><details class="countdown-settings"><summary>Adjust countdown dates</summary><form id="exam-dates-form"><label><span class="field-label">GATE EC TARGET DATE</span><input class="input" type="date" name="gateDate" value="${esc(state.examDates.gate)}" required><small>Default is the first GATE 2027 exam-window day. Change this to your EC slot when its timetable is published.</small></label><label><span class="field-label">UPSC ESE PRELIMS DATE</span><input class="input" type="date" name="eseDate" value="${esc(state.examDates.ese)}" required><small>Default uses the official UPSC ESE Preliminary date.</small></label><button class="btn btn-primary" type="submit">Save countdown dates</button></form></details></section>
      <section class="stats-grid">
        <article class="stat-card"><div class="stat-label">STUDIED TODAY <span class="stat-icon">◷</span></div><div class="stat-value">${fmtSessionDuration(today)}</div><div class="stat-note">${today?'Across both preparation tracks':'A clean page to begin'}</div></article>
        <article class="stat-card"><div class="stat-label">ALL-TIME STUDY <span class="stat-icon">↗</span></div><div class="stat-value">${fmtSessionDuration(totalMinutes())}</div><div class="stat-note">Across both preparation tracks</div></article>
        <article class="stat-card"><div class="stat-label">STREAK <span class="stat-icon">✳</span></div><div class="stat-value">${studyStreak()} <span style="font-size:13px;color:#8c9b97">days</span></div><div class="stat-note">Consecutive study days</div></article>
        <article class="stat-card"><div class="stat-label">THIRD-PASS READY <span class="stat-icon">✓</span></div><div class="stat-value">${fullyDone}</div><div class="stat-note">Topics checked at all 3 levels</div></article>
      </section>
      <section class="overview-grid">
        <article class="panel"><div class="panel-heading"><div><h2>Syllabus pulse</h2><p>Level-wise completion across each exam</p></div><button class="text-link" data-go="syllabus">View chapters ↗</button></div><div class="course-progress-list">${courseProgressCard('gate')}${courseProgressCard('ese')}</div></article>
        <article class="panel week-panel"><div class="panel-heading"><div><h2>This week</h2><p>Your last seven days at a glance</p></div><button class="text-link" data-go="hours">Log time ↗</button></div><div class="week-total">${fmtSessionDuration(weekDays().reduce((a,d)=>a+d.minutes,0))} <small>logged this week</small></div>${weekChart()}<div class="week-caption"><span>Daily study time</span><span>Today highlighted in clay</span></div></article>
      </section>
      <section class="quick-grid"><button class="quick-card" data-go="hours"><span class="quick-icon">◷</span><h3>Start a focused session</h3><p>Use the timer or log a study block.</p></button><button class="quick-card" data-go="wheel"><span class="quick-icon">◉</span><h3>Pick your next topic</h3><p>Let the roulette break the tie.</p></button></section>`;
  }
  function renderSummaryLevels(courseId) {
    const stats=getStats(courseId);
    return `<div class="summary-levels">${['Level 1','Level 2','Level 3'].map((name,i)=>`<article class="summary-level" data-summary-course="${courseId}" data-level="${i}"><div class="summary-level-top"><span class="level-pill"><span class="level-dot"></span>${name.toUpperCase()}</span><span class="summary-value">${stats.levelPct[i]}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${stats.levelPct[i]}%"></div></div><div class="summary-caption">${stats.levelDone[i]} of ${stats.count} topics marked</div></article>`).join('')}</div>`;
  }
  function chapterPct(chapter, stats, level) { return stats.chapter[chapter.id].pct[level]; }
  function renderChapter(chapter, courseId, stats, idx, openFirst) {
    const cstat=stats.chapter[chapter.id];
    const rows=chapter.topics.map((topic,i)=>{
      const key=`${courseId}:${chapter.id}:${i}`; const bits=bitsFor({key});
      return `<div class="topic-row" data-topic-row data-topic-text="${esc(topic.toLowerCase())}"><div class="topic-label"><span class="topic-code">${String(i+1).padStart(2,'0')}</span>${esc(topic)}</div><div class="topic-checks">${bits.map((checked,level)=>`<label class="level-check" title="Mark ${esc(topic)} at Level ${level+1}"><input type="checkbox" data-check data-course="${courseId}" data-chapter="${chapter.id}" data-topic="${i}" data-level="${level}" ${checked?'checked':''} aria-label="${esc(topic)} — Level ${level+1}"><span>L${level+1}</span></label>`).join('')}</div></div>`;
    }).join('');
    return `<details class="chapter-card" data-chapter-card data-group="${esc(chapter.group)}" data-chapter="${chapter.id}" ${openFirst?'open':''}><summary class="chapter-summary"><div class="chapter-name"><span class="chapter-index">${String(idx+1).padStart(2,'0')}</span><span><h3>${esc(chapter.title)}</h3><p>${chapter.topics.length} syllabus topics · ${esc(chapter.group)}</p></span></div><div class="chapter-levels">${[0,1,2].map(level=>`<div class="chapter-level" data-chapter-progress="${courseId}:${chapter.id}:${level}"><div class="chapter-level-head"><span>L${level+1}</span><b>${chapterPct(chapter,stats,level)}%</b></div><div class="bar-track"><div class="bar-fill" style="width:${chapterPct(chapter,stats,level)}%"></div></div></div>`).join('')}</div><span class="chapter-chevron">⌄</span></summary><div class="topic-header"><span>CHECK OFF EACH TOPIC AS YOU REVISIT IT</span><span class="topic-level-heads"><span>LEVEL 1</span><span>LEVEL 2</span><span>LEVEL 3</span></span></div><div class="topic-list">${rows}</div></details>`;
  }
  function renderSyllabus() {
    const course=window.SYLLABI[activeCourse], stats=getStats(activeCourse);
    syllabusFilter='All sections';
    content.innerHTML=`<section class="page-head"><div><div class="eyebrow">SYLLABUS / ${activeCourse==='gate'?'GATE EC':'UPSC ESE E&T'}</div><h1>${esc(course.name)}</h1><p>${esc(course.subtitle)}. Every topic has three separate revision passes.</p></div><div class="head-actions"><a class="btn btn-secondary" href="${esc(course.sourceFile)}" target="_blank" rel="noopener">Official PDF ↗</a><button class="btn btn-secondary" data-export>⇩ Export backup</button><button class="btn btn-secondary" data-import>⇧ Import</button><input id="backup-file" type="file" accept="application/json,.json" hidden></div></section>
      <p class="pool-note" style="margin:-14px 0 18px">${esc(course.sourcePages)}${activeCourse==='gate'?' · The common 15-mark GA section is listed on the <a href="https://gate2027.iitm.ac.in/exam_papers_and_syllabus" target="_blank" rel="noopener" style="color:#14766b">GATE 2027 site</a>.':''}</p>
      ${renderSummaryLevels(activeCourse)}
      <section class="panel"><div class="panel-heading"><div><h2>Chapter progress</h2><p>Each bar shows the percentage of topics checked at that level.</p></div><div class="head-actions"><input class="search-box" id="syllabus-search" placeholder="Search topics…" aria-label="Search topics"></div></div>
      <div class="panel-heading" style="align-items:center;margin-top:-4px"><div class="section-switcher" id="syllabus-filters"><button class="active" data-filter="All sections">All sections</button>${course.groups.map(g=>`<button data-filter="${esc(g)}">${esc(g)}</button>`).join('')}</div><span style="font:10px var(--mono);color:#96a19d">${stats.count} topics / 3 levels</span></div>
      <div class="chapter-list" id="chapter-list">${course.chapters.map((chapter,i)=>renderChapter(chapter,activeCourse,stats,i,i===0)).join('')}</div><div class="no-results" id="no-results" hidden>No topics match that search.</div></section>`;
  }
  function renderTimerPanel() {
    const active=!!state.timer;
    const paused=active&&Number.isFinite(state.timer.pausedAt);
    const controls=active?`${paused?'<button class="btn btn-primary" data-resume-timer>▶ Resume</button>':'<button class="btn btn-primary" data-pause-timer>Ⅱ Pause</button>'}<button class="btn btn-secondary" data-stop-timer>■ Finish session</button>`:'<button class="btn btn-primary" data-start-timer>▶ Start studying</button>';
    const topic=active&&state.timer.topic?` · ${esc(state.timer.topic)}`:'';
    const timerMeta=active?(paused?`Paused · ${esc(window.SYLLABI[state.timer.course]?.short||'study')}${topic} · started ${prettyDate(new Date(state.timer.startedAt),{hour:'numeric',minute:'2-digit'})}`:`Tracking ${esc(window.SYLLABI[state.timer.course]?.short||'study')}${topic} since ${prettyDate(new Date(state.timer.startedAt),{hour:'numeric',minute:'2-digit'})}`):'Timer keeps running if you switch pages or refresh.';
    const topicField=active?'':`<label class="timer-topic-field"><span>STUDY TOPIC · OPTIONAL</span><input class="input" id="timer-topic" maxlength="90" list="timer-topic-options" placeholder="e.g. Fourier transforms"><datalist id="timer-topic-options">${state.wheelTopics.map(item=>`<option value="${esc(item)}">`).join('')}</datalist></label>`;
    return `<section class="timer-panel"><div class="timer-top"><h2>Focus timer</h2><span class="timer-state">${active?(paused?'SESSION PAUSED':'SESSION IN PROGRESS'):'READY WHEN YOU ARE'}</span></div><div class="timer-face" id="timer-face">${active?timerText():'00:00:00'}</div>${topicField}<div class="timer-actions">${controls}<button class="btn btn-secondary" data-go="wheel">Pick a topic ↗</button></div><div class="timer-meta">${timerMeta}</div></section>`;
  }
  function timerText() {
    if (!state.timer) return '00:00:00';
    const end=Number.isFinite(state.timer.pausedAt)?state.timer.pausedAt:Date.now();
    const sec=Math.max(0,Math.floor((end-state.timer.startedAt-(Number(state.timer.pausedMs)||0))/1000));
    return [Math.floor(sec/3600),Math.floor(sec%3600/60),sec%60].map(n=>String(n).padStart(2,'0')).join(':');
  }
  function pauseTimer() {
    if(!state.timer||Number.isFinite(state.timer.pausedAt))return;
    state.timer.pausedAt=Date.now();saveState();render();toast('Timer paused.');
  }
  function resumeTimer() {
    if(!state.timer||!Number.isFinite(state.timer.pausedAt))return;
    state.timer.pausedMs=(Number(state.timer.pausedMs)||0)+(Date.now()-state.timer.pausedAt);
    delete state.timer.pausedAt;saveState();render();toast('Timer resumed.');
  }
  function manualSessionForm() {
    return `<form class="session-form" id="session-form"><div class="form-row"><label><span class="field-label">EXAM TRACK</span><select class="select-control full" name="course"><option value="gate" ${activeCourse==='gate'?'selected':''}>GATE EC</option><option value="ese" ${activeCourse==='ese'?'selected':''}>UPSC ESE E&T</option><option value="both">Mixed / General</option></select></label><label><span class="field-label">DATE</span><input class="input" type="date" name="date" value="${localKey(new Date())}" required></label></div><div class="hours-fields"><label><span class="field-label">HOURS STUDIED</span><input class="input" type="number" min="0.1" max="24" step="0.1" name="hours" placeholder="e.g. 1.5" required></label><label><span class="field-label">WHAT DID YOU STUDY?</span><input class="input" name="note" maxlength="90" placeholder="Optional note"></label></div><button class="btn btn-primary" type="submit">＋ Add study time</button></form>`;
  }
  function renderStudyDays() {
    const days=weekDays().slice().reverse(); const max=Math.max(60,...days.map(d=>d.minutes));
    return days.map(d=>`<div class="study-day"><div class="study-day-head"><span>${d.key===localKey(new Date())?'Today':prettyDate(d.date,{weekday:'long',month:'short',day:'numeric'})}</span><b>${fmtHours(d.minutes)}</b></div><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,d.minutes/max*100)}%"></div></div></div>`).join('');
  }
  function renderSessions() {
    const records=state.sessions.map((session,index)=>({session,index})).sort((a,b)=>b.session.date.localeCompare(a.session.date)||(b.session.createdAt||0)-(a.session.createdAt||0));
    if (!records.length) return '<div class="empty-state">Your first session can start with the timer or a manual entry.</div>';
    const visible=showAllSessions?records:records.slice(0,12);
    return visible.map(({session:s,index})=>{
      const startTime=Number.isFinite(s.startedAt)?prettyDate(new Date(s.startedAt),{hour:'numeric',minute:'2-digit'}):'';
      return `<div class="session-row"><span class="session-date">${esc(prettyDate(dateFromKey(s.date),{month:'short',day:'numeric'}))}</span><span><span class="session-course">${esc(window.SYLLABI[s.course]?.short||'Mixed')} · ${esc(s.note||'Study session')}</span>${startTime?`<small class="session-note">Started ${esc(startTime)}</small>`:''}</span><span class="session-duration">${fmtSessionDuration(s.minutes)}</span><button class="session-delete" type="button" data-delete-session="${index}" aria-label="Delete ${esc(s.note||'study session')} from ${esc(prettyDate(dateFromKey(s.date),{month:'short',day:'numeric'}))}" title="Delete session">Delete</button></div>`;
    }).join('');
  }
  function renderHours() {
    const today=minutesFor(localKey(new Date()));
    const sessionsToggle=state.sessions.length>12||showAllSessions?`<button class="session-view-toggle" type="button" data-toggle-sessions aria-expanded="${showAllSessions}">${showAllSessions?'Show latest 12':`View all ${state.sessions.length}`}</button>`:'';
    content.innerHTML=`<section class="page-head"><div><div class="eyebrow">STUDY LOG / DAILY RHYTHM</div><h1>Make the hours count.</h1><p>Track focused time across both exams. Use the timer for a live session or add hours you studied earlier.</p></div></section>
      <section class="stats-grid"><article class="stat-card"><div class="stat-label">TODAY <span class="stat-icon">◷</span></div><div class="stat-value">${fmtSessionDuration(today)}</div><div class="stat-note">Across all study tracks</div></article><article class="stat-card"><div class="stat-label">THIS WEEK <span class="stat-icon">▥</span></div><div class="stat-value">${fmtSessionDuration(weekDays().reduce((a,d)=>a+d.minutes,0))}</div><div class="stat-note">Last 7 calendar days</div></article><article class="stat-card"><div class="stat-label">ALL TIME <span class="stat-icon">↗</span></div><div class="stat-value">${fmtSessionDuration(totalMinutes())}</div><div class="stat-note">Total logged study time</div></article><article class="stat-card"><div class="stat-label">STREAK <span class="stat-icon">✳</span></div><div class="stat-value">${studyStreak()} <span style="font-size:13px;color:#8c9b97">days</span></div><div class="stat-note">Consecutive study days</div></article></section>
      <section class="hours-layout"><div style="display:grid;gap:14px">${renderTimerPanel()}<article class="panel"><div class="panel-heading"><div><h2>Log a study block</h2><p>Add a session from your notebook or another timer.</p></div></div>${manualSessionForm()}</article><article class="panel"><div class="panel-heading"><div><h2>${showAllSessions?'All study sessions':'Recent sessions'}</h2><p>${showAllSessions?`Showing all ${state.sessions.length} saved entries.`:'Latest entries across your preparation.'}</p></div>${sessionsToggle}</div><div class="sessions-list">${renderSessions()}</div></article></div>
      <div style="display:grid;gap:14px"><article class="panel"><div class="panel-heading"><div><h2>Seven-day rhythm</h2><p>Daily study hours, most recent first</p></div></div>${renderStudyDays()}</article><article class="panel"><div class="panel-heading"><div><h2>Study by exam</h2><p>Logged time split across both tracks.</p></div></div>${['gate','ese'].map(id=>`<div class="study-day"><div class="study-day-head"><span>${esc(window.SYLLABI[id].short)}</span><b>${fmtHours(courseMinutes(id))}</b></div><div class="bar-track"><div class="bar-fill" style="width:${totalMinutes()?courseMinutes(id)/totalMinutes()*100:0}%"></div></div></div>`).join('')}</article></div></section>`;
  }
  function wheelOptions() {
    return Object.entries(window.SYLLABI).map(([id,c])=>c.chapters.map(ch=>`<optgroup label="${esc(c.short)} · ${esc(ch.title)}">${ch.topics.map((t,i)=>`<option value="${esc(id+':'+ch.id+':'+i)}">${esc(t)}</option>`).join('')}</optgroup>`).join('')).join('');
  }
  function renderWheel() {
    const count=state.wheelTopics.length;
    content.innerHTML=`<section class="page-head"><div><div class="eyebrow">TOPIC ROULETTE / PICK A FOCUS</div><h1>Let chance choose the chapter.</h1><p>Build a small pool for today, add anything from either syllabus, and spin for your next study block.</p></div></section>
      <section class="roulette-layout"><article class="panel wheel-panel"><div class="panel-heading" style="width:100%"><div><h2>Your topic wheel</h2><p>${count} ${count===1?'topic':'topics'} in the current pool</p></div><span class="stat-icon">◉</span></div><div class="wheel-frame"><span class="wheel-pointer"></span><canvas class="wheel" id="wheel-canvas" width="640" height="640" aria-label="Topic roulette wheel"></canvas><div class="wheel-center">SPIN</div></div><div class="wheel-result" id="wheel-result"><small>YOUR NEXT FOCUS</small><strong>Add topics, then spin the wheel</strong></div><button class="btn btn-primary spin-button" id="spin-wheel" ${count<2?'disabled':''}>↻ Spin for a topic</button><p class="wheel-instructions">One result, one focused block. Spin again whenever you finish.</p></article>
      <article class="panel"><div class="panel-heading"><div><h2>Build the pool</h2><p>Mix custom topics with syllabus topics.</p></div></div><div class="topic-pool"><form class="pool-input-row" id="add-topic-form"><input class="input" id="new-wheel-topic" maxlength="70" placeholder="Type a topic to add…" aria-label="Custom topic"><button class="btn btn-secondary" type="submit">＋ Add</button></form><div class="divider-label">OR PICK FROM YOUR SYLLABUS</div><div class="pool-select-row"><select class="select-control full" id="syllabus-topic-select"><option value="">Choose a topic…</option>${wheelOptions()}</select><button class="btn btn-secondary" id="add-syllabus-topic">Add topic</button></div><p class="pool-note">Your pool is saved automatically. Remove a chip with ×. Keep a few active topics in the wheel for a clearer spin.</p><div class="divider-label">IN THE WHEEL · ${count}</div><div class="pool-chip-list" id="wheel-chip-list">${wheelChips()}</div></div></article></section>`;
    drawWheel();
  }
  function wheelChips() {
    if(!state.wheelTopics.length) return '<div class="empty-state" style="width:100%">Your wheel is empty. Add a topic above.</div>';
    return state.wheelTopics.map((t,i)=>`<span class="topic-chip">${esc(t)}<button type="button" data-remove-wheel="${i}" aria-label="Remove ${esc(t)}">×</button></span>`).join('');
  }
  const wheelColors=['#315e60','#548478','#c7895a','#b6a16a','#607f95','#d2a57c','#53726e','#9a795b','#879d8e','#a56048','#657a8e','#bf9b62'];
  function drawWheel() {
    const canvas=document.getElementById('wheel-canvas'); if(!canvas)return;
    const ctx=canvas.getContext('2d'); const {width:w,height:h}=canvas; const cx=w/2,cy=h/2,r=w/2;
    ctx.clearRect(0,0,w,h);
    const names=state.wheelTopics.length?state.wheelTopics:['Add topics to spin']; const n=names.length; const arc=2*Math.PI/n;
    names.forEach((name,i)=>{
      const start=-Math.PI/2+i*arc, end=start+arc;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r-4,start,end);ctx.closePath();ctx.fillStyle=wheelColors[i%wheelColors.length];ctx.fill();ctx.strokeStyle='#fffefa';ctx.lineWidth=3;ctx.stroke();
      const mid=start+arc/2;ctx.save();ctx.translate(cx+Math.cos(mid)*r*.65,cy+Math.sin(mid)*r*.65);ctx.rotate(mid);ctx.fillStyle='#fffaf0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${Math.max(12,Math.min(20,210/n))}px Arial`;
      const maxLen=n>18?11:n>12?15:20;let label=String(name);if(label.length>maxLen)label=label.slice(0,maxLen-1)+'…';ctx.fillText(label,0,0);ctx.restore();
    });
    ctx.beginPath();ctx.arc(cx,cy,r-4,0,2*Math.PI);ctx.strokeStyle='#fffefa';ctx.lineWidth=6;ctx.stroke();
  }
  function renderCalendar() {
    const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth(),firstDay=new Date(year,month,1).getDay();
    const daysInMonth=new Date(year,month+1,0).getDate(),cellCount=Math.ceil((firstDay+daysInMonth)/7)*7,today=localKey(new Date());
    const cells=Array.from({length:cellCount},(_,index)=>{
      const day=index-firstDay+1;
      if(day<1||day>daysInMonth)return '<span class="calendar-empty" aria-hidden="true"></span>';
      const key=localKey(new Date(year,month,day)),entry=state.dailyRatings[key],rating=DAILY_RATINGS.find(option=>option.value===entry?.rating);
      const classes=['calendar-day',rating?.className,key===today?'is-today':'',key===calendarSelectedDate?'is-selected':''].filter(Boolean).join(' ');
      const label=rating?rating.label:'Not rated';
      return `<button class="${classes}" type="button" data-calendar-date="${key}" aria-label="${prettyDate(dateFromKey(key),{weekday:'long',month:'long',day:'numeric',year:'numeric'})}: ${label}" ${key>today?'disabled':''}><span>${day}</span>${rating?`<span class="calendar-day-mark" aria-hidden="true">${rating.mark}</span>`:''}</button>`;
    }).join('');
    const selected=calendarSelectedDate?state.dailyRatings[calendarSelectedDate]?.rating:'';
    const selectedLabel=calendarSelectedDate?prettyDate(dateFromKey(calendarSelectedDate),{weekday:'long',month:'long',day:'numeric',year:'numeric'}):'Choose a day on the calendar';
    content.innerHTML=`<section class="page-head"><div><div class="eyebrow">DAILY REVIEW / YOUR OWN CHECK-IN</div><h1>How did your day feel?</h1><p>Mark each day based on how satisfied you were with your work. You can change a rating anytime.</p></div></section>
      <section class="calendar-layout"><article class="panel calendar-panel"><div class="calendar-month-header"><button class="calendar-month-arrow" type="button" data-calendar-month="-1" aria-label="Previous month">‹</button><h2>${prettyDate(new Date(year,month,1),{month:'long',year:'numeric'})}</h2><button class="calendar-month-arrow" type="button" data-calendar-month="1" aria-label="Next month">›</button></div><div class="calendar-weekdays">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=>`<span>${day}</span>`).join('')}</div><div class="calendar-grid">${cells}</div><div class="calendar-legend">${DAILY_RATINGS.map(rating=>`<span><i class="${rating.className}"></i>${rating.label}</span>`).join('')}</div></article>
      <article class="panel calendar-rating-panel"><div class="panel-heading"><div><h2>Rate your day</h2><p>Choose one rating for the selected date.</p></div></div><div class="calendar-selected-date">${selectedLabel}</div><div class="calendar-rating-options">${DAILY_RATINGS.map(rating=>`<button class="calendar-rating-choice ${rating.className} ${selected===rating.value?'is-active':''}" type="button" data-daily-rating="${rating.value}" aria-pressed="${selected===rating.value}" ${calendarSelectedDate?'':'disabled'}><span>${rating.mark}</span>${rating.label}</button>`).join('')}</div>${selected?'<button class="calendar-clear-rating" type="button" data-clear-daily-rating>Clear this day’s rating</button>':''}<p class="calendar-rating-hint">Unmarked days stay neutral. Future dates can’t be rated yet.</p></article></section>`;
  }
  function render() {
    const climate=updatePrepTheme();
    document.querySelectorAll('.nav-link').forEach(btn=>btn.classList.toggle('active',btn.dataset.page===activePage));
    document.querySelectorAll('.exam-switch').forEach(btn=>btn.classList.toggle('selected',btn.dataset.course===activeCourse));
    const names={overview:'OVERVIEW',syllabus:'SYLLABUS TRACKER',hours:'STUDY HOURS',wheel:'TOPIC ROULETTE',calendar:'DAILY REVIEW'};
    document.getElementById('crumb-current').textContent=names[activePage];
    if(activePage==='overview')renderOverview(climate);
    if(activePage==='syllabus')renderSyllabus();
    if(activePage==='hours')renderHours();
    if(activePage==='wheel')renderWheel();
    if(activePage==='calendar')renderCalendar();
    updateNavCount();
  }
  function updateNavCount() {
    const total=getTopics('gate').length+getTopics('ese').length;
    document.getElementById('nav-topic-count').textContent=String(total);
  }
  function refreshProgressIndicators() {
    const stats=getStats(activeCourse);
    document.querySelectorAll('.summary-level[data-summary-course="'+activeCourse+'"]').forEach(el=>{
      const level=Number(el.dataset.level), pct=stats.levelPct[level];
      el.querySelector('.summary-value').textContent=`${pct}%`;
      el.querySelector('.bar-fill').style.width=`${pct}%`;
      el.querySelector('.summary-caption').textContent=`${stats.levelDone[level]} of ${stats.count} topics marked`;
    });
    document.querySelectorAll(`[data-course-total="${activeCourse}"]`).forEach(el=>el.textContent=`${stats.totalPct}% total`);
    document.querySelectorAll(`[data-course-progress="${activeCourse}"]`).forEach(el=>el.textContent=`${stats.levelPct[Number(el.dataset.level)]}%`);
    document.querySelectorAll(`[data-course-bar="${activeCourse}"]`).forEach(el=>el.style.width=`${stats.levelPct[Number(el.dataset.level)]}%`);
    window.SYLLABI[activeCourse].chapters.forEach(ch=>[0,1,2].forEach(level=>{
      const el=document.querySelector(`[data-chapter-progress="${activeCourse}:${ch.id}:${level}"]`); if(!el)return;
      const pct=stats.chapter[ch.id].pct[level]; el.querySelector('b').textContent=`${pct}%`;el.querySelector('.bar-fill').style.width=`${pct}%`;
    }));
    const full=Object.keys(state.progress).filter(k=>state.progress[k]?.length===3&&state.progress[k].every(Boolean)).length;
    const val=document.querySelector('.stat-card:nth-child(4) .stat-value');if(val&&activePage==='overview')val.textContent=full;
  }
  function applySyllabusFilters() {
    const query=(document.getElementById('syllabus-search')?.value||'').trim().toLowerCase();let visible=0;
    document.querySelectorAll('[data-chapter-card]').forEach(card=>{
      const groupOk=syllabusFilter==='All sections'||card.dataset.group===syllabusFilter;
      let chapterHas=false;
      card.querySelectorAll('[data-topic-row]').forEach(row=>{
        const matches=!query||row.dataset.topicText.includes(query);row.hidden=!matches;if(matches)chapterHas=true;
      });
      const show=groupOk&&chapterHas;card.hidden=!show;if(show)visible++;
      if(query&&show)card.open=true;
    });
    const empty=document.getElementById('no-results');if(empty)empty.hidden=visible>0;
  }
  function nav(page) { activePage=page;document.getElementById('sidebar').classList.remove('open');render();window.scrollTo({top:0,behavior:'smooth'}); }
  function toast(message) {
    const el=document.getElementById('toast');el.replaceChildren(document.createTextNode(message));el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);
  }
  function toastWithAction(message,label,action) {
    const el=document.getElementById('toast');el.replaceChildren(document.createTextNode(message));
    const button=document.createElement('button');button.className='toast-action';button.type='button';button.textContent=label;
    button.addEventListener('click',()=>{clearTimeout(toastTimer);el.classList.remove('show');action();},{once:true});
    el.append(' ',button);el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),5000);
  }
  function deleteSession(index) {
    if(!Number.isInteger(index)||index<0||index>=state.sessions.length)return;
    const [session]=state.sessions.splice(index,1);saveState();render();
    toastWithAction('Study session deleted.','Undo',()=>{
      state.sessions.splice(Math.min(index,state.sessions.length),0,session);saveState();render();toast('Study session restored.');
    });
  }
  function exportBackup(snapshot=state,label='') {
    const blob=new Blob([JSON.stringify({app:'Fieldnote Study Control Room',version:1,exportedAt:new Date().toISOString(),state:snapshot},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`fieldnote-study-backup${label?`-${label}`:''}-${localKey(new Date())}.json`;a.click();URL.revokeObjectURL(url);toast('Backup downloaded. Keep it somewhere safe.');
  }
  function importBackup(file) {
    if(!file)return;
    file.text().then(text=>{
      const parsed=JSON.parse(text);const incoming=parsed.state||parsed;
      if(!incoming.progress||typeof incoming.progress!=='object'||!Array.isArray(incoming.sessions)||!Array.isArray(incoming.wheelTopics))throw new Error('This file is not a Fieldnote backup.');
      state.progress=incoming.progress;state.sessions=incoming.sessions.filter(s=>s&&typeof s.date==='string'&&Number.isFinite(Number(s.minutes)));
      state.timer=incoming.timer&&Number.isFinite(incoming.timer.startedAt)?incoming.timer:null;state.wheelTopics=incoming.wheelTopics.filter(t=>typeof t==='string');state.examDates={...DEFAULT_EXAM_DATES,...(incoming.examDates||{})};state.dailyRatings=sanitizeDailyRatings(incoming.dailyRatings);
      saveState();toast('Backup restored on this device.');render();
    }).catch(()=>toast('Could not read that backup file.'));
  }
  function addWheelTopic(name) {
    const clean=String(name||'').trim().replace(/\s+/g,' ');
    if(!clean){toast('Enter a topic first.');return false;}
    if(state.wheelTopics.some(t=>t.toLowerCase()===clean.toLowerCase())){toast('That topic is already on the wheel.');return false;}
    state.wheelTopics.push(clean);saveState();renderWheel();return true;
  }
  function spinWheel() {
    if(spinLocked||state.wheelTopics.length<2)return;
    const winner=Math.floor(Math.random()*state.wheelTopics.length);const n=state.wheelTopics.length;const center=(winner+.5)*360/n;
    const modulo=((360-center-(wheelRotation%360))+360)%360;
    wheelRotation+=360*5+modulo;spinLocked=true;
    const canvas=document.getElementById('wheel-canvas');const button=document.getElementById('spin-wheel');const result=document.getElementById('wheel-result');
    button.disabled=true;button.textContent='◌ Spinning…';result.innerHTML='<small>YOUR NEXT FOCUS</small><strong>The wheel is turning…</strong>';
    canvas.style.transform=`rotate(${wheelRotation}deg)`;
    setTimeout(()=>{result.innerHTML=`<small>YOUR NEXT FOCUS</small><strong>${esc(state.wheelTopics[winner])}</strong>`;button.disabled=false;button.innerHTML='↻ Spin again';spinLocked=false;},4300);
  }
  function updateCountdownClocks() {
    document.querySelectorAll('[data-countdown]').forEach(clock=>{
      const value=countdownParts(clock.dataset.countdown);
      clock.querySelector('[data-countdown-days]').textContent=String(value.days).padStart(3,'0');
      clock.querySelector('[data-countdown-hours]').textContent=String(value.hours).padStart(2,'0');
      clock.querySelector('[data-countdown-minutes]').textContent=String(value.minutes).padStart(2,'0');
      clock.querySelector('[data-countdown-seconds]').textContent=String(value.secs).padStart(2,'0');
    });
  }

  content.addEventListener('click',e=>{
    const navBtn=e.target.closest('[data-go]');if(navBtn){nav(navBtn.dataset.go);return;}
    const monthButton=e.target.closest('[data-calendar-month]');if(monthButton){calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+Number(monthButton.dataset.calendarMonth),1);calendarSelectedDate='';renderCalendar();return;}
    const calendarDay=e.target.closest('[data-calendar-date]');if(calendarDay){calendarSelectedDate=calendarDay.dataset.calendarDate;renderCalendar();return;}
    const ratingButton=e.target.closest('[data-daily-rating]');if(ratingButton&&calendarSelectedDate){state.dailyRatings[calendarSelectedDate]={rating:ratingButton.dataset.dailyRating,updatedAt:Date.now()};saveState();renderCalendar();return;}
    if(e.target.closest('[data-clear-daily-rating]')&&calendarSelectedDate){delete state.dailyRatings[calendarSelectedDate];saveState();renderCalendar();return;}
    if(e.target.closest('[data-toggle-sessions]')){showAllSessions=!showAllSessions;render();return;}
    const deleteSessionButton=e.target.closest('[data-delete-session]');if(deleteSessionButton){deleteSession(Number(deleteSessionButton.dataset.deleteSession));return;}
    const filter=e.target.closest('[data-filter]');if(filter){syllabusFilter=filter.dataset.filter;document.querySelectorAll('#syllabus-filters button').forEach(b=>b.classList.toggle('active',b===filter));applySyllabusFilters();return;}
    if(e.target.closest('[data-export]')){exportBackup();return;}
    if(e.target.closest('[data-import]')){document.getElementById('backup-file')?.click();return;}
    if(e.target.closest('[data-start-timer]')){const topic=String(document.getElementById('timer-topic')?.value||'').trim().replace(/\s+/g,' ').slice(0,90);state.timer={startedAt:Date.now(),course:activeCourse,topic,pausedMs:0};saveState();render();return;}
    if(e.target.closest('[data-pause-timer]')){pauseTimer();return;}
    if(e.target.closest('[data-resume-timer]')){resumeTimer();return;}
    if(e.target.closest('[data-stop-timer]')){finishTimer();return;}
    if(e.target.closest('#spin-wheel')){spinWheel();return;}
    if(e.target.closest('#add-syllabus-topic')){const value=document.getElementById('syllabus-topic-select')?.value;if(!value){toast('Choose a syllabus topic first.');return;}const [courseId,chapterId,index]=value.split(':');const label=window.SYLLABI[courseId].chapters.find(c=>c.id===chapterId).topics[Number(index)];addWheelTopic(label);return;}
    const remove=e.target.closest('[data-remove-wheel]');if(remove){state.wheelTopics.splice(Number(remove.dataset.removeWheel),1);saveState();renderWheel();return;}
  });
  content.addEventListener('change',e=>{
    if(e.target.matches('[data-check]')){const c=e.target;const key=`${c.dataset.course}:${c.dataset.chapter}:${c.dataset.topic}`;const bits=bitsFor({key});bits[Number(c.dataset.level)]=c.checked;state.progress[key]=bits;saveState();refreshProgressIndicators();}
    if(e.target.id==='backup-file')importBackup(e.target.files?.[0]);
  });
  content.addEventListener('input',e=>{if(e.target.id==='syllabus-search')applySyllabusFilters();});
  content.addEventListener('submit',e=>{
    if(e.target.id==='exam-dates-form'){
      e.preventDefault();const form=new FormData(e.target);state.examDates={gate:String(form.get('gateDate')),ese:String(form.get('eseDate'))};saveState();toast('Exam countdown dates saved.');render();return;
    }
    if(e.target.id==='session-form'){
      e.preventDefault();const form=new FormData(e.target);const hours=Number(form.get('hours'));if(!Number.isFinite(hours)||hours<=0||hours>24){toast('Enter study time between 0.1 and 24 hours.');return;}
      const course=form.get('course');state.sessions.push({id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,course,date:form.get('date'),minutes:Math.round(hours*60),note:String(form.get('note')||'').trim(),createdAt:Date.now()});saveState();toast('Study time logged.');render();return;
    }
    if(e.target.id==='add-topic-form'){
      e.preventDefault();const input=document.getElementById('new-wheel-topic');if(addWheelTopic(input.value))input.value='';
    }
  });
  function finishTimer() {
    if(!state.timer)return;
    const timer=state.timer;const end=Number.isFinite(timer.pausedAt)?timer.pausedAt:Date.now();const seconds=Math.max(0,Math.floor((end-timer.startedAt-(Number(timer.pausedMs)||0))/1000));
    if(seconds>=60){state.sessions.push({id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,course:timer.course,date:localKey(new Date(timer.startedAt)),startedAt:timer.startedAt,minutes:Math.max(1,Math.round(seconds/60)),note:timer.topic||'Focus timer',createdAt:Date.now()});}
    state.timer=null;saveState();toast(seconds>=60?'Focus session saved to your study log.':'Short session ended; no time was logged.');render();
  }
  document.querySelectorAll('.nav-link').forEach(btn=>btn.addEventListener('click',()=>nav(btn.dataset.page)));
  document.querySelectorAll('.exam-switch').forEach(btn=>btn.addEventListener('click',()=>{activeCourse=btn.dataset.course;document.querySelectorAll('.exam-switch').forEach(b=>b.classList.toggle('selected',b===btn));if(activePage==='syllabus'||activePage==='overview')render();}));
  document.getElementById('mobile-menu').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
  document.addEventListener('click',e=>{const sidebar=document.getElementById('sidebar');if(sidebar.classList.contains('open')&&!sidebar.contains(e.target)&&!e.target.closest('#mobile-menu'))sidebar.classList.remove('open');});
  document.getElementById('cloud-trigger').addEventListener('click',openCloudModal);
  document.getElementById('cloud-close').addEventListener('click',closeCloudModal);
  document.querySelectorAll('[data-close-cloud]').forEach(el=>el.addEventListener('click',closeCloudModal));
  document.querySelectorAll('[data-cloud-mode]').forEach(button=>button.addEventListener('click',()=>setAuthMode(button.dataset.cloudMode)));
  document.querySelectorAll('[data-cloud-choice]').forEach(button=>button.addEventListener('click',()=>resolveCloudChoice(button.dataset.cloudChoice)));
  document.querySelector('[data-export-browser-choice]').addEventListener('click',()=>{if(pendingCloudChoice)exportBackup(pendingCloudChoice.local,'browser-copy');});
  document.querySelector('[data-export-account-choice]').addEventListener('click',()=>{if(pendingCloudChoice?.remoteExists)exportBackup(pendingCloudChoice.remote,'account-copy');});
  document.getElementById('password-visibility-toggle').addEventListener('click',()=>{
    const input=document.getElementById('cloud-password');const visible=input.type==='password';
    input.type=visible?'text':'password';
    const button=document.getElementById('password-visibility-toggle');button.setAttribute('aria-label',visible?'Hide password':'Show password');button.setAttribute('aria-pressed',String(visible));
    document.getElementById('password-eye-open').hidden=visible;document.getElementById('password-eye-closed').hidden=!visible;
  });
  document.getElementById('cloud-auth-form').addEventListener('submit',e=>{e.preventDefault();submitCloudAuth(e.currentTarget);});
  document.getElementById('cloud-sync-now').addEventListener('click',manualCloudSync);
  document.getElementById('cloud-signout').addEventListener('click',signOutCloud);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCloudModal();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&cloudUser)synchronizeCloud().catch(error=>{setCloudStatus('Sync needs attention','');setCloudMessage(error.message,true);});});
  document.getElementById('today-label').textContent=prettyDate(new Date(),{weekday:'short',month:'short',day:'numeric',year:'numeric'}).toUpperCase();
  setAuthMode('signin');
  render();
  initializeCloudSession();
  setInterval(()=>{const face=document.getElementById('timer-face');if(face&&state.timer)face.textContent=timerText();updateCountdownClocks();const today=localKey(new Date());if(today!==prepThemeDate){prepThemeDate=today;const climate=updatePrepTheme();if(activePage==='overview')renderOverview(climate);}},1000);
})();
