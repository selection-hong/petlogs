package com.pettrainer.pro.community.service;

import com.pettrainer.pro.community.dto.PostListResponse;
import com.pettrainer.pro.community.dto.PostRequest;
import com.pettrainer.pro.community.entity.Comment;
import com.pettrainer.pro.community.entity.Post;
import com.pettrainer.pro.community.mapper.PostMapper;
import com.pettrainer.pro.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostMapper postMapper;

    @Transactional
    public Post createPost(Long writerId, PostRequest request) {
        Post post = new Post();
        post.setWriterId(writerId);
        post.setCategory(request.getCategory());
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        postMapper.insertPost(post);
        return postMapper.findPostById(post.getPostId(), writerId).orElseThrow();
    }

    @Transactional(readOnly = true)
    public PostListResponse getPosts(int page, int size, String category, String keyword, Long memberId) {
        int offset = (page - 1) * size;
        List<Post> posts = postMapper.findPostsPage(offset, size, category, keyword);
        int total = postMapper.countPosts(category, keyword);
        return new PostListResponse(posts, total, page, size);
    }

    @Transactional
    public Post getPost(Long postId, Long memberId) {
        Post post = postMapper.findPostById(postId, memberId)
                .orElseThrow(() -> new BusinessException("게시글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        postMapper.incrementViewCount(postId);
        return post;
    }

    @Transactional
    public Post updatePost(Long postId, Long writerId, PostRequest request) {
        Post post = postMapper.findPostById(postId, writerId)
                .orElseThrow(() -> new BusinessException("게시글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        post.setCategory(request.getCategory());
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        postMapper.updatePost(post);
        return postMapper.findPostById(postId, writerId).orElseThrow();
    }

    @Transactional
    public void deletePost(Long postId) {
        postMapper.findPostById(postId, 0L)
                .orElseThrow(() -> new BusinessException("게시글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        postMapper.deletePost(postId);
    }

    @Transactional
    public Map<String, Object> toggleLike(Long postId, Long memberId) {
        if (postMapper.existsLike(postId, memberId)) {
            postMapper.deleteLike(postId, memberId);
            return Map.of("liked", false);
        } else {
            postMapper.insertLike(postId, memberId);
            return Map.of("liked", true);
        }
    }

    @Transactional
    public Map<String, Object> toggleBookmark(Long postId, Long memberId) {
        if (postMapper.existsBookmark(postId, memberId)) {
            postMapper.deleteBookmark(postId, memberId);
            return Map.of("bookmarked", false);
        } else {
            postMapper.insertBookmark(postId, memberId);
            return Map.of("bookmarked", true);
        }
    }

    @Transactional
    public Comment addComment(Long postId, Long writerId, String content) {
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setWriterId(writerId);
        comment.setContent(content);
        postMapper.insertComment(comment);
        return postMapper.findCommentById(comment.getCommentId()).orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<Comment> getComments(Long postId) {
        return postMapper.findCommentsByPostId(postId);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        postMapper.findCommentById(commentId)
                .orElseThrow(() -> new BusinessException("댓글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        postMapper.deleteComment(commentId);
    }

    @Transactional
    public void report(Long postId, Long reporterId, String reason) {
        postMapper.insertReport(postId, reporterId, reason);
    }
}
