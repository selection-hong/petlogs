package com.pettrainer.pro.training.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "훈련 케이스 생성 요청")
public class TrainingCaseRequest {

    @Schema(description = "연결할 문진 ID (선택)")
    private Long surveyId;

    @NotBlank(message = "보호자 이름은 필수입니다.")
    @Schema(description = "보호자 이름")
    private String ownerName;

    @Schema(description = "보호자 연락처")
    private String ownerPhone;

    @NotBlank(message = "반려견 이름은 필수입니다.")
    @Schema(description = "반려견 이름")
    private String petName;

    @Schema(description = "견종")
    private String breed;

    @Schema(description = "나이")
    private Integer age;

    @Schema(description = "성별")
    private String gender;

    @Schema(description = "중성화 여부")
    private Boolean neutered;

    @Schema(description = "초기 상태", example = "접수 완료")
    private String status = "접수 완료";

    @Schema(description = "메모")
    private String memo;
}
