package com.pettrainer.pro.survey.controller;

import com.pettrainer.pro.auth.dto.LoginResponse;
import com.pettrainer.pro.global.common.ApiResponse;
import com.pettrainer.pro.global.exception.BusinessException;
import com.pettrainer.pro.survey.dto.SurveyLinkRequest;
import com.pettrainer.pro.survey.dto.SurveyResponse;
import com.pettrainer.pro.survey.dto.SurveySubmitRequest;
import com.pettrainer.pro.survey.entity.AiAnalysis;
import com.pettrainer.pro.survey.entity.Survey;
import com.pettrainer.pro.survey.service.SurveyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Tag(name = "Survey", description = "문진 API")
@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @Operation(summary = "문진 링크(토큰) 생성", security = @SecurityRequirement(name = "세션"))
    @PostMapping("/link")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateLink(
            @Valid @RequestBody SurveyLinkRequest request,
            HttpSession session) {

        LoginResponse me = getLoginMember(session);
        Survey survey = surveyService.generateLink(me.getMemberId(), request);
        String token = survey.getToken();
        String publicUrl = "/api/surveys/public/" + token;

        URI location = URI.create("/api/surveys/" + survey.getSurveyId());
        return ResponseEntity.created(location)
                .body(ApiResponse.ok(Map.of("token", token, "url", publicUrl), "링크 생성 성공"));
    }

    @Operation(summary = "보호자 문진 제출 (비인증 공개 API)")
    @PostMapping("/public/{token}")
    public ResponseEntity<ApiResponse<Void>> submit(
            @PathVariable String token,
            @Valid @RequestBody SurveySubmitRequest request) {

        surveyService.submit(token, request);
        return ResponseEntity.ok(ApiResponse.ok("문진이 제출되었습니다."));
    }

    @Operation(summary = "문진 목록 조회", security = @SecurityRequirement(name = "세션"))
    @GetMapping
    public ResponseEntity<ApiResponse<List<SurveyResponse>>> getSurveys(HttpSession session) {
        LoginResponse me = getLoginMember(session);
        List<Survey> surveys = surveyService.getSurveysByTrainer(me.getMemberId());
        List<SurveyResponse> result = surveys.stream().map(SurveyResponse::new).toList();
        return ResponseEntity.ok(ApiResponse.ok(result, "조회 성공"));
    }

    @Operation(summary = "문진 상세 조회", security = @SecurityRequirement(name = "세션"))
    @GetMapping("/{surveyId}")
    public ResponseEntity<ApiResponse<SurveyResponse>> getSurvey(
            @PathVariable Long surveyId,
            HttpSession session) {

        getLoginMember(session);
        Survey survey = surveyService.getSurveyById(surveyId);
        SurveyResponse response = new SurveyResponse(survey);
        surveyService.getAiAnalysis(surveyId).ifPresent(response::setAiAnalysis);
        return ResponseEntity.ok(ApiResponse.ok(response, "조회 성공"));
    }

    @Operation(summary = "문진 확인 완료 처리", security = @SecurityRequirement(name = "세션"))
    @PatchMapping("/{surveyId}/confirm")
    public ResponseEntity<ApiResponse<Void>> confirm(
            @PathVariable Long surveyId,
            HttpSession session) {

        getLoginMember(session);
        surveyService.confirm(surveyId);
        return ResponseEntity.ok(ApiResponse.ok("확인 완료 처리되었습니다."));
    }

    @Operation(summary = "AI 분석 요청 (Mock)", security = @SecurityRequirement(name = "세션"))
    @PostMapping("/{surveyId}/ai-analysis")
    public ResponseEntity<ApiResponse<SurveyResponse.AiAnalysisDto>> requestAiAnalysis(
            @PathVariable Long surveyId,
            HttpSession session) {

        getLoginMember(session);
        AiAnalysis ai = surveyService.requestAiAnalysis(surveyId);
        return ResponseEntity.ok(ApiResponse.ok(new SurveyResponse.AiAnalysisDto(ai), "AI 분석 완료"));
    }

    private LoginResponse getLoginMember(HttpSession session) {
        LoginResponse me = (LoginResponse) session.getAttribute("loginMember");
        if (me == null) {
            throw new BusinessException("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }
        return me;
    }
}
