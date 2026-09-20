package com.eduquest.service;

import com.eduquest.domain.Student;
import com.eduquest.dto.LeaderboardEntryDto;
import com.eduquest.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class LeaderboardService {

    private final StudentRepository studentRepository;

    public LeaderboardService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getLeaderboard(Long studentId, String scope) {
        Student currentStudent = studentRepository.findById(studentId).orElse(null);
        Long classroomId = (currentStudent != null && currentStudent.getClassroom() != null) ? currentStudent.getClassroom().getId() : null;

        List<Student> allStudents = studentRepository.findAll();

        if ("CLASSROOM".equalsIgnoreCase(scope) && classroomId != null) {
            allStudents = allStudents.stream()
                    .filter(s -> s.getClassroom() != null && classroomId.equals(s.getClassroom().getId()))
                    .toList();
        }

        List<Student> sortedStudents = allStudents.stream()
                .sorted(Comparator.comparingInt((Student s) -> s.getXp() != null ? s.getXp() : 0).reversed())
                .toList();

        List<LeaderboardEntryDto> entries = new ArrayList<>();
        int rank = 1;
        for (Student s : sortedStudents) {
            String name = s.getUserAccount() != null ? s.getUserAccount().getFullName() : "Student #" + s.getId();
            String clsName = s.getClassroom() != null ? s.getClassroom().getName() : "N/A";
            int xp = s.getXp() != null ? s.getXp() : 0;
            int level = s.getLevel() != null ? s.getLevel() : (xp / 100) + 1;

            entries.add(new LeaderboardEntryDto(rank++, s.getId(), name, clsName, xp, level));
        }

        return entries;
    }
}
