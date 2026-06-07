package com.pettrainer.pro.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "로그인 요청")
public class LoginRequest {

    @NotBlank(message = "이메일은 필수입니다.")
    @Schema(description = "이메일", example = "trainer@example.com")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Schema(description = "비밀번호", example = "1234")
    private String password;
}
