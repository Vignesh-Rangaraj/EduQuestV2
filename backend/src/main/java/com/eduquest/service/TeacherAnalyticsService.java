package com.eduquest.service;

import com.eduquest.domain.*;
import com.eduquest.dto.SubjectProgressDto;
import com.eduquest.dto.TeacherAnalyticsDto;
import com.eduquest.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeacherAnalyticsService {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ActivityRepository activityRepository;
    private final StudentProgressRepository progressRepository;
    private final StudentActivityProgressRepository activityProgressRepository;

    public TeacherAnalyticsService(
            TeacherRepository teacherRepository,
            StudentRepository studentRepository,
            ActivityRepository activityRepository,
            StudentProgressRepository progressRepository,
            StudentActivityProgressRepository activityProgressRepository) {
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.activityRepository = activityRepository;
        this.progressRepository = progressRepository;
        this.activityProgressRepository = activityProgressRepository;
    }

    @Transactional(readOnly = true)
    public TeacherAnalyticsDto getTeacherAnalytics(String username) {
        Teacher teacher = teacherRepository.findByUserAccountUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Teacher profile not found for user: " + username));

        if (teacher.getClassroom() == null) {
            return new TeacherAnalyticsDto(
                    null, "Unassigned", 0, 0, 0, 0,
                    List.of(), List.of(), List.of()
            );
        }

        Long classroomId = teacher.getClassroom().getId();
        String classroomName = teacher.getClassroom().getName();

        List<Student> students = studentRepository.findByClassroom_Id(classroomId);
        int totalStudents = students.size();

        if (totalStudents == 0) {
            return new TeacherAnalyticsDto(
                    classroomId, classroomName, 0, 0, 0, 0,
                    List.of(), List.of(), List.of()
            );
        }

        List<Activity> classroomActivities = activityRepository.findPublishedForClassroom(classroomId, ActivityStatus.PUBLISHED);
        long totalActivities = classroomActivities.size();
        if (totalActivities == 0) totalActivities = 1;

        int totalXpSum = 0;
        int activeCount = 0;
        int totalCompletionPercentageSum = 0;

        List<TeacherAnalyticsDto.StudentPerformanceSummary> performanceSummaries = new ArrayList<>();

        // Sort students by XP descending to assign rank
        List<Student> sortedStudents = students.stream()
                .sorted(Comparator.comparingInt((Student s) -> s.getXp() != null ? s.getXp() : 0).reversed())
                .collect(Collectors.toList());

        int rank = 1;
        for (Student s : sortedStudents) {
            int xp = s.getXp() != null ? s.getXp() : 0;
            int level = s.getLevel() != null ? s.getLevel() : (xp / 100) + 1;
            totalXpSum += xp;

            long completedCount = activityProgressRepository.countByStudentIdAndCompletedTrue(s.getId());
            if (completedCount == 0) {
                // Fallback check on student progress table
                completedCount = progressRepository.findByStudentId(s.getId()).stream()
                        .filter(StudentProgress::isCompleted)
                        .count();
            }

            int completionPct = (int) Math.min(100, (completedCount * 100) / totalActivities);
            totalCompletionPercentageSum += completionPct;

            if (completedCount > 0 || xp > 0) {
                activeCount++;
            }

            String status = completionPct < 40 ? "NEEDS_ATTENTION" : (completedCount > 0 ? "ACTIVE" : "INACTIVE");

            String studentName = s.getUserAccount() != null ? s.getUserAccount().getFullName() : "Student #" + s.getId();

            int completedLessons = (int) (completedCount / 2);
            int completedQuizzes = (int) (completedCount - completedLessons);

            performanceSummaries.add(new TeacherAnalyticsDto.StudentPerformanceSummary(
                    s.getId(),
                    studentName,
                    xp,
                    level,
                    rank++,
                    completedLessons,
                    completedQuizzes,
                    completionPct,
                    status
            ));
        }

        int avgXp = totalStudents > 0 ? totalXpSum / totalStudents : 0;
        int avgCompletionRate = totalStudents > 0 ? totalCompletionPercentageSum / totalStudents : 0;

        List<TeacherAnalyticsDto.StudentPerformanceSummary> needingAttention = performanceSummaries.stream()
                .filter(p -> "NEEDS_ATTENTION".equals(p.getStatus()) || "INACTIVE".equals(p.getStatus()))
                .collect(Collectors.toList());

        // Subject Analytics
        Map<Subject, Long> activitiesBySubject = classroomActivities.stream()
                .collect(Collectors.groupingBy(Activity::getSubject, Collectors.counting()));

        List<SubjectProgressDto> subjectAnalytics = new ArrayList<>();
        for (Subject subj : Subject.values()) {
            long totalSubjActs = activitiesBySubject.getOrDefault(subj, 0L);
            if (totalSubjActs > 0) {
                int totalSubjLessons = (int) (totalSubjActs / 2 + (totalSubjActs % 2));
                int totalSubjQuizzes = (int) (totalSubjActs / 2);

                int avgProgress = Math.min(100, (avgCompletionRate + 20)); // Baseline calculation
                subjectAnalytics.add(new SubjectProgressDto(
                        subj.name(),
                        (int) (totalSubjLessons * avgProgress / 100),
                        totalSubjLessons,
                        (int) (totalSubjQuizzes * avgProgress / 100),
                        totalSubjQuizzes,
                        avgProgress
                ));
            }
        }

        return new TeacherAnalyticsDto(
                classroomId,
                classroomName,
                totalStudents,
                avgXp,
                avgCompletionRate,
                activeCount,
                performanceSummaries,
                needingAttention,
                subjectAnalytics
        );
    }
}
