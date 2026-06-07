package com.pettrainer.pro.training.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "케이스 상태 변경 요청")
public class CaseStatusRequest {

    @NotBlank(message = "상태는 필수입니다.")
    @Schema(description = "변경할 상태 (접수 완료|상담 중|훈련 중|완료)", example = "훈련 중")
    private String status;
}
