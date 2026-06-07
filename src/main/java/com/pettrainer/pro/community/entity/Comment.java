package com.pettrainer.pro.community.entity;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Comment {

    private Long commentId;
    private Long postId;
    private Long writerId;
    private String content;
    private LocalDateTime createdAt;

    // 조인 필드
    private String writerName;
}
