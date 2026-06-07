-- PetTrainer Pro Database Schema
-- MySQL 8.0

CREATE DATABASE IF NOT EXISTS pettrainer
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE pettrainer;

-- 훈련사/관리자 회원 테이블 (Owner는 비회원, survey에 inline 저장)
CREATE TABLE IF NOT EXISTS member (
    member_id  BIGINT       NOT NULL AUTO_INCREMENT,
    email      VARCHAR(100) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    name       VARCHAR(50)  NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'TRAINER', -- TRAINER | ADMIN
    phone      VARCHAR(20),
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (member_id),
    UNIQUE KEY uq_member_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 반려견 테이블 (훈련사가 케이스 생성 시 생성)
CREATE TABLE IF NOT EXISTS pet (
    pet_id      BIGINT       NOT NULL AUTO_INCREMENT,
    trainer_id  BIGINT       NOT NULL,
    owner_name  VARCHAR(50),
    owner_phone VARCHAR(20),
    name        VARCHAR(50)  NOT NULL,
    breed       VARCHAR(50),
    age         INT,
    gender      VARCHAR(10),
    neutered    BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (pet_id),
    FOREIGN KEY (trainer_id) REFERENCES member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 보호자 문진 테이블
-- token이 생성될 때 행이 INSERT되고, 보호자가 제출하면 나머지 컬럼이 UPDATE됨
-- submitted_at IS NULL → 아직 보호자가 제출하지 않은 대기 상태
CREATE TABLE IF NOT EXISTS survey (
    survey_id        BIGINT        NOT NULL AUTO_INCREMENT,
    trainer_id       BIGINT        NOT NULL,
    pet_id           BIGINT,                             -- 케이스 생성 시 연결
    token            VARCHAR(100)  NOT NULL,              -- UUID 기반 공개 URL 토큰
    owner_name       VARCHAR(50),
    owner_phone      VARCHAR(20),
    pet_name         VARCHAR(50),
    breed            VARCHAR(50),
    age_years        INT,
    gender           VARCHAR(10),
    neutered         BOOLEAN,
    problem_behavior VARCHAR(500),                        -- 콤마 구분 체크박스값
    behavior_detail  TEXT,
    training_goal    TEXT,
    status           VARCHAR(20)   NOT NULL DEFAULT '미확인',
    submitted_at     TIMESTAMP,                           -- NULL이면 미제출
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (survey_id),
    UNIQUE KEY uq_survey_token (token),
    FOREIGN KEY (trainer_id) REFERENCES member (member_id),
    FOREIGN KEY (pet_id)     REFERENCES pet (pet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 문진 첨부 이미지
CREATE TABLE IF NOT EXISTS survey_image (
    image_id   BIGINT        NOT NULL AUTO_INCREMENT,
    survey_id  BIGINT        NOT NULL,
    file_path  VARCHAR(500)  NOT NULL,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (image_id),
    FOREIGN KEY (survey_id) REFERENCES survey (survey_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AI 분석 결과 (survey 1:1)
CREATE TABLE IF NOT EXISTS ai_analysis (
    analysis_id       BIGINT       NOT NULL AUTO_INCREMENT,
    survey_id         BIGINT       NOT NULL,
    behavior_type     VARCHAR(100),
    risk_level        VARCHAR(20),
    summary           TEXT,
    training_direction TEXT,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (analysis_id),
    UNIQUE KEY uq_ai_analysis_survey (survey_id),
    FOREIGN KEY (survey_id) REFERENCES survey (survey_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 훈련 케이스
CREATE TABLE IF NOT EXISTS training_case (
    case_id      BIGINT      NOT NULL AUTO_INCREMENT,
    trainer_id   BIGINT      NOT NULL,
    pet_id       BIGINT      NOT NULL,
    survey_id    BIGINT,                              -- 문진에서 생성된 경우 연결
    status       VARCHAR(20) NOT NULL DEFAULT '접수 완료', -- 접수 완료|상담 중|훈련 중|완료
    memo         TEXT,
    started_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    PRIMARY KEY (case_id),
    FOREIGN KEY (trainer_id) REFERENCES member (member_id),
    FOREIGN KEY (pet_id)     REFERENCES pet (pet_id),
    FOREIGN KEY (survey_id)  REFERENCES survey (survey_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 훈련 일지
CREATE TABLE IF NOT EXISTS training_log (
    log_id      BIGINT      NOT NULL AUTO_INCREMENT,
    case_id     BIGINT      NOT NULL,
    session_no  INT         NOT NULL DEFAULT 1,
    goal        VARCHAR(500),
    content     TEXT,
    improvement TEXT,
    trained_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (log_id),
    FOREIGN KEY (case_id) REFERENCES training_case (case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 훈련 일지 첨부 이미지
CREATE TABLE IF NOT EXISTS training_log_image (
    image_id  BIGINT       NOT NULL AUTO_INCREMENT,
    log_id    BIGINT       NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    PRIMARY KEY (image_id),
    FOREIGN KEY (log_id) REFERENCES training_log (log_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 커뮤니티 게시글
CREATE TABLE IF NOT EXISTS post (
    post_id    BIGINT       NOT NULL AUTO_INCREMENT,
    writer_id  BIGINT       NOT NULL,
    category   VARCHAR(30),
    title      VARCHAR(200) NOT NULL,
    content    TEXT         NOT NULL,
    view_count INT          NOT NULL DEFAULT 0,
    hidden     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id),
    FOREIGN KEY (writer_id) REFERENCES member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 댓글
CREATE TABLE IF NOT EXISTS comment (
    comment_id BIGINT    NOT NULL AUTO_INCREMENT,
    post_id    BIGINT    NOT NULL,
    writer_id  BIGINT    NOT NULL,
    content    TEXT      NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id),
    FOREIGN KEY (post_id)   REFERENCES post (post_id),
    FOREIGN KEY (writer_id) REFERENCES member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 게시글 좋아요 (post_id + member_id UNIQUE)
CREATE TABLE IF NOT EXISTS post_like (
    like_id   BIGINT NOT NULL AUTO_INCREMENT,
    post_id   BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    PRIMARY KEY (like_id),
    UNIQUE KEY uq_post_like (post_id, member_id),
    FOREIGN KEY (post_id)   REFERENCES post (post_id),
    FOREIGN KEY (member_id) REFERENCES member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 북마크 (post_id + member_id UNIQUE)
CREATE TABLE IF NOT EXISTS bookmark (
    bookmark_id BIGINT NOT NULL AUTO_INCREMENT,
    post_id     BIGINT NOT NULL,
    member_id   BIGINT NOT NULL,
    PRIMARY KEY (bookmark_id),
    UNIQUE KEY uq_bookmark (post_id, member_id),
    FOREIGN KEY (post_id)   REFERENCES post (post_id),
    FOREIGN KEY (member_id) REFERENCES member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 게시글 신고
CREATE TABLE IF NOT EXISTS post_report (
    report_id   BIGINT       NOT NULL AUTO_INCREMENT,
    post_id     BIGINT       NOT NULL,
    reporter_id BIGINT       NOT NULL,
    reason      VARCHAR(500),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (report_id),
    FOREIGN KEY (post_id)     REFERENCES post (post_id),
    FOREIGN KEY (reporter_id) REFERENCES member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 테스트용 초기 데이터
INSERT INTO member (email, password, name, role) VALUES
    ('trainer1@test.com', '1234', '김훈련사', 'TRAINER'),
    ('admin@test.com',    '1234', '관리자',   'ADMIN');
