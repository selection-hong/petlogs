# PetLogs 프론트엔드 (Vue 3 SPA)

백엔드(`petlogs 1차 REST API`)에 **정적 리소스 형태로 병합된** 프론트엔드입니다.
별도 빌드 도구·노드 서버 없이 Spring Boot가 그대로 서빙합니다.

## 구조

```
src/main/resources/static/
├── index.html                 # SPA 셸 (폰트 / Tailwind / Vue / 스크립트 로드)
└── assets/
    ├── theme.js               # Tailwind 디자인 토큰 (프로토타입 DESIGN.md 기준)
    ├── styles.css             # polaroid-card, tactile-shadow, 버튼/태그/필드 등
    ├── api.js                 # REST 클라이언트 (세션 쿠키 · ApiResponse 언랩 · 401 처리)
    ├── app.js                 # 전역 스토어 + 공통 컴포넌트(사이드바/헤더/모달/토스트)
    ├── views-core.js          # 로그인 / 회원가입 / 대시보드 / 공개 문진
    ├── views-clients.js       # 고객 디렉터리 / 고객 프로필(일지)
    ├── views-surveys.js       # 사전 문진 목록 / 상세(AI 분석)
    ├── views-logs.js          # 훈련 일지 아카이브
    ├── views-community.js     # 커뮤니티 목록 / 상세 / 작성
    └── router.js              # 해시 라우터 + 루트 앱 + 마운트
```

## 실행

```bash
# 1) DB 준비 (docs/schema.sql), application.yml 의 datasource 확인
# 2) 백엔드 빌드/실행
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

- 앱:           http://localhost:8081/
- API 문서:      http://localhost:8081/docs  (Swagger UI)
- 테스트 계정:    trainer1@test.com / 1234

## 기술 선택 이유

- **정적 SPA + 동일 출처(8081)**: 프론트가 백엔드와 같은 출처에서 서빙되므로
  세션 쿠키(JSESSIONID)가 자동 전송된다. 별도 CORS 설정·토큰 저장이 필요 없다.
- **Vue 3 (CDN global build)**: 빌드 단계 없이 `template` 문자열을 런타임 컴파일.
  컴파일러 포함 빌드(`vue.global.prod.js`)를 사용.
- **Tailwind Play CDN + 토큰**: 프로토타입의 컬러/타이포/스페이싱 토큰을 그대로 이식.
- **해시 라우팅(#/...)**: 서버 측 포워딩이 불필요 — 모든 경로가 index.html 로 귀결.

## 화면 ↔ API 매핑

| 화면 | 경로 | 사용 API |
|------|------|----------|
| 로그인/회원가입 | `#/login`, `#/signup` | `POST /api/auth/login`, `/signup`, `/logout` |
| 대시보드 | `#/dashboard` | `GET /api/dashboard` |
| 고객 디렉터리 | `#/clients` | `GET/POST /api/training-cases` |
| 고객 프로필 | `#/clients/{id}` | `GET /training-cases/{id}`, `/logs`, `PATCH .../status`, 일지 CRUD |
| 사전 문진 | `#/pre-consultation` | `GET /api/surveys`, `POST /surveys/link` |
| 문진 상세 | `#/pre-consultation/{id}` | `GET /surveys/{id}`, `PATCH .../confirm`, `POST .../ai-analysis` |
| 공개 문진(보호자) | `#/survey/{token}` | `POST /api/surveys/public/{token}` (비로그인) |
| 훈련 일지 | `#/logs` | 전 케이스 `GET /training-cases/{id}/logs` 통합 |
| 커뮤니티 | `#/community` | `GET/POST /api/posts`, 좋아요/북마크/댓글/신고 |

## 참고

- 프로토타입의 `insight_collector_scheduler` 화면은 **뉴스 수집 배치 스케줄러**로,
  본 백엔드(PetLogs)에 대응 API가 없어 구현에서 제외했다(다른 템플릿 잔재).
- 공개 문진은 토큰 기반 제출만 지원한다(백엔드에 토큰 단건 조회 공개 API가 없음).
