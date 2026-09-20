package com.eduquest.service;

import com.eduquest.domain.*;
import com.eduquest.domain.Module;
import com.eduquest.dto.CreateModuleRequest;
import com.eduquest.dto.ModuleDto;
import com.eduquest.repository.ActivityRepository;
import com.eduquest.repository.ModuleRepository;
import com.eduquest.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final ActivityRepository activityRepository;
    private final StudentRepository studentRepository;

    public ModuleService(ModuleRepository moduleRepository, ActivityRepository activityRepository, StudentRepository studentRepository) {
        this.moduleRepository = moduleRepository;
        this.activityRepository = activityRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public ModuleDto createModule(CreateModuleRequest request, Long teacherId) {
        Module module = Module.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .subject(request.getSubject())
                .difficultyLevel(request.getDifficultyLevel() != null ? request.getDifficultyLevel() : DifficultyLevel.BEGINNER)
                .estimatedMinutes(request.getEstimatedMinutes() != null ? request.getEstimatedMinutes() : 45)
                .classroomId(request.getClassroomId())
                .status(ActivityStatus.DRAFT)
                .createdByTeacherId(teacherId)
                .build();
        Module saved = moduleRepository.save(module);
        return ModuleDto.fromEntity(saved);
    }

    @Transactional
    public ModuleDto updateModule(Long id, CreateModuleRequest request, Long teacherId) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found: " + id));

        if (module.getCreatedByTeacherId() != null && !module.getCreatedByTeacherId().equals(teacherId)) {
            throw new RuntimeException("Unauthorized: Module belongs to another teacher");
        }

        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        module.setSubject(request.getSubject());
        if (request.getDifficultyLevel() != null) module.setDifficultyLevel(request.getDifficultyLevel());
        if (request.getEstimatedMinutes() != null) module.setEstimatedMinutes(request.getEstimatedMinutes());
        module.setClassroomId(request.getClassroomId());
        module.setUpdatedAt(LocalDateTime.now());

        Module saved = moduleRepository.save(module);
        return ModuleDto.fromEntity(saved);
    }

    @Transactional
    public ModuleDto publishModule(Long id, Long teacherId) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found: " + id));

        if (module.getCreatedByTeacherId() != null && !module.getCreatedByTeacherId().equals(teacherId)) {
            throw new RuntimeException("Unauthorized: Module belongs to another teacher");
        }

        // Publish Validation Rule: Must have at least 1 LESSON and at least 1 QUIZ
        List<Activity> moduleActivities = activityRepository.findAll().stream()
                .filter(a -> id.equals(a.getModuleId()))
                .collect(Collectors.toList());

        boolean hasLesson = moduleActivities.stream().anyMatch(a -> a.getActivityType() == ActivityType.LESSON);
        boolean hasQuiz = moduleActivities.stream().anyMatch(a -> a.getActivityType() == ActivityType.QUIZ);

        if (!hasLesson || !hasQuiz) {
            throw new IllegalStateException("Module cannot be published without at least 1 Lesson and 1 Quiz activity.");
        }

        module.setStatus(ActivityStatus.PUBLISHED);
        module.setUpdatedAt(LocalDateTime.now());

        // Automatically publish and make visible all contained activities
        moduleActivities.forEach(a -> {
            a.setStatus(ActivityStatus.PUBLISHED);
            a.setVisibleToStudents(true);
            activityRepository.save(a);
        });

        Module saved = moduleRepository.save(module);
        return ModuleDto.fromEntity(saved);
    }

    @Transactional
    public ModuleDto archiveModule(Long id, Long teacherId) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found: " + id));

        if (module.getCreatedByTeacherId() != null && !module.getCreatedByTeacherId().equals(teacherId)) {
            throw new RuntimeException("Unauthorized: Module belongs to another teacher");
        }

        module.setStatus(ActivityStatus.ARCHIVED);
        module.setUpdatedAt(LocalDateTime.now());
        Module saved = moduleRepository.save(module);
        return ModuleDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ModuleDto> getModulesByTeacher(Long teacherId) {
        return moduleRepository.findByCreatedByTeacherId(teacherId).stream()
                .map(ModuleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ModuleDto> getPublishedModulesForStudent(Long studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        Long classroomId = (student != null && student.getClassroom() != null) ? student.getClassroom().getId() : null;
        if (classroomId != null) {
            return moduleRepository.findPublishedForClassroom(classroomId, ActivityStatus.PUBLISHED).stream()
                    .map(ModuleDto::fromEntity)
                    .collect(Collectors.toList());
        } else {
            return moduleRepository.findByStatus(ActivityStatus.PUBLISHED).stream()
                    .map(ModuleDto::fromEntity)
                    .collect(Collectors.toList());
        }
    }
}
