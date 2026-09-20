package com.eduquest.repository;

import com.eduquest.domain.ActivityStatus;
import com.eduquest.domain.Module;
import com.eduquest.domain.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {

    List<Module> findByCreatedByTeacherId(Long teacherId);

    List<Module> findByStatus(ActivityStatus status);

    List<Module> findBySubjectAndStatus(Subject subject, ActivityStatus status);

    @Query("SELECT m FROM Module m WHERE m.status = :status AND (m.classroomId IS NULL OR m.classroomId = :classroomId)")
    List<Module> findPublishedForClassroom(@Param("classroomId") Long classroomId, @Param("status") ActivityStatus status);
}
