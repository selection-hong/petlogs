package com.pettrainer.pro.survey.service;

import com.pettrainer.pro.global.exception.BusinessException;
import com.pettrainer.pro.survey.dto.SurveyLinkRequest;
import com.pettrainer.pro.survey.dto.SurveySubmitRequest;
import com.pettrainer.pro.survey.entity.AiAnalysis;
import com.pettrainer.pro.survey.entity.Survey;
import com.pettrainer.pro.survey.mapper.SurveyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyMapper surveyMapper;

    @Transactional
    public Survey generateLink(Long trainerId, SurveyLinkRequest request) {
        String token = UUID.randomUUID().toString();

        Survey survey = new Survey();
        survey.setTrainerId(trainerId);
        survey.setToken(token);
        survey.setOwnerName(request.getOwnerName());
        survey.setPetName(request.getPetName());

        surveyMapper.insertToken(survey); // useGeneratedKeys → surveyId 채워짐
        return survey;
    }

    @Transactional(readOnly = true)
    public Survey getByToken(String token) {
        return surveyMapper.findByToken(token)
                .orElseThrow(() -> new BusinessException("유효하지 않은 문진 링크입니다.", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public void submit(String token, SurveySubmitRequest request) {
        Survey survey = surveyMapper.findByToken(token)
                .orElseThrow(() -> new BusinessException("유효하지 않은 문진 링크입니다.", HttpStatus.NOT_FOUND));

        if (survey.getSubmittedAt() != null) {
            throw new BusinessException("이미 제출된 문진입니다.");
        }

        survey.setOwnerName(request.getOwnerName());
        survey.setOwnerPhone(request.getOwnerPhone());
        survey.setPetName(request.getPetName());
        survey.setBreed(request.getBreed());
        survey.setAgeYears(request.getAgeYears());
        survey.setGender(request.getGender());
        survey.setNeutered(request.getNeutered());
        survey.setProblemBehavior(request.getProblemBehavior());
        survey.setBehaviorDetail(request.getBehaviorDetail());
        survey.setTrainingGoal(request.getTrainingGoal());

        surveyMapper.submitByToken(survey);
    }

    @Transactional(readOnly = true)
    public List<Survey> getSurveysByTrainer(Long trainerId) {
        return surveyMapper.findByTrainerId(trainerId);
    }

    @Transactional(readOnly = true)
    public Survey getSurveyById(Long surveyId) {
        return surveyMapper.findById(surveyId)
                .orElseThrow(() -> new BusinessException("문진을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public void confirm(Long surveyId) {
        surveyMapper.findById(surveyId)
                .orElseThrow(() -> new BusinessException("문진을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        surveyMapper.updateStatus(surveyId, "확인 완료");
    }

    @Transactional
    public AiAnalysis requestAiAnalysis(Long surveyId) {
        Survey survey = surveyMapper.findById(surveyId)
                .orElseThrow(() -> new BusinessException("문진을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        Optional<AiAnalysis> existing = surveyMapper.findAiAnalysisBySurveyId(surveyId);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Mock AI 분석 (실제 OpenAI API 연동 전 더미 데이터)
        AiAnalysis ai = new AiAnalysis();
        ai.setSurveyId(surveyId);
        ai.setBehaviorType(detectBehaviorType(survey.getProblemBehavior()));
        ai.setRiskLevel("MEDIUM");
        ai.setSummary("보호자 문진 내용을 분석한 결과, " + survey.getPetName() + "(이)의 주요 문제행동이 확인되었습니다. "
                + "조기 개입을 통해 효과적인 훈련이 가능할 것으로 판단됩니다.");
        ai.setTrainingDirection("단계적 둔감화 훈련과 긍정 강화를 병행하여 접근하는 것을 권장합니다. "
                + "초기 1~2주는 신뢰 형성에 집중하고, 이후 점진적으로 훈련 강도를 높여가세요.");

        surveyMapper.insertAiAnalysis(ai);
        return ai;
    }

    private String detectBehaviorType(String problemBehavior) {
        if (problemBehavior == null) return "기타";
        if (problemBehavior.contains("분리불안")) return "분리불안";
        if (problemBehavior.contains("공격성"))  return "공격성";
        if (problemBehavior.contains("짖음"))   return "과도한 짖음";
        if (problemBehavior.contains("배변"))   return "배변 문제";
        return "복합 행동 문제";
    }

    @Transactional(readOnly = true)
    public Optional<AiAnalysis> getAiAnalysis(Long surveyId) {
        return surveyMapper.findAiAnalysisBySurveyId(surveyId);
    }

    @Transactional(readOnly = true)
    public int countUnconfirmed(Long trainerId) {
        return surveyMapper.countUnconfirmed(trainerId);
    }

    @Transactional(readOnly = true)
    public List<Survey> getRecentSurveys(Long trainerId, int limit) {
        return surveyMapper.findRecentByTrainerId(trainerId, limit);
    }
}
