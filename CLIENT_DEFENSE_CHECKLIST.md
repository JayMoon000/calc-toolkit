# Client-Side Robustness & Defense Checklist
(ToolLab, Starsign16 Web, Starsign16 Player 공통 적용 표준)

## 1. 이벤트 제어 및 입력 버퍼링 (Event & Input Defense)
- [ ] **디바운스 (Debounce) 적용**
  - 검색창, 텍스트 필터링 등 타이핑 기반 실시간 연산: 200~300ms 딜레이 적용.
  - 플레이어 검색창 및 점성술 텍스트 인풋에 불필요한 즉각 연산 차단.
- [ ] **쓰로틀 (Throttle) 적용**
  - 연산/생성 버튼 다중 클릭(광클) 방지: 최소 500ms~1초 간격 제한 및 실행 중 `disabled` 처리.
  - 오디오 플레이어 탐색 바(Seek Bar) 이동 및 볼륨 슬라이더 조작 시 IPC 통신/상태 갱신 빈도 제어.
- [ ] **한글 IME 조합 버그 방어 (`e.isComposing`)**
  - Enter 키 이벤트 리스너에 `if (e.nativeEvent.isComposing) return;` 필수 추가 (중복 제출 방지).

## 2. 수치 한계선 및 경계값 검증 (Boundary & Edge Case Check)
- [ ] **수치 상한선 제한 (Clamp)**
  - 금융/수치 계산식: `Math.min()`, `Math.max()`를 사용해 기간, 금액, 배율의 물리적 상한선 강제.
  - `Infinity`, `NaN` 발생 차단 및 수치 유효 범위 밖 입력 시 경고 또는 자동 보정.
- [ ] **비정상 입력값 필터링 및 살균 (Sanitization)**
  - 숫자 전용 필드에 붙여넣기되는 특수문자, 지수 표기(`e`, `E`), 다중 소수점, 공백 제거.
  - 점성술 날짜/시간 입력 시 존재하지 않는 일자(예: 2월 31일 등) 원천 차단.
- [ ] **공백/Null 기본값 자동 복구 (Fallback)**
  - 인풋을 전부 지우고 포커스를 벗어날 때(Blur) 직전 유효값 또는 정의된 기본값(0, 오늘 날짜 등)으로 안전하게 롤백.

## 3. 영구 저장소 및 세션 상태 방어 (Storage & State Defense)
- [ ] **LocalStorage / Local Config 파싱 예외 처리**
  - 모든 `JSON.parse`는 반드시 `try-catch` 블록으로 감싸기.
  - 스키마가 변경되었거나 데이터가 오염되었을 경우 앱을 뻗게 하지 않고 `localStorage.removeItem()` 후 기본값으로 초기화.
- [ ] **스토리지 접근 제한 예외 처리**
  - 브라우저 비공개 모드(Incognito)나 파일 쓰기 권한 제한 시 에러 없이 메모리(In-Memory) 상태로 폴백 작동.

## 4. 런타임 크래시 및 렌더링 최적화 (Error Boundary & UI Performance)
- [ ] **React Error Boundary 격리**
  - 개별 툴/컴포넌트 단위로 Error Boundary를 감싸, 특정 뷰에서 크래시가 나더라도 메인 네비게이션과 전체 앱이 화이트아웃(White Screen)되지 않도록 방어.
  - "다시 시도" 또는 "상태 초기화" 버튼이 포함된 직관적인 Fallback UI 제공.
- [ ] **대량 리스트 렌더링 최적화 (Virtualization)**
  - 5일장 전체 리스트, 오디오 플레이리스트, 방대한 분석 리포트 카드 렌더링 시 가상 스크롤(Virtual Scroll) 또는 페이징 처리로 DOM 과부하 차단.
- [ ] **모바일/데스크톱 인터랙션 오작동 방지**
  - 모바일 더블탭 줌 방지, 모달 노출 시 배경 스크롤 락(`overflow: hidden`).