package com.pettrainer.pro.survey.mapper;

import com.pettrainer.pro.survey.entity.AiAnalysis;
import com.pettrainer.pro.survey.entity.Survey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SurveyMapper {

    // 토큰만 가진 빈 survey 생성 (링크 생성 시)
    void insertToken(Survey survey);

    // 보호자가 폼 제출 시 전체 업데이트
    void submitByToken(Survey survey);

    // 훈련사의 문진 목록 (submitted_at IS NOT NULL)
    List<Survey> findByTrainerId(Long trainerId);

    Optional<Survey> findById(Long surveyId);

    Optional<Survey> findByToken(String token);

    void updateStatus(@Param("surveyId") Long surveyId, @Param("status") String status);

    void updatePetId(@Param("surveyId") Long surveyId, @Param("petId") Long petId);

    // AI 분석
    void insertAiAnalysis(AiAnalysis aiAnalysis);

    Optional<AiAnalysis> findAiAnalysisBySurveyId(Long surveyId);

    // 대시보드용 통계
    int countUnconfirmed(Long trainerId);

    List<Survey> findRecentByTrainerId(@Param("trainerId") Long trainerId, @Param("limit") int limit);
}
