# PetTrainer Pro — REST API 전환 리팩터링 노트

JSP 기반 MVC + REST 혼재 구조를 **순수 REST API 서버**로 전환했습니다.
DB 스키마(`docs/schema.sql`), MyBatis Mapper/XML 구조, 세션 기반 로그인(Spring Security 미사용)은 그대로 유지했습니다.

## 1. 제거된 JSP / MVC 계층

| 항목 | 처리 |
|------|------|
| `src/main/webapp/WEB-INF/views/**.jsp` | 디렉터리 전체 삭제 |
| `AuthViewController` | 삭제 |
| `SurveyViewController` | 삭제 |
| `TrainingViewController` | 삭제 (대시보드 기능은 REST로 이전, 아래 6번) |
| `CommunityViewController` | 삭제 |
| `pom.xml` JSP 의존성 | `tomcat-embed-jasper`, `jakarta.servlet.jsp.jstl-api`, `jakarta.servlet.jsp.jstl` 제거 |
| `application.yml` | `spring.mvc.view`(prefix/suffix) 제거 |
| `WebMvcConfig` | `"/" → "/auth/login"`(JSP) 리다이렉트 제거. 진입 편의를 위해 `"/" → "/swagger-ui/index.html"` 로 변경. 업로드 파일 정적 제공 핸들러는 유지 |

전환 후 모든 컨트롤러는 `@RestController` 뿐이며, 화면 이동 / `Model` 전달 / JSP 경로 반환 로직은 존재하지 않습니다.

## 2. 응답 규약 통일

- 본문이 있는 모든 응답은 `ResponseEntity<ApiResponse<T>>` 로 통일.
- **생성(201 Created)**: `ResponseEntity.created(location)` 으로 `Location` 헤더 반환.
- **삭제(204 No Content)**: `ResponseEntity.noContent().build()`.
  - HTTP 204는 스펙상 본문을 가질 수 없으므로 `ApiResponse`로 감싸지 않고 `ResponseEntity<Void>`로 반환합니다(의도된 예외).

### Location 헤더가 추가된 생성 API

| 메서드 / 경로 | Location |
|---|---|
| `POST /api/surveys/link` | `/api/surveys/{surveyId}` |
| `POST /api/training-cases` | `/api/training-cases/{caseId}` |
| `POST /api/training-cases/{caseId}/logs` | `/api/training-cases/{caseId}/logs/{logId}` |
| `POST /api/posts` | `/api/posts/{postId}` |
| `POST /api/posts/{postId}/comments` | `/api/posts/{postId}/comments/{commentId}` |

> `POST /api/auth/signup` 은 201을 반환하지만, 이 API에 회원 단건 조회(GET) 리소스가 없어
> 가리킬 정식 URI가 존재하지 않습니다. 존재하지 않는 엔드포인트를 가리키는 잘못된 Location을
> 넣지 않고 **의도적으로 생략**했습니다(코드에도 주석으로 명시).

## 3. 입력 검증 (Jakarta Bean Validation)

`@RequestBody Map<String, String>` 로 받던 곳을 검증 가능한 DTO로 교체하고 `@Valid` 적용:

| 위치 | 변경 전 | 변경 후 |
|---|---|---|
| 케이스 상태 변경 | `Map<String,String> body` | `CaseStatusRequest` (`@NotBlank status`) |
| 댓글 작성 | `Map<String,String> body` | `CommentRequest` (`@NotBlank content`) |
| 게시글 신고 | `Map<String,String> body` | `ReportRequest` (`@NotBlank @Size(500) reason`) |

기존 DTO들의 `@Valid` 검증은 그대로 유지됩니다.

## 4. 예외 중앙 처리 (`@RestControllerAdvice`)

`GlobalExceptionHandler` 를 확장하여 모든 예외를 `ApiResponse` JSON으로 통일:

- `BusinessException` → 도메인 지정 상태코드
- `MethodArgumentNotValidException` → 400, **필드별 메시지를 `data`에 Map으로** 포함
- `ConstraintViolationException` → 400
- `HttpMessageNotReadableException` (잘못된 JSON) → 400
- `MissingServletRequestParameterException` → 400
- `MethodArgumentTypeMismatchException` → 400
- `HttpRequestMethodNotSupportedException` → 405
- `NoResourceFoundException` (미매핑 경로) → 404
- `Exception` (그 외) → 500

`ApiResponse` 에는 검증 오류 본문 전달용 `error(String message, T data)` 오버로드를 추가했습니다.

## 5. Swagger / OpenAPI

기존 `SwaggerConfig` 유지. 신규 `Dashboard` 태그 포함 모든 API가 문서에 노출됩니다.
- Swagger UI: `http://localhost:8081/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`

## 6. 대시보드 기능 보존 (JSP → REST)

삭제한 `TrainingViewController.dashboard()` 가 화면으로 내려주던 통계/최근 목록을
신규 REST 엔드포인트로 이전했습니다(기능 손실 없음).

- `GET /api/dashboard` → `DashboardResponse`
  - `totalCases`, `inProgress`, `unconfirmed`, `completedThisMonth`
  - `recentSurveys`(List&lt;SurveyResponse&gt;), `recentCases`(List&lt;TrainingCase&gt;)
- 서비스 계층 메서드는 기존 것을 재사용했습니다.

## 7. 변경하지 않은 것 (요구사항에 따라 유지)

- DB 스키마(`docs/schema.sql`).
- MyBatis Mapper 인터페이스 / `resources/mapper/*.xml`.
- 세션 기반 로그인 (`HttpSession`의 `loginMember` 속성). Spring Security 미도입.
- 비밀번호 평문 저장 등 기존 보안 정책(현 프로젝트 범위 유지).

## 8. 후속 개선 제안 (이번 범위 외)

- 컨트롤러마다 중복된 `getLogin(session)` 헬퍼 → 인터셉터 또는 `HandlerMethodArgumentResolver`로 중앙화.
- 비밀번호 해싱(BCrypt 등) 도입.
- `report` 엔드포인트(현재 200)를 자원 조회 API와 함께 201로 승격 검토.
