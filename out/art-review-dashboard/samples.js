const effects = [
  { id: 'fx_hit_impact', label: '타격 임팩트', type: 'impact', fps: 30, thumb: 1, loop: false },
  { id: 'fx_match_pop', label: '소멸 팝', type: 'pop', fps: 24, thumb: 2, loop: false },
  { id: 'fx_combo_glow', label: '콤보 글로우', type: 'pulse', fps: 12, thumb: 4, loop: true },
  { id: 'fx_coin_get', label: '획득 반짝임', type: 'sparkle', fps: 24, thumb: 4, loop: false },
];
const reviewItems = [
  ['buttons', '버튼 상태', '기본·눌림·비활성·강조'],
  ['panels', '패널과 팝업', '색·테두리·화면 비중'],
  ['hud', 'HUD 바', '작은 크기에서 채움 읽힘'],
  ['impact', '타격 이펙트', '첫 코어·끝 잔상'],
  ['pop', '소멸 이펙트', '확산과 사라짐'],
  ['glow', '콤보 글로우', '루프 연결과 밝기'],
  ['sparkle', '획득 반짝임', '실루엣과 파편'],
];
const key = 'gdt-ui-fx-sample-review-2026-09-27';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch { saved = {}; }
const state = { fx: 0, frame: 0, playing: true, bg: 'dark', votes: {}, note: '', ...saved };
const $ = (id) => document.getElementById(id);
const framePath = (fx, frame) => `fx/${fx.id}/${fx.id}_${String(frame).padStart(2, '0')}.png`;
function save() {
  try { localStorage.setItem(key, JSON.stringify({ fx: state.fx, frame: state.frame, playing: state.playing, bg: state.bg, votes: state.votes, note: state.note })); } catch {}
}
function render() {
  const fx = effects[state.fx] || effects[0];
  $('fxName').textContent = fx.label;
  $('fxMeta').textContent = `8프레임 · ${fx.fps}fps · ${fx.type}`;
  $('fxFrame').src = framePath(fx, state.frame);
  $('fxFrame').alt = `${fx.label} ${state.frame + 1}번째 프레임`;
  $('frameSlider').value = state.frame;
  $('frameCount').textContent = `${String(state.frame + 1).padStart(2, '0')} / 08`;
  $('playButton').textContent = state.playing ? '일시정지' : (!fx.loop && state.frame === 7 ? '다시 재생' : '재생');
  $('fxStage').className = `fx-stage ${state.bg}`;
  document.querySelectorAll('[data-fx-bg]').forEach((button) => button.classList.toggle('active', button.dataset.fxBg === state.bg));
  document.querySelectorAll('[data-fx-id]').forEach((button) => button.classList.toggle('active', button.dataset.fxId === fx.id));
  document.querySelectorAll('[data-vote]').forEach((button) => button.classList.toggle('active', state.votes[button.dataset.item] === button.dataset.vote));
}
effects.forEach((fx, index) => {
  const button = document.createElement('button'); button.type = 'button'; button.dataset.fxId = fx.id;
  const img = document.createElement('img'); img.src = framePath(fx, fx.thumb); img.alt = '';
  const words = document.createElement('div');
  const title = document.createElement('strong'); title.textContent = fx.label;
  const detail = document.createElement('small'); detail.textContent = `${fx.type} · ${fx.fps}fps`;
  words.append(title, detail); button.append(img, words);
  button.addEventListener('click', () => { state.fx = index; state.frame = 0; state.playing = true; render(); save(); });
  $('fxPicker').append(button);
  const link = document.createElement('a'); link.href = `fx/${fx.id}_preview.png`; link.target = '_blank'; link.rel = 'noopener';
  const label = document.createElement('span'); label.textContent = fx.label;
  const strip = document.createElement('img'); strip.src = link.href; strip.alt = `${fx.label} 8프레임 미리보기`;
  const caption = document.createElement('small'); caption.textContent = `${fx.fps}fps · 128px × 8프레임 · 생성 PNG`;
  link.append(label, strip, caption); $('stripGrid').append(link);
});
reviewItems.forEach(([id, title, hint]) => {
  const row = document.createElement('div'); row.className = 'review-row';
  const text = document.createElement('div'); const strong = document.createElement('strong'); strong.textContent = title;
  const small = document.createElement('small'); small.textContent = hint; text.append(strong, small);
  const buttons = document.createElement('div'); buttons.className = 'review-buttons';
  for (const [value, label] of [['good', '좋음'], ['revise', '수정'], ['later', '보류']]) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.item = id; button.dataset.vote = value;
    button.textContent = label; button.addEventListener('click', () => { state.votes[id] = value; render(); save(); }); buttons.append(button);
  }
  row.append(text, buttons); $('reviewRows').append(row);
});
let timer = null;
function schedule() {
  clearTimeout(timer);
  if (!state.playing || document.hidden) return;
  timer = setTimeout(() => {
    if (state.frame === 7 && !effects[state.fx].loop) state.playing = false;
    else state.frame = (state.frame + 1) % 8;
    render(); schedule();
  }, 1000 / effects[state.fx].fps);
}
$('playButton').addEventListener('click', () => { if (!state.playing && state.frame === 7 && !effects[state.fx].loop) state.frame = 0; state.playing = !state.playing; render(); save(); schedule(); });
$('frameSlider').addEventListener('input', (event) => { state.frame = Number(event.target.value); state.playing = false; render(); save(); schedule(); });
document.querySelectorAll('[data-fx-bg]').forEach((button) => button.addEventListener('click', () => { state.bg = button.dataset.fxBg; render(); save(); }));
document.addEventListener('visibilitychange', schedule);
const picker = $('fxPicker'); picker.addEventListener('click', () => schedule());
$('reviewNote').value = state.note || '';
$('reviewNote').addEventListener('input', (event) => { state.note = event.target.value; save(); });
$('exportReview').addEventListener('click', () => {
  const report = { status: 'concept', reviewedAt: new Date().toISOString(), sample: 'GameDevTeam starter UI/FX kit',
    sourceSpecs: ['skills/art-direction/references/starter-kit/ui-spec.json', 'skills/art-direction/references/starter-kit/fx-spec.json'],
    selectedEffect: effects[state.fx].id, votes: state.votes, note: state.note || '' };
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'ui-fx-sample-review.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
render(); schedule();
