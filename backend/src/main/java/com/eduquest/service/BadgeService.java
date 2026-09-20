package com.eduquest.service;

import com.eduquest.domain.Student;
import com.eduquest.domain.StudentBadge;
import com.eduquest.repository.StudentActivityProgressRepository;
import com.eduquest.repository.StudentBadgeRepository;
import com.eduquest.repository.StudentModuleProgressRepository;
import com.eduquest.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class BadgeService {

    private final StudentBadgeRepository badgeRepository;
    private final StudentRepository studentRepository;
    private final StudentActivityProgressRepository progressRepository;
    private final StudentModuleProgressRepository moduleProgressRepository;

    public BadgeService(
            StudentBadgeRepository badgeRepository,
            StudentRepository studentRepository,
            StudentActivityProgressRepository progressRepository,
            StudentModuleProgressRepository moduleProgressRepository) {
        this.badgeRepository = badgeRepository;
        this.studentRepository = studentRepository;
        this.progressRepository = progressRepository;
        this.moduleProgressRepository = moduleProgressRepository;
    }

    @Transactional
    public void evaluateBadges(Long studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) return;

        long completedActivitiesCount = progressRepository.countByStudentIdAndCompletedTrue(studentId);
        if (completedActivitiesCount >= 1) {
            awardBadge(studentId, "FIRST_LESSON", "First Step Achiever");
        }

        if (student.getXp() >= 100) {
            awardBadge(studentId, "100_XP", "Century Scholar");
        }
        if (student.getXp() >= 500) {
            awardBadge(studentId, "500_XP", "Grandmaster Scholar");
        }

        long completedModulesCount = moduleProgressRepository.countByStudentIdAndCompletedTrue(studentId);
        if (completedModulesCount >= 1) {
            awardBadge(studentId, "MODULE_MASTER", "Module Master");
        }
    }

    private void awardBadge(Long studentId, String badgeCode, String badgeName) {
        if (badgeRepository.findByStudentIdAndBadgeCode(studentId, badgeCode).isEmpty()) {
            StudentBadge badge = StudentBadge.builder()
                    .studentId(studentId)
                    .badgeCode(badgeCode)
                    .badgeName(badgeName)
                    .earnedAt(LocalDateTime.now())
                    .build();
            badgeRepository.save(badge);
        }
    }
}
