package com.pettrainer.pro.survey.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "보호자 문진 제출 요청")
public class SurveySubmitRequest {

    @NotBlank(message = "보호자 이름은 필수입니다.")
    @Schema(description = "보호자 이름")
    private String ownerName;

    @Schema(description = "보호자 연락처")
    private String ownerPhone;

    @NotBlank(message = "반려견 이름은 필수입니다.")
    @Schema(description = "반려견 이름")
    private String petName;

    @NotBlank(message = "견종은 필수입니다.")
    @Schema(description = "견종")
    private String breed;

    @Schema(description = "나이 (세)")
    private Integer ageYears;

    @Schema(description = "성별 (수컷/암컷)")
    private String gender;

    @Schema(description = "중성화 여부")
    private Boolean neutered;

    @Schema(description = "문제행동 (콤마 구분)", example = "분리불안,짖음")
    private String problemBehavior;

    @NotBlank(message = "문제행동 상세 설명은 필수입니다.")
    @Schema(description = "문제행동 상세 설명")
    private String behaviorDetail;

    @Schema(description = "훈련 목표")
    private String trainingGoal;
}
