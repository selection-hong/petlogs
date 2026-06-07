package com.pettrainer.pro.training.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "훈련일지 요청")
public class TrainingLogRequest {

    @Schema(description = "훈련 목표")
    private String goal;

    @NotBlank(message = "훈련 내용은 필수입니다.")
    @Schema(description = "훈련 내용")
    private String content;

    @Schema(description = "개선사항")
    private String improvement;
}
