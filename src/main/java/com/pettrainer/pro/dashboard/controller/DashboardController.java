package com.pettrainer.pro.dashboard.controller;

import com.pettrainer.pro.auth.dto.LoginResponse;
import com.pettrainer.pro.dashboard.dto.DashboardResponse;
import com.pettrainer.pro.global.common.ApiResponse;
import com.pettrainer.pro.global.exception.BusinessException;
import com.pettrainer.pro.survey.dto.SurveyResponse;
import com.pettrainer.pro.survey.service.SurveyService;
import com.pettrainer.pro.training.service.TrainingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 대시보드 집계 API.
 *
 * <p>기존 JSP {@code TrainingViewController.dashboard()}가 Model에 담아
 * 화면으로 내려주던 통계/최근 목록을 JSON REST 엔드포인트로 제공한다.
 */
@Tag(name = "Dashboard", description = "대시보드 집계 API")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final TrainingService trainingService;
    private final SurveyService surveyService;

    @Operation(summary = "대시보드 요약 조회", security = @SecurityRequirement(name = "세션"))
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(HttpSession session) {
        LoginResponse me = getLogin(session);
        Long trainerId = me.getMemberId();

        List<SurveyResponse> recentSurveys = surveyService.getRecentSurveys(trainerId, 5).stream()
                .map(SurveyResponse::new)
                .toList();

        DashboardResponse response = DashboardResponse.builder()
                .totalCases(trainingService.countTotal(trainerId))
                .inProgress(trainingService.countInProgress(trainerId))
                .unconfirmed(surveyService.countUnconfirmed(trainerId))
                .completedThisMonth(trainingService.countCompletedThisMonth(trainerId))
                .recentSurveys(recentSurveys)
                .recentCases(trainingService.getRecentCases(trainerId, 5))
                .build();

        return ResponseEntity.ok(ApiResponse.ok(response, "조회 성공"));
    }

    private LoginResponse getLogin(HttpSession session) {
        LoginResponse me = (LoginResponse) session.getAttribute("loginMember");
        if (me == null) {
            throw new BusinessException("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }
        return me;
    }
}
