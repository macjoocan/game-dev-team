# 게임 아트 모델 후보 조사 — 2026-09-27

**상태: 조사 완료, 설치·생성 테스트 전.** 이 문서는 다른 PC에서 같은 판단을 이어가기 위한 기록이다. 모델 파일이나 외부 워크플로 JSON은 저장소에 포함하지 않는다. 산나비 추출 이미지는 형태·색 레퍼런스로만 사용했고 학습 데이터로 승인하지 않았다.

## 현재 기준선

- 작업 예시: [`out/art-review-dashboard/`](../../out/art-review-dashboard/). 게임형 UI 버튼·패널·HUD는 결정론적 코드로 생성했고, FX 4종도 절차적으로 생성했다. 캐릭터 포즈 파일럿은 `concept` 상태다.
- 확인한 로컬 환경: ComfyUI 0.33.1, RTX 4070 Laptop 8GB, `--lowvram`. SDXL Base 1.0, Pixel Art XL LoRA, SDXL OpenPose ControlNet, IP-Adapter Plus SDXL 및 ViT-H 인코더가 설치돼 있다. 파일럿의 모델 해시·실행 입력은 [`pose-reference-pilot.md`](../../skills/char-art-system/references/pose-reference-pilot.md)와 별도 프로젝트의 `assets/generated/pose_reference_pilot/manifest.json`에 있다.
- 현재 문제: 캐릭터의 투명 가장자리·그림자와 그래플링 장비 형태, 완전한 동작 연속성이 미검증이다. UI의 게임다운 인상은 이번 시안에서 각진 실루엣·색·선 규칙으로 개선했다. FX의 새 UI 스타일 연계는 미검수다.

## 후보와 우선순위

| 순서 | 후보 | 적용할 일 | 확인된 사실 | 이 PC에서 남은 확인 |
|---|---|---|---|---|
| **1** | [Comfy-Org BiRefNet](https://huggingface.co/Comfy-Org/BiRefNet/tree/main/background_removal) | 기존 캐릭터·소품 이미지의 알파 마스크 | `birefnet.safetensors` 약 444MB, 저장소 표기 MIT. [ComfyUI 공식 가이드](https://docs.comfy.org/tutorials/utility/remove-background-birefnet)는 RGBA·마스크 출력과 `models/background_removal/` 경로를 안내한다. | 로컬 ComfyUI 0.33.1의 노드 지원 여부, 8GB 사용량, 얇은 기계 팔 보존률. 공식 가이드는 최신 ComfyUI 확인을 요구한다. |
| **2** | [xinsir ControlNet Union SDXL 1.0](https://huggingface.co/xinsir/controlnet-union-sdxl-1.0) | 직접 그린 선화·외곽선을 따라 장비·스킬 아이콘·소품 시안 생성 | 모델 카드에 Canny·Lineart·Scribble 등 조건과 Apache-2.0이 명시돼 있다. 기본 가중치 파일은 약 2.51GB. | 현재 ComfyUI의 로더·그래프 호환성, 기존 IP-Adapter와 동시 사용 시 8GB 한계, 실제 아이콘 크기 가독성. 먼저 기존 OpenPose와 **교체해 단일 ControlNet**으로 비교한다. |
| **조건부 3** | [LayerDiffuse SDXL](https://huggingface.co/LayerDiffusion/layerdiffusion-v1/tree/main) + [ComfyUI 노드](https://github.com/huchenlei/ComfyUI-layerdiffuse) | 배경 제거 대신 투명 전경 직접 생성 | SDXL attention 가중치 약 743MB와 투명 VAE decoder 약 208MB. 모델 저장소는 CreativeML OpenRAIL-M, 노드 저장소는 Apache-2.0 표기. 노드 README는 RGBA 출력과 64의 배수 해상도 조건을 설명한다. | BiRefNet보다 가장자리·잔광이 실제로 나은지, 기존 확장과 의존성 충돌이 없는지, 8GB 실행 가능성. 노드는 `diffusers` 버전 충돌 가능성을 안내한다. |

### 모델보다 적합한 선택

- **버튼·패널·HUD 규격:** 현재의 코드 생성과 공통 팔레트·9-slice 규격을 유지한다. 생성 모델만으로 상태별 픽셀 정합과 텍스트 배치를 보장할 근거가 없다.
- **기본 UI 아이콘:** [Kenney Game Icons](https://kenney.nl/assets/game-icons)는 공식 페이지에 CC0로 표시돼 있다. 필요한 원본을 고르고 프로젝트 팔레트로 맞춘 뒤 `icon-import`로 출처를 기록하는 경로가 빠르고 일관적이다.
- **FX 시퀀스:** 현재 `fx-gen`의 중심·피벗·밝기 곡선·프레임 수를 유지한다. 모델 출력은 독특한 임팩트 **키 이미지**를 탐색할 때만 선택적으로 쓴다. 완성 애니메이션 타이밍은 별도로 검수한다.
- **캐릭터 전용 LoRA:** 승인된 자체 캐릭터 디자인과 다수의 일관된 학습 이미지가 생긴 후 검토한다. [kohya_ss SDXL LoRA 가이드](https://github.com/bmaltais/kohya_ss/blob/master/docs/LoRA/top_level.md)는 학습 GPU 메모리 최소 12GB를 권장한다. 현재 8GB PC의 첫 추가 작업으로 잡지 않는다.

## 작은 비교 실험

1. **환경 격리:** 기존 ComfyUI와 모델은 보존한다. 새 PC 또는 별도 설치에서 후보를 하나씩 검증하고, 설치 전 공식 저장소의 라이선스·커밋·파일 크기와 SHA-256을 기록한다. 현재 0.33.1에 없는 노드는 업데이트 여부를 확인한 뒤 실행한다.
2. **알파 A/B:** 같은 캐릭터 파일럿 원본 2장을 현재 평면 배경 마스크 방식과 BiRefNet으로 각각 처리한다. 128px 실제 게임 배경, 어두운 배경, 체커 위에서 기계 팔·후드·발·잔광·그림자를 확대해 비교한다. 사람 수정 시간도 기록한다.
3. **형태 A/B:** 승인 가능한 **자체 제작** 장비·아이콘 선화 3장을 준비한다. 같은 SDXL 체크포인트·시드·프롬프트로 Union 조건 유무를 비교한다. 48px 아이콘 크기와 128px 캐릭터 크기에서 실루엣·색·장비 인식성을 본다. 결과가 더 좋아도 글자·버튼 프레임 생성에는 적용하지 않는다.
4. **LayerDiffuse 진입 조건:** BiRefNet 결과에서 가장자리·반투명 FX가 계속 문제일 때만 SDXL 투명 전경을 시험한다. 노드 설치와 모델 다운로드, 실행 메모리, 알파 품질을 별도 기록한다.
5. **승인:** `concept` manifest에 모델 이름·버전·SHA-256·출처·라이선스·ComfyUI 그래프·시드·프롬프트·실행 시간·원본·결과를 연결한다. `sprite-qa`와 실제 배경 시각 QA 후 `review-loop`에 올린다. 사람 승인 전 프로덕션 에셋으로 승격하지 않는다.

## 제외·주의

- [BRIA RMBG-1.4](https://huggingface.co/briaai/RMBG-1.4)는 모델 카드에 비상업적 사용과 별도 상업 계약 조건이 적혀 있어 공유 게임 제작 파이프라인의 기본 후보에서 제외한다.
- 공개된 산나비 추출 이미지를 LoRA 학습 데이터로 사용하지 않는다. 이 조사와 UI 시안은 레퍼런스의 측정 특성을 바탕으로 한 콘셉트이며 원본 게임 아트를 재배포하는 제안이 아니다.
- 후보의 모델 카드·코드 라이선스는 서로 다를 수 있다. 실제 배포나 공유 번들에 포함하기 전 각각의 최신 약관을 다시 확인한다.

**결론:** 첫 실험은 BiRefNet의 알파 품질 비교, 둘째는 Union SDXL의 선화 기반 장비·아이콘 시안 비교다. 설치와 품질 개선은 아직 확인하지 않았다.
