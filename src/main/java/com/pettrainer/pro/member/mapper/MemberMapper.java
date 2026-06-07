package com.pettrainer.pro.member.mapper;

import com.pettrainer.pro.member.entity.Member;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface MemberMapper {

    void insert(Member member);

    Optional<Member> findByEmail(String email);

    Optional<Member> findById(Long memberId);

    List<Member> findAll();

    void updateRole(Long memberId, String role);
}
