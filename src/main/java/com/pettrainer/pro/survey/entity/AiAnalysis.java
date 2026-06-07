package com.pettrainer.pro.survey.entity;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AiAnalysis {

    private Long analysisId;
    private Long surveyId;
    private String behaviorType;
    private String riskLevel;
    private String summary;
    private String trainingDirection;
    private LocalDateTime createdAt;
}
