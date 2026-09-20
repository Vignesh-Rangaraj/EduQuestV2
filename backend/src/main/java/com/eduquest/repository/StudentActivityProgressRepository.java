package com.eduquest.repository;

import com.eduquest.domain.StudentActivityProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentActivityProgressRepository extends JpaRepository<StudentActivityProgress, Long> {

    List<StudentActivityProgress> findByStudentId(Long studentId);

    Optional<StudentActivityProgress> findByStudentIdAndActivityId(Long studentId, Long activityId);

    long countByStudentIdAndCompletedTrue(Long studentId);
}
