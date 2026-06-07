package com.pettrainer.pro.survey.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "문진 링크 생성 요청")
public class SurveyLinkRequest {

    @NotBlank(message = "보호자 이름은 필수입니다.")
    @Schema(description = "보호자 이름", example = "박민지")
    private String ownerName;

    @Schema(description = "반려견 이름 (선택)", example = "코코")
    private String petName;
}
