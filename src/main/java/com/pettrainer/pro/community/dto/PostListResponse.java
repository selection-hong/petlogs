package com.pettrainer.pro.community.dto;

import com.pettrainer.pro.community.entity.Post;
import lombok.Getter;

import java.util.List;

@Getter
public class PostListResponse {

    private final List<Post> posts;
    private final int totalCount;
    private final int currentPage;
    private final int totalPages;

    public PostListResponse(List<Post> posts, int totalCount, int page, int size) {
        this.posts       = posts;
        this.totalCount  = totalCount;
        this.currentPage = page;
        this.totalPages  = (int) Math.ceil((double) totalCount / size);
    }
}
