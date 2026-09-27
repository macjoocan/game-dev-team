const effects = [
  {id:'fx_hit_impact',label:'타격 임팩트',type:'impact',fps:30,thumb:1,loop:false},
  {id:'fx_match_pop',label:'매치 팝',type:'pop',fps:24,thumb:2,loop:false},
  {id:'fx_combo_glow',label:'콤보 글로우',type:'pulse',fps:12,thumb:4,loop:true},
  {id:'fx_coin_get',label:'획득 반짝임',type:'sparkle',fps:24,thumb:4,loop:false},
];
const items = [
  ['buttons','버튼 상태','기본·선택·눌림·비활성'],['panels','패널과 챕터 카드','모서리·테두리·텍스트 자리'],
  ['hud','전투 HUD','게임 크기에서 식별성'],['impact','타격 FX','첫 프레임과 읽힘'],
  ['pop','소멸 FX','확산과 종료'],['glow','콤보 FX','반복 연결'],['sparkle','획득 FX','밝기와 속도'],
];
const $ = id => document.getElementById(id);
const key='gdt-game-ui-review-2026-09-27';
let saved={}; try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
const state={fx:0,frame:0,playing:true,bg:'dark',votes:{},note:'',...saved};
const framePath=(fx,n)=>`fx/${fx.id}/${fx.id}_${String(n).padStart(2,'0')}.png`;
function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
function render(){
  const fx=effects[state.fx]||effects[0];
  $('fxName').textContent=fx.label;
  $('fxMeta').textContent=`8프레임 · ${fx.fps}fps · ${fx.type}`;
  $('fxFrame').src=framePath(fx,state.frame);
  $('fxFrame').alt=`${fx.label} ${state.frame+1}번째 프레임`;
  $('frameSlider').value=state.frame;
  $('frameCount').textContent=`${String(state.frame+1).padStart(2,'0')} / 08`;
  $('playButton').textContent=state.playing?'일시정지':(!fx.loop&&state.frame===7?'다시 재생':'재생');
  $('fxStage').className=`fx-stage ${state.bg}`;
  document.querySelectorAll('[data-bg]').forEach(b=>b.classList.toggle('active',b.dataset.bg===state.bg));
  document.querySelectorAll('[data-fx]').forEach(b=>b.classList.toggle('active',Number(b.dataset.fx)===state.fx));
  document.querySelectorAll('[data-vote]').forEach(b=>b.classList.toggle('active',state.votes[b.dataset.item]===b.dataset.vote));
}
effects.forEach((fx,i)=>{
  const button=document.createElement('button');button.type='button';button.dataset.fx=i;
  const img=document.createElement('img');img.src=framePath(fx,fx.thumb);img.alt='';
  const label=document.createElement('span');label.innerHTML=`<strong>${fx.label}</strong><small>${fx.type} · ${fx.fps}fps</small>`;
  button.append(img,label);button.addEventListener('click',()=>{state.fx=i;state.frame=0;state.playing=true;render();save();schedule()});$('fxPicker').append(button);
  const link=document.createElement('a');link.href=`fx/${fx.id}_preview.png`;link.target='_blank';link.rel='noopener';
  const title=document.createElement('span');title.textContent=fx.label;
  const strip=document.createElement('img');strip.src=link.href;strip.alt=`${fx.label} 8프레임 스트립`;
  const caption=document.createElement('small');caption.textContent=`${fx.fps}fps · 128px × 8프레임 · 생성 PNG`;
  link.append(title,strip,caption);$('stripGrid').append(link);
});
items.forEach(([id,title,hint])=>{
  const row=document.createElement('div');row.className='review-row';
  const text=document.createElement('div');const strong=document.createElement('strong');strong.textContent=title;const small=document.createElement('small');small.textContent=hint;text.append(strong,small);
  const vote=document.createElement('div');vote.className='vote';
  for(const [value,label] of [['good','좋음'],['revise','수정'],['later','보류']]){const b=document.createElement('button');b.type='button';b.dataset.item=id;b.dataset.vote=value;b.textContent=label;b.addEventListener('click',()=>{state.votes[id]=value;render();save()});vote.append(b)}
  row.append(text,vote);$('reviewRows').append(row);
});
let timer;
function schedule(){clearTimeout(timer);if(!state.playing||document.hidden)return;timer=setTimeout(()=>{if(state.frame===7&&!effects[state.fx].loop)state.playing=false;else state.frame=(state.frame+1)%8;render();schedule()},1000/effects[state.fx].fps)}
$('playButton').addEventListener('click',()=>{if(!state.playing&&state.frame===7&&!effects[state.fx].loop)state.frame=0;state.playing=!state.playing;render();save();schedule()});
$('frameSlider').addEventListener('input',e=>{state.frame=Number(e.target.value);state.playing=false;render();save();schedule()});
document.querySelectorAll('[data-bg]').forEach(b=>b.addEventListener('click',()=>{state.bg=b.dataset.bg;render();save()}));
document.addEventListener('visibilitychange',schedule);
$('reviewNote').value=state.note||'';$('reviewNote').addEventListener('input',e=>{state.note=e.target.value;save()});
$('exportReview').addEventListener('click',()=>{const report={status:'concept',reviewedAt:new Date().toISOString(),sample:'Sanabi-inspired UI and starter FX',uiManifest:'ui-game/manifest.json',fxManifest:'fx/manifest.json',votes:state.votes,note:state.note};const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='game-ui-fx-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
render();schedule();
