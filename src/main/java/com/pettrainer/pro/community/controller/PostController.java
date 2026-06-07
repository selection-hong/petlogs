package com.pettrainer.pro.community.controller;

import com.pettrainer.pro.auth.dto.LoginResponse;
import com.pettrainer.pro.community.dto.CommentRequest;
import com.pettrainer.pro.community.dto.PostListResponse;
import com.pettrainer.pro.community.dto.PostRequest;
import com.pettrainer.pro.community.dto.ReportRequest;
import com.pettrainer.pro.community.entity.Comment;
import com.pettrainer.pro.community.entity.Post;
import com.pettrainer.pro.community.service.PostService;
import com.pettrainer.pro.global.common.ApiResponse;
import com.pettrainer.pro.global.exception.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Tag(name = "Community", description = "커뮤니티 API")
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @Operation(summary = "게시글 목록 (페이지네이션)", security = @SecurityRequirement(name = "세션"))
    @GetMapping
    public ResponseEntity<ApiResponse<PostListResponse>> getPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            HttpSession session) {

        LoginResponse me = getLogin(session);
        PostListResponse result = postService.getPosts(page, size, category, keyword, me.getMemberId());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @Operation(summary = "게시글 작성", security = @SecurityRequirement(name = "세션"))
    @PostMapping
    public ResponseEntity<ApiResponse<Post>> createPost(
            @Valid @RequestBody PostRequest request, HttpSession session) {

        LoginResponse me = getLogin(session);
        Post post = postService.createPost(me.getMemberId(), request);
        URI location = URI.create("/api/posts/" + post.getPostId());
        return ResponseEntity.created(location).body(ApiResponse.ok(post, "게시글 작성 완료"));
    }

    @Operation(summary = "게시글 상세", security = @SecurityRequirement(name = "세션"))
    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<Post>> getPost(
            @PathVariable Long postId, HttpSession session) {

        LoginResponse me = getLogin(session);
        return ResponseEntity.ok(ApiResponse.ok(postService.getPost(postId, me.getMemberId())));
    }

    @Operation(summary = "게시글 수정", security = @SecurityRequirement(name = "세션"))
    @PatchMapping("/{postId}")
    public ResponseEntity<ApiResponse<Post>> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PostRequest request,
            HttpSession session) {

        LoginResponse me = getLogin(session);
        return ResponseEntity.ok(ApiResponse.ok(postService.updatePost(postId, me.getMemberId(), request)));
    }

    @Operation(summary = "게시글 삭제", security = @SecurityRequirement(name = "세션"))
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId, HttpSession session) {
        getLogin(session);
        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "좋아요 토글", security = @SecurityRequirement(name = "세션"))
    @PostMapping("/{postId}/likes")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(
            @PathVariable Long postId, HttpSession session) {

        LoginResponse me = getLogin(session);
        return ResponseEntity.ok(ApiResponse.ok(postService.toggleLike(postId, me.getMemberId())));
    }

    @Operation(summary = "북마크 토글", security = @SecurityRequirement(name = "세션"))
    @PostMapping("/{postId}/bookmarks")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleBookmark(
            @PathVariable Long postId, HttpSession session) {

        LoginResponse me = getLogin(session);
        return ResponseEntity.ok(ApiResponse.ok(postService.toggleBookmark(postId, me.getMemberId())));
    }

    @Operation(summary = "댓글 작성", security = @SecurityRequirement(name = "세션"))
    @PostMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<Comment>> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request,
            HttpSession session) {

        LoginResponse me = getLogin(session);
        Comment comment = postService.addComment(postId, me.getMemberId(), request.getContent());
        URI location = URI.create("/api/posts/" + postId + "/comments/" + comment.getCommentId());
        return ResponseEntity.created(location).body(ApiResponse.ok(comment, "댓글 작성 완료"));
    }

    @Operation(summary = "댓글 목록", security = @SecurityRequirement(name = "세션"))
    @GetMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(
            @PathVariable Long postId, HttpSession session) {

        getLogin(session);
        return ResponseEntity.ok(ApiResponse.ok(postService.getComments(postId)));
    }

    @Operation(summary = "게시글 신고", security = @SecurityRequirement(name = "세션"))
    @PostMapping("/{postId}/reports")
    public ResponseEntity<ApiResponse<Void>> report(
            @PathVariable Long postId,
            @Valid @RequestBody ReportRequest request,
            HttpSession session) {

        LoginResponse me = getLogin(session);
        postService.report(postId, me.getMemberId(), request.getReason());
        return ResponseEntity.ok(ApiResponse.ok("신고가 접수되었습니다."));
    }

    private LoginResponse getLogin(HttpSession session) {
        LoginResponse me = (LoginResponse) session.getAttribute("loginMember");
        if (me == null) throw new BusinessException("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        return me;
    }
}
