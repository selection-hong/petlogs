package com.pettrainer.pro.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "회원가입 요청")
public class SignupRequest {

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    @Schema(description = "이메일", example = "trainer@example.com")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Schema(description = "비밀번호", example = "1234")
    private String password;

    @NotBlank(message = "이름은 필수입니다.")
    @Schema(description = "이름", example = "김훈련사")
    private String name;

    @Schema(description = "연락처", example = "010-1234-5678")
    private String phone;
}
