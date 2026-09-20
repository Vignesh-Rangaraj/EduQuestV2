package com.eduquest.service;

import com.eduquest.domain.Activity;
import com.eduquest.domain.Student;
import com.eduquest.domain.StudentProgress;
import com.eduquest.dto.StudentProgressDto;
import com.eduquest.repository.ActivityRepository;
import com.eduquest.repository.StudentProgressRepository;
import com.eduquest.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentProgressService {

    private final StudentProgressRepository progressRepository;
    private final StudentRepository studentRepository;
    private final ActivityRepository activityRepository;

    public StudentProgressService(StudentProgressRepository progressRepository, StudentRepository studentRepository, ActivityRepository activityRepository) {
        this.progressRepository = progressRepository;
        this.studentRepository = studentRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional
    public StudentProgressDto saveProgress(Long studentId, Long activityId, Integer score, boolean completed, LocalDateTime completedAt) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found: " + activityId));

        Optional<StudentProgress> existing = progressRepository.findByStudentIdAndActivityId(studentId, activityId);
        StudentProgress progress;
        if (existing.isPresent()) {
            progress = existing.get();
            if (score != null && score > progress.getScore()) {
                progress.setScore(score);
            }
            if (completed) {
                progress.setCompleted(true);
            }
            if (completedAt != null) {
                progress.setCompletedAt(completedAt);
            }
        } else {
            progress = StudentProgress.builder()
                    .student(student)
                    .activity(activity)
                    .score(score != null ? score : 0)
                    .completed(completed)
                    .completedAt(completedAt != null ? completedAt : LocalDateTime.now())
                    .build();
        }

        StudentProgress saved = progressRepository.save(progress);
        return StudentProgressDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<StudentProgressDto> getProgressByStudent(Long studentId) {
        return progressRepository.findByStudentId(studentId).stream()
                .map(StudentProgressDto::fromEntity)
                .collect(Collectors.toList());
    }
}
