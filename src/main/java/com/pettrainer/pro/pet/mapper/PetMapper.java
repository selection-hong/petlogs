package com.pettrainer.pro.pet.mapper;

import com.pettrainer.pro.pet.entity.Pet;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface PetMapper {

    void insert(Pet pet);

    Optional<Pet> findById(Long petId);
}
