package com.pettrainer.pro.community.entity;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Post {

    private Long postId;
    private Long writerId;
    private String category;
    private String title;
    private String content;
    private Integer viewCount;
    private Integer hidden;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 조인 필드
    private String writerName;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean likedByMe;
    private Boolean bookmarkedByMe;
}
