package com.pettrainer.pro.survey.dto;

import com.pettrainer.pro.survey.entity.AiAnalysis;
import com.pettrainer.pro.survey.entity.Survey;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Schema(description = "문진 응답")
public class SurveyResponse {

    private final Long surveyId;
    private final String ownerName;
    private final String ownerPhone;
    private final String petName;
    private final String breed;
    private final Integer ageYears;
    private final String gender;
    private final Boolean neutered;
    private final String problemBehavior;
    private final String behaviorDetail;
    private final String trainingGoal;
    private final String status;
    private final LocalDateTime submittedAt;
    private final String trainerName;
    private final Boolean hasAiAnalysis;
    private final Boolean hasCaseCreated;

    // AI 분석 (상세 조회 시 포함)
    private AiAnalysisDto aiAnalysis;

    public SurveyResponse(Survey survey) {
        this.surveyId        = survey.getSurveyId();
        this.ownerName       = survey.getOwnerName();
        this.ownerPhone      = survey.getOwnerPhone();
        this.petName         = survey.getPetName();
        this.breed           = survey.getBreed();
        this.ageYears        = survey.getAgeYears();
        this.gender          = survey.getGender();
        this.neutered        = survey.getNeutered();
        this.problemBehavior = survey.getProblemBehavior();
        this.behaviorDetail  = survey.getBehaviorDetail();
        this.trainingGoal    = survey.getTrainingGoal();
        this.status          = survey.getStatus();
        this.submittedAt     = survey.getSubmittedAt();
        this.trainerName     = survey.getTrainerName();
        this.hasAiAnalysis   = Boolean.TRUE.equals(survey.getHasAiAnalysis());
        this.hasCaseCreated  = Boolean.TRUE.equals(survey.getHasCaseCreated());
    }

    public void setAiAnalysis(AiAnalysis ai) {
        if (ai != null) {
            this.aiAnalysis = new AiAnalysisDto(ai);
        }
    }

    @Getter
    public static class AiAnalysisDto {
        private final String behaviorType;
        private final String riskLevel;
        private final String summary;
        private final String trainingDirection;

        public AiAnalysisDto(AiAnalysis ai) {
            this.behaviorType     = ai.getBehaviorType();
            this.riskLevel        = ai.getRiskLevel();
            this.summary          = ai.getSummary();
            this.trainingDirection = ai.getTrainingDirection();
        }
    }
}
