package com.pettrainer.pro.community.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "게시글 신고 요청")
public class ReportRequest {

    @NotBlank(message = "신고 사유는 필수입니다.")
    @Size(max = 500, message = "신고 사유는 500자 이내여야 합니다.")
    @Schema(description = "신고 사유", example = "스팸/광고성 게시글입니다.")
    private String reason;
}
