package com.pettrainer.pro.community.mapper;

import com.pettrainer.pro.community.entity.Comment;
import com.pettrainer.pro.community.entity.Post;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PostMapper {

    // 게시글
    void insertPost(Post post);

    List<Post> findPostsPage(@Param("offset") int offset,
                             @Param("size") int size,
                             @Param("category") String category,
                             @Param("keyword") String keyword);

    int countPosts(@Param("category") String category, @Param("keyword") String keyword);

    Optional<Post> findPostById(@Param("postId") Long postId, @Param("memberId") Long memberId);

    void updatePost(Post post);

    void deletePost(Long postId);

    void incrementViewCount(Long postId);

    // 좋아요
    void insertLike(@Param("postId") Long postId, @Param("memberId") Long memberId);

    void deleteLike(@Param("postId") Long postId, @Param("memberId") Long memberId);

    boolean existsLike(@Param("postId") Long postId, @Param("memberId") Long memberId);

    // 북마크
    void insertBookmark(@Param("postId") Long postId, @Param("memberId") Long memberId);

    void deleteBookmark(@Param("postId") Long postId, @Param("memberId") Long memberId);

    boolean existsBookmark(@Param("postId") Long postId, @Param("memberId") Long memberId);

    // 댓글
    void insertComment(Comment comment);

    List<Comment> findCommentsByPostId(Long postId);

    Optional<Comment> findCommentById(Long commentId);

    void deleteComment(Long commentId);

    // 신고
    void insertReport(@Param("postId") Long postId,
                      @Param("reporterId") Long reporterId,
                      @Param("reason") String reason);
}
