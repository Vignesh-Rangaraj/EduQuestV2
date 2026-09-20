package com.eduquest.controller;

import com.eduquest.dto.*;
import com.eduquest.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/teachers")
    public ResponseEntity<TeacherDto> createTeacher(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(adminService.createTeacher(request));
    }

    @PostMapping("/students")
    public ResponseEntity<StudentDto> createStudent(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(adminService.createStudent(request));
    }

    @PostMapping("/parents")
    public ResponseEntity<ParentDto> createParent(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(adminService.createParent(request));
    }

    @PostMapping("/teachers/assign-classroom")
    public ResponseEntity<TeacherDto> assignTeacherToClassroom(@RequestBody AssignTeacherRequest request) {
        return ResponseEntity.ok(adminService.assignTeacherToClassroom(request));
    }

    @PostMapping("/students/assign-parent")
    public ResponseEntity<StudentDto> assignParentToStudent(@RequestBody AssignParentRequest request) {
        return ResponseEntity.ok(adminService.assignParentToStudent(request));
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherDto>> getAllTeachers() {
        return ResponseEntity.ok(adminService.getAllTeachers());
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentDto>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/parents")
    public ResponseEntity<List<ParentDto>> getAllParents() {
        return ResponseEntity.ok(adminService.getAllParents());
    }

    @GetMapping("/classrooms")
    public ResponseEntity<List<ClassroomDto>> getAllClassrooms() {
        return ResponseEntity.ok(adminService.getAllClassrooms());
    }
}
