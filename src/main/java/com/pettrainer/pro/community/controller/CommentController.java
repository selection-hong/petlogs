package com.pettrainer.pro.community.controller;

import com.pettrainer.pro.auth.dto.LoginResponse;
import com.pettrainer.pro.community.service.PostService;
import com.pettrainer.pro.global.common.ApiResponse;
import com.pettrainer.pro.global.exception.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Community", description = "커뮤니티 API")
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final PostService postService;

    @Operation(summary = "댓글 삭제", security = @SecurityRequirement(name = "세션"))
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId, HttpSession session) {

        LoginResponse me = (LoginResponse) session.getAttribute("loginMember");
        if (me == null) throw new BusinessException("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        postService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
