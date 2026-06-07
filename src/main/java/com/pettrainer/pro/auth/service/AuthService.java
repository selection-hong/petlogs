package com.pettrainer.pro.auth.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pettrainer.pro.auth.dto.LoginRequest;
import com.pettrainer.pro.auth.dto.SignupRequest;
import com.pettrainer.pro.global.exception.BusinessException;
import com.pettrainer.pro.member.entity.Member;
import com.pettrainer.pro.member.mapper.MemberMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberMapper memberMapper;

    @Transactional
    public Member signup(SignupRequest request) {
        memberMapper.findByEmail(request.getEmail()).ifPresent(m -> {
            throw new BusinessException("이미 사용 중인 이메일입니다.");
        });

        Member member = new Member();
        member.setEmail(request.getEmail());
        member.setPassword(request.getPassword()); // 평문 저장 (보안 정책상 생략)
        member.setName(request.getName());
        member.setPhone(request.getPhone());
        member.setRole("TRAINER");

        memberMapper.insert(member);
        return member;
    }

    @Transactional(readOnly = true)
    public Member login(LoginRequest request) {
        Member member = memberMapper.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("이메일 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED));

        if (!member.getPassword().equals(request.getPassword())) {
            throw new BusinessException("이메일 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED);
        }

        return member;
    }
}
