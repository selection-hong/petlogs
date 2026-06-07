package com.pettrainer.pro.community.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "댓글 작성 요청")
public class CommentRequest {

    @NotBlank(message = "댓글 내용은 필수입니다.")
    @Schema(description = "댓글 내용", example = "좋은 정보 감사합니다.")
    private String content;
}
