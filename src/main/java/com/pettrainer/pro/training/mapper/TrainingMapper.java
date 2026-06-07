package com.pettrainer.pro.training.mapper;

import com.pettrainer.pro.training.entity.TrainingCase;
import com.pettrainer.pro.training.entity.TrainingLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TrainingMapper {

    // 케이스
    void insertCase(TrainingCase trainingCase);

    List<TrainingCase> findCasesByTrainerId(Long trainerId);

    Optional<TrainingCase> findCaseById(Long caseId);

    void updateCaseStatus(@Param("caseId") Long caseId, @Param("status") String status);

    // 일지
    void insertLog(TrainingLog log);

    List<TrainingLog> findLogsByCaseId(Long caseId);

    Optional<TrainingLog> findLogById(Long logId);

    void updateLog(TrainingLog log);

    void deleteLog(Long logId);

    int countLogsByCaseId(Long caseId);

    // 대시보드
    int countInProgress(Long trainerId);

    int countCompletedThisMonth(Long trainerId);

    int countTotalCases(Long trainerId);

    List<TrainingCase> findRecentCasesByTrainerId(@Param("trainerId") Long trainerId, @Param("limit") int limit);
}
