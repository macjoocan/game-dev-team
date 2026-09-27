#!/usr/bin/env node
// check-plugin-version.mjs - 설치된 플러그인이 소스보다 뒤처졌는지 알린다.
//   node scripts/check-plugin-version.mjs            # 사람이 직접
//   (SessionStart 훅에서 자동 호출 — 뒤처졌을 때만 말한다)
//
// 왜 필요한가 — **설치본은 스냅샷이다.** 소스를 고치고 push 해도 이미 설치된 프로젝트는
// 안 바뀐다. 그리고 아무도 알려주지 않는다. 실측(2026-09-09):
//   user 스코프    0.27.2  (소스는 0.29.0)
//   project(Hex)   0.17.0  ← **12 버전 뒤처짐.** 5일 동안 아무도 몰랐다
// 그 상태의 hex-danmaku 는 art-gate·cast-distinct·sprite-qa·walk-composite·종료코드 계약이
// 전부 없는 플러그인을 쓰고 있었다. 세션은 정상으로 보인다 — 도구가 "없다"고 말하지 않는다.
//
// 그래서 **묻지 않아도 말해주는 쪽**으로 만든다. 훅은 뒤처졌을 때만 한 줄 낸다(평소 소음 0).

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const PLUGIN = 'game-dev-team';

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

/** 설치 기록에서 이 프로젝트에 실제로 적용되는 항목들을 고른다. */
export function installedVersions(projectDir) {
  const reg = readJSON(path.join(os.homedir(), '.claude', 'plugins', 'installed_plugins.json'));
  if (!reg?.plugins) return [];
  const out = [];
  for (const [id, entries] of Object.entries(reg.plugins)) {
    if (!id.startsWith(PLUGIN + '@')) continue;
    for (const e of entries || []) {
      // project/local 스코프는 그 프로젝트에서만 유효하다 — 남의 프로젝트 기록으로 경고하면 안 된다
      if (e.projectPath && projectDir && path.resolve(e.projectPath) !== path.resolve(projectDir)) continue;
      out.push({ scope: e.scope, version: e.version, projectPath: e.projectPath });
    }
  }
  return out;
}

/**
 * 마켓플레이스 소스의 버전과 **출처를 같이** 낸다.
 *
 * 출처를 안 내는 게 이 도구의 원래 결함이었다(REVIEW.md B-18). 등록된 마켓플레이스가
 * 죽은 옛 레포(game-dev-team-Ver3, 0.16.0)를 가리키는데 설치본도 0.16.0 이라
 * **"전부 최신이다"** 로 보고했다 — 정본은 그때 0.34.0 이었다. 18버전 벌어졌는데
 * 화면에는 최신이라고 떴다. 숫자만 비교하고 어디서 읽었는지 안 말하면 이렇게 된다.
 *
 * kind:
 *   'directory' — 확정. 그 경로의 plugin.json 이 소스다.
 *   'git'       — **로컬 클론 기준**이다. 원격이 앞서 있어도 여기서는 안 보인다
 *                 (claude plugin marketplace update 를 돌려야 클론이 따라온다).
 *                 그래서 같아 보여도 "최신"이라고 단정하지 않는다.
 */
export function sourceInfo() {
  const known = readJSON(path.join(os.homedir(), '.claude', 'plugins', 'known_marketplaces.json'));
  const entry = known?.[PLUGIN] ?? known?.marketplaces?.[PLUGIN];
  const src = entry?.source;
  if (!src) return null;

  if (src.source === 'directory') {
    const m = readJSON(path.join(src.path, '.claude-plugin', 'plugin.json'));
    return m?.version ? { version: m.version, kind: 'directory', origin: src.path } : null;
  }

  const dir = entry?.installLocation;
  if (!dir) return null;
  const m = readJSON(path.join(dir, '.claude-plugin', 'plugin.json'));
  if (!m?.version) return null;
  const origin = src.repo ? `${src.source}:${src.repo}` : (src.url ?? String(src.source));
  return { version: m.version, kind: 'git', origin, clone: dir };
}

/** 하위 호환 — 버전만 필요한 호출부용. */
export function sourceVersion() {
  return sourceInfo()?.version ?? null;
}

const cmp = (a, b) => {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) { const d = (pa[i] || 0) - (pb[i] || 0); if (d) return d; }
  return 0;
};

/**
 * 훅용. **확실히 뒤처졌을 때만** 문자열을 내고 그 외에는 null 이다(평소 소음 0 규칙).
 * git 소스에서 버전이 같아 보이는 경우는 단정할 수 없지만, 여기서 매 세션 떠들면
 * 소음 0 이 깨진다 — 그 불확실성은 사람이 직접 부르는 CLI 쪽에서 말한다.
 */
export function staleReport(projectDir) {
  const info = sourceInfo();
  if (!info) return null;                      // 소스를 모르면 조용히 넘어간다
  const src = info.version;
  const stale = installedVersions(projectDir).filter((i) => cmp(i.version, src) < 0);
  if (!stale.length) return null;
  const lines = [
    `플러그인이 소스(${src})보다 뒤처졌다 — **설치본은 스냅샷이라 push 만으로는 안 바뀐다.**`,
    `  소스 출처: ${info.origin}${info.kind === 'git' ? ' (로컬 클론 기준)' : ''}`,
  ];
  for (const s of stale) {
    const where = s.projectPath ? ` (${s.projectPath})` : '';
    lines.push(`  - ${s.scope}${where}: ${s.version}  ->  \`claude plugin update ${PLUGIN}@${PLUGIN} --scope ${s.scope}\``);
  }
  lines.push('갱신 뒤 재시작해야 적용된다. 마켓플레이스 소스가 바뀌었으면 `claude plugin marketplace update` 를 먼저.');
  return lines.join('\n');
}

// 직접 실행: 항상 결과를 낸다(훅과 달리 조용하지 않다)
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('check-plugin-version.mjs')) {
  const dir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const info = sourceInfo();
  const inst = installedVersions(dir);
  if (!info) {
    console.log('마켓플레이스 소스를 못 읽었다. 판정: 측정 불가');
    console.log('  `claude plugin marketplace list` 로 등록 상태를 확인해라.');
    process.exit(3);
  }

  // **출처를 먼저 찍는다.** 이 한 줄이 없어서 죽은 레포를 18버전 동안 못 봤다.
  console.log(`소스 출처: ${info.origin}${info.kind === 'git' ? '  (로컬 클론: ' + info.clone + ')' : ''}`);
  console.log(`소스 버전: ${info.version}`);
  if (!inst.length) { console.log('이 프로젝트에 설치된 기록이 없다. 판정: 측정 불가'); process.exit(3); }
  for (const i of inst) console.log(`  ${i.scope}${i.projectPath ? ` (${i.projectPath})` : ''}: ${i.version}`);

  const rep = staleReport(dir);
  if (rep) { console.log('\n' + rep); process.exit(1); }

  if (info.kind === 'git') {
    // 클론과 같다고 최신인 게 아니다. 원격은 안 봤다 — 그걸 최신이라 부르면 거짓 안심이다.
    console.log('\n판정: **측정 불가** — 설치본이 로컬 클론과 같지만 **원격은 확인하지 않았다.**');
    console.log('  `claude plugin marketplace update game-dev-team` 으로 클론을 갱신한 뒤 다시 봐라.');
    console.log(`  출처가 의도한 레포가 맞는지도 같이 확인해라: ${info.origin}`);
    process.exit(3);
  }
  console.log('\n전부 최신이다.');
}
