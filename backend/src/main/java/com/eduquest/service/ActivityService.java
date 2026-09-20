package com.eduquest.service;

import com.eduquest.domain.Activity;
import com.eduquest.domain.ActivityStatus;
import com.eduquest.domain.Student;
import com.eduquest.dto.ActivityDto;
import com.eduquest.dto.CreateActivityRequest;
import com.eduquest.repository.ActivityRepository;
import com.eduquest.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service

public class ActivityService {

    private final ActivityRepository activityRepository;
    private final StudentRepository studentRepository;

    public ActivityService(ActivityRepository activityRepository, StudentRepository studentRepository) {
        this.activityRepository = activityRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public ActivityDto createActivity(CreateActivityRequest request, Long teacherId) {
        Activity activity = Activity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .subject(request.getSubject())
                .activityType(request.getActivityType())
                .status(ActivityStatus.DRAFT)
                .createdByTeacherId(teacherId)
                .assignedClassroomId(request.getAssignedClassroomId())
                .moduleId(request.getModuleId())
                .xpReward(request.getXpReward() != null ? request.getXpReward() : 10)
                .prerequisiteActivityId(request.getPrerequisiteActivityId())
                .unlockType(request.getUnlockType())
                .unlockValue(request.getUnlockValue())
                .build();
        Activity saved = activityRepository.save(activity);
        return ActivityDto.fromEntity(saved);
    }

    @Transactional
    public ActivityDto updateActivity(Long id, CreateActivityRequest request, Long teacherId) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + id));

        if (activity.getCreatedByTeacherId() != null && !activity.getCreatedByTeacherId().equals(teacherId)) {
            throw new RuntimeException("Unauthorized: Activity belongs to another teacher");
        }

        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setSubject(request.getSubject());
        activity.setActivityType(request.getActivityType());
        activity.setAssignedClassroomId(request.getAssignedClassroomId());
        if (request.getModuleId() != null) activity.setModuleId(request.getModuleId());
        if (request.getXpReward() != null) activity.setXpReward(request.getXpReward());
        if (request.getPrerequisiteActivityId() != null) activity.setPrerequisiteActivityId(request.getPrerequisiteActivityId());
        if (request.getUnlockType() != null) activity.setUnlockType(request.getUnlockType());
        if (request.getUnlockValue() != null) activity.setUnlockValue(request.getUnlockValue());
        activity.setUpdatedAt(LocalDateTime.now());

        Activity saved = activityRepository.save(activity);
        return ActivityDto.fromEntity(saved);
    }

    @Transactional
    public ActivityDto publishActivity(Long id, Long teacherId) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + id));

        if (activity.getCreatedByTeacherId() != null && !activity.getCreatedByTeacherId().equals(teacherId)) {
            throw new RuntimeException("Unauthorized: Activity belongs to another teacher");
        }

        activity.setStatus(ActivityStatus.PUBLISHED);
        activity.setUpdatedAt(LocalDateTime.now());
        Activity saved = activityRepository.save(activity);
        return ActivityDto.fromEntity(saved);
    }

    @Transactional
    public ActivityDto archiveActivity(Long id, Long teacherId) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + id));

        if (activity.getCreatedByTeacherId() != null && !activity.getCreatedByTeacherId().equals(teacherId)) {
            throw new RuntimeException("Unauthorized: Activity belongs to another teacher");
        }

        activity.setStatus(ActivityStatus.ARCHIVED);
        activity.setUpdatedAt(LocalDateTime.now());
        Activity saved = activityRepository.save(activity);
        return ActivityDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getActivitiesByTeacher(Long teacherId) {
        return activityRepository.findByCreatedByTeacherId(teacherId).stream()
                .map(ActivityDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getPublishedActivitiesForStudent(Long studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        Long classroomId = (student != null && student.getClassroom() != null) ? student.getClassroom().getId() : null;
        if (classroomId != null) {
            return activityRepository.findPublishedForClassroom(classroomId, ActivityStatus.PUBLISHED).stream()
                    .map(ActivityDto::fromEntity)
                    .collect(Collectors.toList());
        } else {
            return activityRepository.findByStatus(ActivityStatus.PUBLISHED).stream()
                    .map(ActivityDto::fromEntity)
                    .collect(Collectors.toList());
        }
    }
}
