package com.pettrainer.pro.survey.entity;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Survey {

    private Long surveyId;
    private Long trainerId;
    private Long petId;
    private String token;

    // 보호자 정보
    private String ownerName;
    private String ownerPhone;

    // 반려견 정보 (문진 폼에서 입력)
    private String petName;
    private String breed;
    private Integer ageYears;
    private String gender;
    private Boolean neutered;

    // 문제행동
    private String problemBehavior;
    private String behaviorDetail;
    private String trainingGoal;

    // 상태
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;

    // 조인 필드
    private String trainerName;
    private Boolean hasAiAnalysis;
    private Boolean hasCaseCreated;
}
