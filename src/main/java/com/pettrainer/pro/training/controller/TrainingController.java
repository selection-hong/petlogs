package com.pettrainer.pro.training.controller;

import com.pettrainer.pro.auth.dto.LoginResponse;
import com.pettrainer.pro.global.common.ApiResponse;
import com.pettrainer.pro.global.exception.BusinessException;
import com.pettrainer.pro.training.dto.CaseStatusRequest;
import com.pettrainer.pro.training.dto.TrainingCaseRequest;
import com.pettrainer.pro.training.dto.TrainingLogRequest;
import com.pettrainer.pro.training.entity.TrainingCase;
import com.pettrainer.pro.training.entity.TrainingLog;
import com.pettrainer.pro.training.service.TrainingService;
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

@Tag(name = "Training", description = "훈련 케이스 & 일지 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;

    // ---- 케이스 ----

    @Operation(summary = "케이스 목록", security = @SecurityRequirement(name = "세션"))
    @GetMapping("/training-cases")
    public ResponseEntity<ApiResponse<List<TrainingCase>>> getCases(HttpSession session) {
        LoginResponse me = getLogin(session);
        return ResponseEntity.ok(ApiResponse.ok(trainingService.getCasesByTrainer(me.getMemberId())));
    }

    @Operation(summary = "케이스 생성", security = @SecurityRequirement(name = "세션"))
    @PostMapping("/training-cases")
    public ResponseEntity<ApiResponse<TrainingCase>> createCase(
            @Valid @RequestBody TrainingCaseRequest request,
            HttpSession session) {

        LoginResponse me = getLogin(session);
        TrainingCase tc = trainingService.createCase(me.getMemberId(), request);
        URI location = URI.create("/api/training-cases/" + tc.getCaseId());
        return ResponseEntity.created(location).body(ApiResponse.ok(tc, "케이스 생성 완료"));
    }

    @Operation(summary = "케이스 상세", security = @SecurityRequirement(name = "세션"))
    @GetMapping("/training-cases/{caseId}")
    public ResponseEntity<ApiResponse<TrainingCase>> getCase(
            @PathVariable Long caseId, HttpSession session) {

        getLogin(session);
        return ResponseEntity.ok(ApiResponse.ok(trainingService.getCaseById(caseId)));
    }

    @Operation(summary = "케이스 상태 변경", security = @SecurityRequirement(name = "세션"))
    @PatchMapping("/training-cases/{caseId}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long caseId,
            @Valid @RequestBody CaseStatusRequest request,
            HttpSession session) {

        getLogin(session);
        trainingService.updateStatus(caseId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("상태가 변경되었습니다."));
    }

    // ---- 일지 ----

    @Operation(summary = "일지 목록", security = @SecurityRequirement(name = "세션"))
    @GetMapping("/training-cases/{caseId}/logs")
    public ResponseEntity<ApiResponse<List<TrainingLog>>> getLogs(
            @PathVariable Long caseId, HttpSession session) {

        getLogin(session);
        return ResponseEntity.ok(ApiResponse.ok(trainingService.getLogs(caseId)));
    }

    @Operation(summary = "일지 작성", security = @SecurityRequirement(name = "세션"))
    @PostMapping("/training-cases/{caseId}/logs")
    public ResponseEntity<ApiResponse<TrainingLog>> addLog(
            @PathVariable Long caseId,
            @Valid @RequestBody TrainingLogRequest request,
            HttpSession session) {

        getLogin(session);
        TrainingLog log = trainingService.addLog(caseId, request);
        URI location = URI.create("/api/training-cases/" + caseId + "/logs/" + log.getLogId());
        return ResponseEntity.created(location).body(ApiResponse.ok(log, "일지 작성 완료"));
    }

    @Operation(summary = "일지 수정", security = @SecurityRequirement(name = "세션"))
    @PatchMapping("/training-logs/{logId}")
    public ResponseEntity<ApiResponse<TrainingLog>> updateLog(
            @PathVariable Long logId,
            @Valid @RequestBody TrainingLogRequest request,
            HttpSession session) {

        getLogin(session);
        return ResponseEntity.ok(ApiResponse.ok(trainingService.updateLog(logId, request), "일지 수정 완료"));
    }

    @Operation(summary = "일지 삭제", security = @SecurityRequirement(name = "세션"))
    @DeleteMapping("/training-logs/{logId}")
    public ResponseEntity<Void> deleteLog(
            @PathVariable Long logId, HttpSession session) {

        getLogin(session);
        trainingService.deleteLog(logId);
        return ResponseEntity.noContent().build();
    }

    private LoginResponse getLogin(HttpSession session) {
        LoginResponse me = (LoginResponse) session.getAttribute("loginMember");
        if (me == null) throw new BusinessException("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        return me;
    }
}
