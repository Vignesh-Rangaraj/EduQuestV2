package com.eduquest.service;

import com.eduquest.domain.Student;
import com.eduquest.domain.StudentXpTransaction;
import com.eduquest.repository.StudentRepository;
import com.eduquest.repository.StudentXpTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class XpService {

    private final StudentXpTransactionRepository xpTransactionRepository;
    private final StudentRepository studentRepository;
    private final BadgeService badgeService;

    public XpService(
            StudentXpTransactionRepository xpTransactionRepository,
            StudentRepository studentRepository,
            BadgeService badgeService) {
        this.xpTransactionRepository = xpTransactionRepository;
        this.studentRepository = studentRepository;
        this.badgeService = badgeService;
    }

    @Transactional
    public boolean awardXp(Long studentId, Long activityId, Integer xpReward, String reason) {
        if (studentId == null || activityId == null || xpReward == null || xpReward <= 0) {
            return false;
        }

        // Idempotency check: Confirm XP was not previously awarded for this activity
        if (xpTransactionRepository.findByStudentIdAndActivityId(studentId, activityId).isPresent()) {
            return false; // Already awarded!
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        // Create XP Transaction record
        StudentXpTransaction tx = StudentXpTransaction.builder()
                .studentId(studentId)
                .activityId(activityId)
                .xpAwarded(xpReward)
                .reason(reason != null ? reason : "ACTIVITY_COMPLETION")
                .createdAt(LocalDateTime.now())
                .build();
        xpTransactionRepository.save(tx);

        // Update cached student total XP & level formula: level = (xp / 100) + 1
        int newXp = (student.getXp() != null ? student.getXp() : 0) + xpReward;
        int newLevel = (newXp / 100) + 1;

        student.setXp(newXp);
        student.setLevel(newLevel);
        studentRepository.save(student);

        // Evaluate achievements / badges
        badgeService.evaluateBadges(studentId);

        return true;
    }
}
