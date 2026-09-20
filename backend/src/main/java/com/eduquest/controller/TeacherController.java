package com.eduquest.controller;

import com.eduquest.domain.UserAccount;
import com.eduquest.dto.StudentDto;
import com.eduquest.dto.TeacherDto;
import com.eduquest.service.TeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping("/profile")
    public ResponseEntity<TeacherDto> getProfile(Authentication authentication) {
        UserAccount user = (UserAccount) authentication.getPrincipal();
        return ResponseEntity.ok(teacherService.getTeacherProfileByUsername(user.getUsername()));
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentDto>> getAssignedStudents(Authentication authentication) {
        UserAccount user = (UserAccount) authentication.getPrincipal();
        return ResponseEntity.ok(teacherService.getStudentsInTeacherClassroom(user.getUsername()));
    }
}
