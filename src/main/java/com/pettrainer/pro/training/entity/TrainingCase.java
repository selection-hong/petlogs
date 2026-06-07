package com.pettrainer.pro.training.entity;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TrainingCase {

    private Long caseId;
    private Long trainerId;
    private Long petId;
    private Long surveyId;
    private String status;
    private String memo;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    // 조인 필드
    private String petName;
    private String breed;
    private Integer petAge;
    private String ownerName;
    private Integer sessionCount;
}
