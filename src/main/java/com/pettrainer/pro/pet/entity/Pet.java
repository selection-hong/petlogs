package com.pettrainer.pro.pet.entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Pet {

    private Long petId;
    private Long trainerId;
    private String ownerName;
    private String ownerPhone;
    private String name;
    private String breed;
    private Integer age;
    private String gender;
    private Boolean neutered;
}
