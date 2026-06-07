package com.pettrainer.pro.training.service;

import com.pettrainer.pro.global.exception.BusinessException;
import com.pettrainer.pro.pet.entity.Pet;
import com.pettrainer.pro.pet.mapper.PetMapper;
import com.pettrainer.pro.survey.mapper.SurveyMapper;
import com.pettrainer.pro.training.dto.TrainingCaseRequest;
import com.pettrainer.pro.training.dto.TrainingLogRequest;
import com.pettrainer.pro.training.entity.TrainingCase;
import com.pettrainer.pro.training.entity.TrainingLog;
import com.pettrainer.pro.training.mapper.TrainingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingMapper trainingMapper;
    private final PetMapper petMapper;
    private final SurveyMapper surveyMapper;

    @Transactional
    public TrainingCase createCase(Long trainerId, TrainingCaseRequest request) {
        // 반려견 레코드 생성
        Pet pet = new Pet();
        pet.setTrainerId(trainerId);
        pet.setOwnerName(request.getOwnerName());
        pet.setOwnerPhone(request.getOwnerPhone());
        pet.setName(request.getPetName());
        pet.setBreed(request.getBreed());
        pet.setAge(request.getAge());
        pet.setGender(request.getGender());
        pet.setNeutered(request.getNeutered());
        petMapper.insert(pet);

        // 케이스 생성
        TrainingCase tc = new TrainingCase();
        tc.setTrainerId(trainerId);
        tc.setPetId(pet.getPetId());
        tc.setSurveyId(request.getSurveyId());
        tc.setStatus(request.getStatus() != null ? request.getStatus() : "접수 완료");
        tc.setMemo(request.getMemo());
        trainingMapper.insertCase(tc);

        // 문진과 pet 연결
        if (request.getSurveyId() != null) {
            surveyMapper.updatePetId(request.getSurveyId(), pet.getPetId());
        }

        return trainingMapper.findCaseById(tc.getCaseId()).orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<TrainingCase> getCasesByTrainer(Long trainerId) {
        return trainingMapper.findCasesByTrainerId(trainerId);
    }

    @Transactional(readOnly = true)
    public TrainingCase getCaseById(Long caseId) {
        return trainingMapper.findCaseById(caseId)
                .orElseThrow(() -> new BusinessException("케이스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public void updateStatus(Long caseId, String status) {
        trainingMapper.findCaseById(caseId)
                .orElseThrow(() -> new BusinessException("케이스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        trainingMapper.updateCaseStatus(caseId, status);
    }

    @Transactional
    public TrainingLog addLog(Long caseId, TrainingLogRequest request) {
        trainingMapper.findCaseById(caseId)
                .orElseThrow(() -> new BusinessException("케이스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        int nextSession = trainingMapper.countLogsByCaseId(caseId) + 1;

        TrainingLog log = new TrainingLog();
        log.setCaseId(caseId);
        log.setSessionNo(nextSession);
        log.setGoal(request.getGoal());
        log.setContent(request.getContent());
        log.setImprovement(request.getImprovement());
        trainingMapper.insertLog(log);

        return trainingMapper.findLogById(log.getLogId()).orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<TrainingLog> getLogs(Long caseId) {
        return trainingMapper.findLogsByCaseId(caseId);
    }

    @Transactional
    public TrainingLog updateLog(Long logId, TrainingLogRequest request) {
        TrainingLog log = trainingMapper.findLogById(logId)
                .orElseThrow(() -> new BusinessException("일지를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        log.setGoal(request.getGoal());
        log.setContent(request.getContent());
        log.setImprovement(request.getImprovement());
        trainingMapper.updateLog(log);
        return log;
    }

    @Transactional
    public void deleteLog(Long logId) {
        trainingMapper.findLogById(logId)
                .orElseThrow(() -> new BusinessException("일지를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        trainingMapper.deleteLog(logId);
    }

    // 대시보드용
    @Transactional(readOnly = true)
    public int countTotal(Long trainerId)         { return trainingMapper.countTotalCases(trainerId); }

    @Transactional(readOnly = true)
    public int countInProgress(Long trainerId)    { return trainingMapper.countInProgress(trainerId); }

    @Transactional(readOnly = true)
    public int countCompletedThisMonth(Long id)   { return trainingMapper.countCompletedThisMonth(id); }

    @Transactional(readOnly = true)
    public List<TrainingCase> getRecentCases(Long trainerId, int limit) {
        return trainingMapper.findRecentCasesByTrainerId(trainerId, limit);
    }
}
