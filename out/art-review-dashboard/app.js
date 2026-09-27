const poses = [
  ['anticipation','예비 동작'],['contact','접촉'],['run_reach','달리기 · 뻗기'],
  ['run_push','달리기 · 밀기'],['takeoff','도약'],['jump','점프'],
  ['fall','낙하'],['land','착지'],['dash','대시'],['hook','갈고리'],
  ['attack_windup','공격 준비'],['attack_swing','공격 휘두르기'],['hit','피격'],
];
const checks = [
  ['identity','정체성 일관성','후드·바이저·재킷·부츠가 포즈마다 같은 캐릭터로 보이는가'],
  ['equipment','그래플링 팔','황동 장비가 손이나 일반 팔과 구분되는가'],
  ['silhouette','작은 크기 실루엣','64~128px에서도 움직임 방향과 주요 자세가 읽히는가'],
  ['background','배경 분리','실제 배경에서 캐릭터 외곽이 묻히지 않는가'],
  ['alpha','알파 경계','테두리·구멍·그림자에 어색한 픽셀이 없는가'],
  ['baseline','발 기준선','바닥에 닿는 포즈가 같은 높이로 느껴지는가'],
];
const storeKey = 'gdt-art-review-2026-09-27';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch { saved = {}; }
const state = { pose: 'anticipation', outline: true, size: 128, bg: 'checker', ...saved };
state.checks ||= {};
const $ = (id) => document.getElementById(id);
const outlined = (id) => `assets/${id}_128_outlined.png`;
const plain = (id) => `assets/${id}_rgba.png`;
function persist() {
  try { localStorage.setItem(storeKey, JSON.stringify({ pose: state.pose, outline: state.outline,
    size: state.size, bg: state.bg, checks: state.checks, notes: state.notes || '' })); } catch {}
}
function render() {
  const pose = poses.find(([id]) => id === state.pose) || poses[0];
  $('stageSprite').src = state.outline ? outlined(pose[0]) : plain(pose[0]);
  $('stageSprite').style.width = `${state.size}px`;
  $('stageSprite').style.height = `${state.size}px`;
  $('stageSprite').alt = `${pose[1]} 포즈, ${state.outline ? '1px 외곽선 있음' : '외곽선 없음'}`;
  $('alphaSprite').src = plain(pose[0]);
  $('alphaSprite').alt = `${pose[1]} 포즈 원본 RGBA 확대`;
  $('poseMeta').textContent = `${pose[1]} / ${state.pose} · ${state.size}px`;
  $('poseSelect').value = state.pose;
  $('sizeSelect').value = String(state.size);
  document.querySelectorAll('[data-outline]').forEach((b) => b.classList.toggle('active', (b.dataset.outline === 'on') === state.outline));
  document.querySelectorAll('[data-bg]').forEach((b) => b.classList.toggle('active', b.dataset.bg === state.bg));
  $('alphaStage').className = `alpha-stage ${state.bg}`;
  document.querySelectorAll('.pose-card').forEach((b) => b.classList.toggle('selected', b.dataset.pose === state.pose));
  document.querySelectorAll('.rating button').forEach((b) => b.classList.toggle('active', state.checks[b.dataset.check] === b.dataset.value));
  persist();
}
for (const [id, label] of poses) {
  const opt = document.createElement('option'); opt.value = id; opt.textContent = label; $('poseSelect').append(opt);
  const button = document.createElement('button'); button.type = 'button'; button.className = 'pose-card'; button.dataset.pose = id;
  const img = document.createElement('img'); img.src = outlined(id); img.alt = `${label} 포즈`; img.loading = 'lazy';
  const caption = document.createElement('span'); caption.textContent = `${poses.indexOf(poses.find(([p]) => p === id)) + 1}`.padStart(2, '0') + ` / ${label}`;
  button.append(img, caption); button.addEventListener('click', () => { state.pose = id; render(); $('viewer-title').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('poseGrid').append(button);
}
for (const [id, title, hint] of checks) {
  const row = document.createElement('div'); row.className = 'check-row';
  const description = document.createElement('div');
  const strong = document.createElement('strong'); strong.textContent = title;
  const small = document.createElement('small'); small.textContent = hint;
  description.append(strong, small);
  const group = document.createElement('div'); group.className = 'rating'; group.setAttribute('role', 'group'); group.setAttribute('aria-label', title);
  for (const [value, label] of [['pass','좋음'],['issue','수정 필요'],['unknown','보류']]) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.check = id; button.dataset.value = value;
    button.textContent = label; button.addEventListener('click', () => { state.checks[id] = value; render(); }); group.append(button);
  }
  row.append(description, group); $('checklist').append(row);
}
$('poseSelect').addEventListener('change', (event) => { state.pose = event.target.value; render(); });
$('sizeSelect').addEventListener('change', (event) => { state.size = Number(event.target.value); render(); });
document.querySelectorAll('[data-outline]').forEach((button) => button.addEventListener('click', () => { state.outline = button.dataset.outline === 'on'; render(); }));
document.querySelectorAll('[data-bg]').forEach((button) => button.addEventListener('click', () => { state.bg = button.dataset.bg; render(); }));
$('reviewNotes').value = state.notes || '';
$('reviewNotes').addEventListener('input', (event) => { state.notes = event.target.value; persist(); });
$('exportBtn').addEventListener('click', () => {
  const data = { assetId: 'pose-reference-pilot', assetStatus: 'concept-pilot', reviewedAt: new Date().toISOString(),
    view: { pose: state.pose, outline: state.outline, size: state.size, alphaBackground: state.bg },
    checks: state.checks, notes: state.notes || '',
    evidence: 'D:/00.project/Action/sanabi-prototype/assets/generated/pose_reference_pilot' };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'art-review-pose-reference-pilot.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
render();
