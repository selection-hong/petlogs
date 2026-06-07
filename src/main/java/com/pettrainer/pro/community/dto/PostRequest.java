package com.pettrainer.pro.community.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "게시글 작성/수정 요청")
public class PostRequest {

    @Schema(description = "카테고리", example = "훈련 팁")
    private String category;

    @NotBlank(message = "제목은 필수입니다.")
    @Schema(description = "제목")
    private String title;

    @NotBlank(message = "내용은 필수입니다.")
    @Schema(description = "내용")
    private String content;
}
