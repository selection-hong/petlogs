package com.pettrainer.pro.training.entity;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TrainingLog {

    private Long logId;
    private Long caseId;
    private Integer sessionNo;
    private String goal;
    private String content;
    private String improvement;
    private LocalDateTime trainedAt;
}
