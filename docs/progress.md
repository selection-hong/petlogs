# PetTrainer Pro — 진행 현황

## 전체 구현 단계

| 단계 | 내용 | 상태 |
|---|---|---|
| **[1단계] 프로젝트 세팅** | pom.xml, application.yml, DB 스키마, 글로벌 클래스 | ✅ 완료 |
| **[2단계] 인증** | 회원가입 / 로그인 / 로그아웃 (세션), JSP 뷰 | ✅ 완료 |
| **[3단계] 문진 (Survey)** | 토큰 생성, 보호자 폼, 문진 목록/상세, AI 분석(Mock) | ✅ 완료 |
| **[4단계] 훈련 케이스 & 일지** | 케이스 CRUD, 일지 CRUD, 대시보드 | ✅ 완료 |
| **[5단계] 커뮤니티** | 게시글, 댓글, 좋아요, 북마크, 페이지네이션 | 🔜 다음 |
| **[6단계] 관리자** | 회원 관리, 신고 처리 | 🔜 대기 |

---

## 생성된 파일 목록

### 설정 파일
- `pom.xml` — JSP (tomcat-embed-jasper, JSTL), Validation, Swagger 의존성 추가
- `src/main/resources/application.yml` — DB, MyBatis, JSP 뷰 리졸버, Swagger 설정
- `docs/schema.sql` — MySQL DDL + 테스트 초기 데이터

### 글로벌
- `global/common/ApiResponse.java`
- `global/exception/BusinessException.java`
- `global/exception/GlobalExceptionHandler.java`
- `global/config/WebMvcConfig.java`
- `global/config/SwaggerConfig.java`

### Auth (인증)
- `auth/dto/LoginRequest.java`
- `auth/dto/SignupRequest.java`
- `auth/dto/LoginResponse.java`
- `auth/service/AuthService.java`
- `auth/controller/AuthController.java` (@RestController)
- `auth/controller/AuthViewController.java` (@Controller)

### Member (회원)
- `member/entity/Member.java`
- `member/mapper/MemberMapper.java`
- `mapper/MemberMapper.xml`

### Survey (문진)
- `survey/entity/Survey.java`
- `survey/entity/AiAnalysis.java`
- `survey/dto/SurveyLinkRequest.java`
- `survey/dto/SurveySubmitRequest.java`
- `survey/dto/SurveyResponse.java`
- `survey/mapper/SurveyMapper.java`
- `survey/service/SurveyService.java`
- `survey/controller/SurveyController.java`
- `survey/controller/SurveyViewController.java`
- `mapper/SurveyMapper.xml`

### Pet (반려견)
- `pet/entity/Pet.java`
- `pet/mapper/PetMapper.java`
- `mapper/PetMapper.xml`

### Training (훈련 케이스 & 일지)
- `training/entity/TrainingCase.java`
- `training/entity/TrainingLog.java`
- `training/dto/TrainingCaseRequest.java`
- `training/dto/TrainingLogRequest.java`
- `training/mapper/TrainingMapper.java`
- `training/service/TrainingService.java`
- `training/controller/TrainingController.java`
- `training/controller/TrainingViewController.java`
- `mapper/TrainingMapper.xml`

### JSP 뷰
- `WEB-INF/views/layout/head.jsp` — Bootstrap 5, 공통 CSS
- `WEB-INF/views/layout/sidebar.jsp` — 사이드바 네비게이션
- `WEB-INF/views/layout/topbar.jsp` — 상단바 + 로그아웃
- `WEB-INF/views/auth/login.jsp`
- `WEB-INF/views/auth/signup.jsp`
- `WEB-INF/views/dashboard/dashboard.jsp` — 통계 카드 4개 + 최근 목록 2개
- `WEB-INF/views/survey/surveys.jsp` — 문진 목록 + 상세 패널
- `WEB-INF/views/survey/survey-link.jsp` — 링크 생성
- `WEB-INF/views/survey/owner-survey.jsp` — 보호자 문진 폼 (공개)
- `WEB-INF/views/training/cases.jsp` — 케이스 목록 + 상세 + 일지 CRUD

---

## 실행 전 체크리스트

### 1. MySQL DB 준비
```sql
-- MySQL에서 실행
source docs/schema.sql;
```

### 2. application.yml DB 비밀번호 확인
```yaml
# src/main/resources/application.yml
spring.datasource.password: root  ← 본인 DB 비밀번호로 변경
```

### 3. STS에서 실행
- Run as → Spring Boot App
- http://localhost:8080 → http://localhost:8080/auth/login 으로 리다이렉트

### 4. 테스트 계정 (schema.sql 초기 데이터)
- `trainer1@test.com` / `1234`
- `admin@test.com` / `1234`

### 5. Swagger UI
- http://localhost:8080/swagger-ui/index.html
- (Spring Boot 4.x와 springdoc 2.x 호환 여부에 따라 동작 안 할 수 있음)

---

## 다음 작업 (5단계 — 커뮤니티)

### 구현할 것
1. Post 엔티티/Mapper/Service/Controller
2. Comment CRUD
3. 좋아요/북마크 토글
4. 페이지네이션 (오프셋, 10건 고정)
5. 게시판 JSP (목록, 상세, 작성)
6. 신고 기능

---

## 참고 문서
- `CLAUDE.md` — 프로젝트 전체 지시사항
- `docs/PRD.md` — 기획/ERD/API 명세
- `docs/UI_PROTOTYPE.md` — 화면 구조 및 UX 결정사항
- `docs/schema.sql` — DB DDL
