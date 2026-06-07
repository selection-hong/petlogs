package com.pettrainer.pro.auth.dto;

import com.pettrainer.pro.member.entity.Member;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "로그인 응답")
public class LoginResponse {

    @Schema(description = "회원 ID")
    private final Long memberId;

    @Schema(description = "이름")
    private final String name;

    @Schema(description = "이메일")
    private final String email;

    @Schema(description = "역할 (TRAINER | ADMIN)")
    private final String role;

    public LoginResponse(Member member) {
        this.memberId = member.getMemberId();
        this.name     = member.getName();
        this.email    = member.getEmail();
        this.role     = member.getRole();
    }
}
