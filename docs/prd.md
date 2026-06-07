# PetTrainer Pro — 기획 및 요구사항 정의서

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | PetTrainer Pro |
| 서비스 유형 | 반려동물 훈련사 지원 B2B SaaS 웹서비스 |
| 핵심 사용자 | 전문 반려견 훈련사, 관리자, 외부 보호자 |
| 개발 기간 | 2026.05.15 ~ 2026.06.25 (6주) |
| 팀 구성 | 2인, Java 비전공 트랙 |

PetTrainer Pro는 전문 반려견 훈련사가 보호자 상담, 문제행동 진단, 훈련 회차 기록, 일정 관리, 노하우 공유를 개별 메신저와 메모장에 분산 관리하는 문제를 해결하기 위한 웹서비스입니다.

---

## 문제 정의

| 문제 영역 | 기존 방식의 한계 | 서비스 해결 방향 |
|---|---|---|
| 보호자 상담 | 카카오톡, 전화, 메모장에 정보 분산 | 외부 URL 기반 사전 문진으로 입력 데이터 표준화 |
| 문제행동 진단 | 보호자의 주관적 설명에 의존 | 정형 문진 항목과 AI 요약으로 초기 상담 품질 향상 |
| 훈련 기록 | 회차별 훈련 내용 누락, 검색 어려움 | 고객별·회차별 훈련일지 CRUD 제공 |
| 노하우 공유 | 훈련사 간 사례 공유가 폐쇄적 | 훈련사 전용 커뮤니티와 검색·정렬 기능 제공 |

---

## 사용자 역할

| 사용자 | 설명 | 주요 기능 |
|---|---|---|
| 보호자 (Owner) | 훈련사의 외부 URL을 통해 문진 작성 | 사전 문진 작성, 반려견 정보 입력 |
| 훈련사 (Trainer) | 서비스의 핵심 사용자 | 고객 데이터 관리, 훈련일지 작성, 커뮤니티 활용, AI 분석 확인 |
| 관리자 (Admin) | 서비스 운영자 | 회원 관리, 신고 게시글 관리 |

---

## 핵심 서비스 플로우

```
훈련사가 사전 문진 URL 생성
  → 보호자에게 링크 전달
  → 보호자가 반려견 정보 및 문제행동 제출
  → 훈련사가 AI 분석 요청 (수동)
  → AI가 문제행동 요약 및 훈련 방향 반환
  → 훈련사가 문진 확인 및 훈련 케이스 생성
  → 훈련사가 회차별 훈련일지 작성
```

---

## 기능 목록 (MoSCoW)

### Must — 반드시 구현

| 기능 | 예상 공수 |
|---|---|
| 회원가입 / 로그인 / 로그아웃 | 18h |
| 보호자 사전문진 작성 (토큰 기반 공개 URL) | 12h |
| 반려견 기본 정보 등록 | 8h |
| 사전문진 목록 + 상세 조회 | 6h |
| 훈련일지 작성 / 조회 / 수정 / 삭제 | 32h |
| 훈련 진행 상태 관리 (접수→상담→훈련→완료) | 8h |
| 훈련 회차별 기록 | 12h |
| 훈련사 전용 게시판 CRUD | 16h |
| 게시판 페이지네이션 (오프셋, 10건) | 4h |
| 댓글 CRUD | 10h |
| 게시글 추천 / 좋아요 | 8h |

### Should — 핵심 이후 구현

| 기능 | 리스크 |
|---|---|
| 마이페이지 | 낮음 |
| 사전문진 수정 / 삭제 | 상태 제어 필요 |
| 게시글 카테고리 | 낮음 |
| 게시글 검색 (MyBatis 동적 쿼리) | 중간 |
| AI 문제행동 요약 | 외부 API 의존 |
| AI 훈련 방향 제안 | API 비용 및 응답 지연 |

### Could — 일정 여유 시

| 기능 |
|---|
| 회원 목록 조회 (관리자) |
| 게시글 신고 관리 |
| 찜 / 북마크 |

### Won't — 이번 범위 제외

| 기능 | 제외 사유 |
|---|---|
| 결제 / 계약 자동화 | 운영 리스크 큼 |
| 실시간 채팅 | WebSocket 구현 부담 |
| 모바일 앱 | 범위 초과 |
| 보호자 직접 가입 | B2B 방향과 충돌 |

---

## ERD

```
member          (member_id PK, email UK, password, name, role, phone, created_at)
pet             (pet_id PK, owner_id FK→member, name, breed, age, gender, neutered)
survey          (survey_id PK, pet_id FK, trainer_id FK→member, problem_behavior, status, submitted_at)
survey_image    (image_id PK, survey_id FK, file_path, created_at)
ai_analysis     (analysis_id PK, survey_id FK, behavior_type, risk_level, summary, training_direction)
training_case   (case_id PK, trainer_id FK→member, pet_id FK, status, started_at, completed_at)
training_log    (log_id PK, case_id FK, session_no, goal, content, improvement, trained_at)
training_log_image (image_id PK, log_id FK, file_path)
post            (post_id PK, writer_id FK→member, category, title, content, view_count, hidden, created_at)
comment         (comment_id PK, post_id FK, writer_id FK→member, content, created_at)
post_like       (like_id PK, post_id FK, member_id FK — UNIQUE(post_id, member_id))
bookmark        (bookmark_id PK, post_id FK, member_id FK — UNIQUE(post_id, member_id))
post_report     (report_id PK, post_id FK, reporter_id FK→member, reason, created_at)
```

### 주요 상태값 (enum 또는 코드값)

| 테이블 | 컬럼 | 값 |
|---|---|---|
| member | role | TRAINER, ADMIN |
| survey | status | 미확인, 확인 완료 |
| training_case | status | 접수 완료, 상담 중, 훈련 중, 완료 |
| post | hidden | 0(정상), 1(숨김) |

---

## API 명세

### Auth

| Method | URI | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/auth/signup` | 회원가입 | Public |
| POST | `/api/auth/login` | 로그인 | Public |
| POST | `/api/auth/logout` | 로그아웃 | 로그인 |
| GET | `/api/members/me` | 내 정보 조회 | 로그인 |
| PATCH | `/api/members/me` | 회원 정보 수정 | 로그인 |

### Survey (문진)

| Method | URI | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/surveys/public/{token}` | 보호자 문진 제출 | Public |
| GET | `/api/surveys` | 문진 목록 조회 | Trainer |
| GET | `/api/surveys/{surveyId}` | 문진 상세 조회 | Trainer |
| PATCH | `/api/surveys/{surveyId}/confirm` | 확인 완료 처리 | Trainer |
| POST | `/api/surveys/{surveyId}/ai-analysis` | AI 분석 요청 | Trainer |

### Training Case (훈련 케이스)

| Method | URI | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/training-cases` | 케이스 목록 | Trainer |
| POST | `/api/training-cases` | 케이스 생성 | Trainer |
| PATCH | `/api/training-cases/{caseId}/status` | 상태 변경 | Trainer |

### Training Log (훈련일지)

| Method | URI | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/training-cases/{caseId}/logs` | 일지 목록 | Trainer |
| POST | `/api/training-cases/{caseId}/logs` | 일지 작성 | Trainer |
| GET | `/api/training-logs/{logId}` | 일지 상세 | Trainer |
| PATCH | `/api/training-logs/{logId}` | 일지 수정 | Trainer |
| DELETE | `/api/training-logs/{logId}` | 일지 삭제 | Trainer |

### Community (커뮤니티)

| Method | URI | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/posts` | 게시글 목록 (페이지네이션, 검색, 정렬) | Trainer |
| POST | `/api/posts` | 게시글 작성 | Trainer |
| GET | `/api/posts/{postId}` | 게시글 상세 | Trainer |
| PATCH | `/api/posts/{postId}` | 게시글 수정 | 작성자 |
| DELETE | `/api/posts/{postId}` | 게시글 삭제 | 작성자 |
| POST | `/api/posts/{postId}/comments` | 댓글 작성 | Trainer |
| DELETE | `/api/comments/{commentId}` | 댓글 삭제 | 작성자 |
| POST | `/api/posts/{postId}/likes` | 좋아요 토글 | Trainer |
| POST | `/api/posts/{postId}/bookmarks` | 북마크 토글 | Trainer |
| POST | `/api/posts/{postId}/reports` | 게시글 신고 | Trainer |

### Admin

| Method | URI | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/admin/members` | 회원 목록 | Admin |
| PATCH | `/api/admin/members/{memberId}/role` | 권한 수정 | Admin |
| GET | `/api/admin/reports` | 신고 목록 | Admin |
| PATCH | `/api/admin/posts/{postId}/hide` | 게시글 숨김 | Admin |

---

## 패키지 구조

```
com.pettrainer.pro
├── global/
│   ├── config/          -- MVC, MyBatis, Swagger 설정
│   └── exception/       -- GlobalExceptionHandler, ApiResponse
├── auth/                -- 회원가입, 로그인, 로그아웃
├── member/              -- 내 정보 조회/수정
├── pet/                 -- 반려견 정보
├── survey/              -- 문진, AI 분석
├── training/            -- 케이스, 일지
├── community/           -- 게시판, 댓글, 좋아요, 북마크
└── admin/               -- 관리자
```

---

## 6주 개발 로드맵

| 주차 | 기간 | 목표 |
|---|---|---|
| W1 | 05.15~05.21 | 기획/설계, 환경 세팅 |
| W2 | 05.22~05.30 | 회원가입/로그인, 문진 등록 |
| W3 | 05.30~06.04 | 이미지 업로드, 훈련일지 CRUD |
| W4 | 06.05~06.12 | 커뮤니티, AI 연동, 관리자 |
| W5 | 06.13~06.19 | 테스트, 버그 수정, 쿼리 튜닝 |
| W6 | 06.20~06.25 | 시연 데이터, 발표 자료 |

---

## 참고 문서

- Spring Boot: https://docs.spring.io/spring-boot/reference/index.html
- MyBatis: https://mybatis.org/mybatis-3/
- springdoc-openapi: https://springdoc.org/
- MySQL 8.0: https://dev.mysql.com/doc/refman/8.0/en/
