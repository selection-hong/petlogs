package com.pettrainer.pro.dashboard.dto;

import com.pettrainer.pro.survey.dto.SurveyResponse;
import com.pettrainer.pro.training.entity.TrainingCase;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@Schema(description = "대시보드 응답")
public class DashboardResponse {

    @Schema(description = "전체 케이스 수")
    private final int totalCases;

    @Schema(description = "진행 중 케이스 수")
    private final int inProgress;

    @Schema(description = "미확인 문진 수")
    private final int unconfirmed;

    @Schema(description = "이번 달 완료 케이스 수")
    private final int completedThisMonth;

    @Schema(description = "최근 문진 목록")
    private final List<SurveyResponse> recentSurveys;

    @Schema(description = "최근 케이스 목록")
    private final List<TrainingCase> recentCases;
}
