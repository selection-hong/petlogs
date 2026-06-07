package com.pettrainer.pro.member.entity;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Member {

    private Long memberId;
    private String email;
    private String password;
    private String name;
    private String role;
    private String phone;
    private LocalDateTime createdAt;
}
