package com.pettrainer.pro.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pettrainer.pro.auth.dto.LoginRequest;
import com.pettrainer.pro.auth.dto.LoginResponse;
import com.pettrainer.pro.auth.dto.SignupRequest;
import com.pettrainer.pro.auth.service.AuthService;
import com.pettrainer.pro.global.common.ApiResponse;
import com.pettrainer.pro.member.entity.Member;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
	
@Tag(name = "Auth", description = "인증 API")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    
    @Operation(summary = "회원가입")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@Valid @RequestBody SignupRequest request) {
        authService.signup(request);
        // 회원 단건 조회(GET /api/members/{id}) 리소스가 이 API에 없으므로
        // 존재하지 않는 URI를 가리키는 Location 헤더는 의도적으로 생략한다.
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("회원가입이 완료되었습니다."));
    }

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpSession session) {

        Member member = authService.login(request);
        session.setAttribute("loginMember", new LoginResponse(member));

        return ResponseEntity.ok(ApiResponse.ok(new LoginResponse(member), "로그인 성공"));
    }

    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(ApiResponse.ok("로그아웃 되었습니다."));
    }
}
