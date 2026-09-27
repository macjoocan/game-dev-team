# 8GB PC 아트 모델 파일럿 — 2026-09-28

**상태: concept 실험.** [후보 조사](model-candidates-2026-09-27.md)를 이 PC에서 실행한 결과다. 모델 가중치는 저장소에 넣지 않았다. 비교 이미지는 [검수 시트](model-pilot-2026-09-28/review-sheet.jpg), BiRefNet의 원본 마스크 비교는 [anticipation](model-pilot-2026-09-28/birefnet-anticipation.png)과 [contact](model-pilot-2026-09-28/birefnet-contact.png)에서 확인한다.

## 환경과 입력

- ComfyUI 0.33.1, RTX 4070 Laptop GPU 8GB, `--lowvram`, 512×512, SDXL Base 1.0 + Pixel Art XL LoRA 0.8, 20 steps, CFG 6, DPM++ 2M/Karras. 모델은 별도 테스트 경로에 두고 기존 설치를 바꾸지 않았다.
- 캐릭터 A/B는 기존 `sanabi-prototype/assets/generated/pose_reference_pilot/anticipation.png`를 선화 입력으로 사용했다. 추가 조합은 `contact.png` 선화와 `anticipation.png` IP-Adapter 참조를 사용했다. **이 그림은 승인된 캐릭터 디자인이 아니다.**
- 아이콘 A/B는 새로 그린 [흑백 갈고리 장비 윤곽](model-pilot-2026-09-28/grappling_icon_guide.png)을 입력했다. 두 A/B 모두 같은 체크포인트·프롬프트·시드로 비교했고 ControlNet 조건만 달랐다. 캐릭터 시드 `270927`, 아이콘 시드 `270928`.
- 실행 그래프는 [이 폴더](model-pilot-2026-09-28/)에 보관했다. `*.api.json` 파일은 ComfyUI API 그래프이며, 파일명으로 실험을 구분한다. 실행 시간은 API 제출부터 완료까지의 벽시계 시간이다. 캐시 상태에 따라 달라질 수 있다.

## 결과

| 시험 | 실측 | 눈으로 확인한 결과 |
|---|---:|---|
| BiRefNet, anticipation/contact | 각 약 2초, 첫 모델 로드 이후 | 기존 평면 배경 색상 분리와 거의 같다. `alpha ≥ 128` 전경 마스크 IoU가 각각 0.9927, 0.9913이다. 이 입력에선 의미 있는 개선을 확인하지 못했다. |
| 캐릭터 기본 생성 | 14.1초 | 정면에 가까운 포즈로 나왔다. |
| 캐릭터 + Union Canny | 12.1초 | 입력의 오른쪽 방향 실루엣을 따른다. 의상·팔 장비가 아직 불안정하다. |
| 장비 아이콘 기본 생성 | 8.1초 | 정리된 아이콘 모양이나 작성한 갈고리 구조와 다르다. |
| 장비 아이콘 + Union lineart | 10.1초 | 큰 U자와 아래 몸체를 따르지만 장비 기능이 명확하지 않고 과한 그림자가 붙었다. 48px 축소에서도 바로 채택하기 어렵다. |
| 캐릭터 + Union Canny + IP-Adapter Plus | 16.1초 | **8GB에서 실행 성공.** 오른쪽 방향과 청록 바이저를 유지했으나 외투·바지·장비 디테일은 참조와 다르다. |

BiRefNet의 전경 픽셀은 기존 마스크 49,163/66,043px, BiRefNet 48,817/65,512px였다. IoU는 `alpha ≥ 128` 이진 마스크끼리의 겹침이다. 가장자리 미관이나 게임 화면 가독성을 증명하는 수치는 아니다. 두 결과 모두 수동 알파·그림자 정리가 필요하다.

## 판단

- **이 PC의 가능 범위:** SDXL + 단일 Union, SDXL + Union + IP-Adapter, BiRefNet 후처리까지 512px 한 장씩 실행된다. 배치 생산 속도, 8–16프레임 연속성, 48px 실제 HUD 가독성, 장시간 메모리 안정성은 검증하지 않았다.
- **우선 적용:** 포즈나 큰 실루엣을 고정할 때 Union을 선택적으로 쓸 수 있다. 장비 아이콘은 사람이 정한 윤곽과 후편집이 여전히 필요하다. 첫 아이콘 비교에서는 Union 결과가 시각적으로 더 좋지 않았다.
- **LayerDiffuse:** 이번 평면 배경 두 장에서는 BiRefNet 대비 해결해야 할 뚜렷한 가장자리 결함이 새로 드러나지 않아 진행 조건을 충족하지 않았다. 노드의 `diffusers` 의존성도 현재 ComfyUI Python에 없다. 별도 환경에서 반투명 FX 입력을 준비한 뒤 시험할 후보로 남긴다.
- **승인:** 모두 `concept`이며 게임 런타임이나 프로덕션 manifest에 넣지 않았다. 실제 화면·작은 크기·바쁜 전투 화면에서 사람 검수가 필요하다.

## 출처와 재현 정보

| 구성 | 출처·조건 | SHA-256 |
|---|---|---|
| BiRefNet `birefnet.safetensors` (444,473,596B) | [Comfy-Org/BiRefNet](https://huggingface.co/Comfy-Org/BiRefNet/tree/main/background_removal), MIT | `9ab37426bf4de0567af6b5d21b16151357149139362e6e8992021b8ce356a154` |
| Union SDXL `diffusion_pytorch_model.safetensors` (2,512,030,408B) | [xinsir/controlnet-union-sdxl-1.0](https://huggingface.co/xinsir/controlnet-union-sdxl-1.0), Apache-2.0 | `a9e13fd61f3193887791c8a0dd07a07202174dc47d5ddaea94ea1344f07c7467` |
| IP-Adapter Plus 노드·모델 | [cubiq/ComfyUI_IPAdapter_plus](https://github.com/cubiq/ComfyUI_IPAdapter_plus), GPL-3.0; [h94/IP-Adapter](https://huggingface.co/h94/IP-Adapter), Apache-2.0 | 기존 파일 값은 `sanabi-prototype/assets/generated/pose_reference_pilot/manifest.json` 참고 |

두 새 모델의 SHA-256은 다운로드 파일과 공식 저장소의 파일 페이지 값을 대조했다. ComfyUI의 `SetUnionControlNetType`을 `canny/lineart/anime_lineart/mlsd`로 설정했다. Union 조건 강도는 단독 A/B에서 0.8, IP-Adapter 조합에서 0.85다. 캐릭터 조합의 IP-Adapter weight는 0.75다. 라이선스는 공유 파이프라인 배포 전에 각 구성 요소별로 다시 확인해야 한다.
