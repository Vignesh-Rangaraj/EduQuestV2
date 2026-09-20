package com.eduquest.repository;

import com.eduquest.domain.StudentProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProgressRepository extends JpaRepository<StudentProgress, Long> {

    List<StudentProgress> findByStudentId(Long studentId);

    Optional<StudentProgress> findByStudentIdAndActivityId(Long studentId, Long activityId);
}
