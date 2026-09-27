# UI·FX 샘플 쇼룸

`index.html`을 브라우저에서 열면 된다. 별도 빌드나 서버가 필요 없는 로컬 파일 묶음이다.

2026-09-27 게임 UI 개정판은 `GameGogo/out_sanabi_final/sanabi_sprites/UI`의 산나비 UI를 **형태와 색의 레퍼런스**로 측정해 만들었다. 원본 게임 이미지는 복사하지 않았다. `game-ui-gen.mjs`를 실행하면 `ui-game/`의 콘셉트 PNG 11장과 manifest를 재생성한다. 게임 화면 목업의 배경은 기존 파일럿 생성 이미지다.

`starter.html`은 이전의 둥근 그라데이션 UI 대시보드다. 새 화면에는 기존 FX 시안을 유지해 UI 변화에 집중했다. FX의 새 스타일링은 아직 검수 대상이다.

## 생성한 샘플

- `ui/`: 버튼 상태 4장, 패널·팝업 2장, HUD 바 2장. `manifest.json`에 크기·피벗·9-slice가 있다.
- `fx/`: 타격·소멸·콤보·획득 이펙트 각 8프레임. 프레임 PNG, 스트립, 어두운 배경 프리뷰, `manifest.json`이 있다.
- `character.html`: 이전 캐릭터 검수 대시보드. 메인 쇼룸과 별도로 남겨 두었다.

UI와 FX는 `skills/art-direction/references/starter-kit/`의 공통 `palette.json`, `ui-spec.json`, `fx-spec.json`으로 생성했다. 쇼룸의 게임 배경 UI 배치는 **목업**이며 엔진 삽입 결과가 아니다. 이 파일들은 `concept` 샘플이고 사람 승인·작은 화면·접근성·애니메이션 타이밍 검수 전이다.

검수 선택과 메모는 브라우저 localStorage에 임시 저장된다. `검수 JSON 저장`으로 결과를 내보낼 수 있다.
