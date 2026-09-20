package com.eduquest.controller;

import com.eduquest.domain.Teacher;
import com.eduquest.domain.UserAccount;
import com.eduquest.dto.ActivityDto;
import com.eduquest.dto.CreateActivityRequest;
import com.eduquest.repository.TeacherRepository;
import com.eduquest.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/activities")
public class TeacherActivityController {

    private final ActivityService activityService;
    private final TeacherRepository teacherRepository;

    public TeacherActivityController(ActivityService activityService, TeacherRepository teacherRepository) {
        this.activityService = activityService;
        this.teacherRepository = teacherRepository;
    }

    private Teacher getTeacher(Authentication authentication) {
        UserAccount user = (UserAccount) authentication.getPrincipal();
        return teacherRepository.findByUserAccountUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Teacher profile not found for user: " + user.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<ActivityDto>> getMyActivities(Authentication authentication) {
        Teacher teacher = getTeacher(authentication);
        return ResponseEntity.ok(activityService.getActivitiesByTeacher(teacher.getId()));
    }

    @PostMapping
    public ResponseEntity<ActivityDto> createActivity(@RequestBody CreateActivityRequest request, Authentication authentication) {
        Teacher teacher = getTeacher(authentication);
        if (request.getAssignedClassroomId() == null && teacher.getClassroom() != null) {
            request.setAssignedClassroomId(teacher.getClassroom().getId());
        }
        return ResponseEntity.ok(activityService.createActivity(request, teacher.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityDto> updateActivity(@PathVariable Long id, @RequestBody CreateActivityRequest request, Authentication authentication) {
        Teacher teacher = getTeacher(authentication);
        return ResponseEntity.ok(activityService.updateActivity(id, request, teacher.getId()));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ActivityDto> publishActivity(@PathVariable Long id, Authentication authentication) {
        Teacher teacher = getTeacher(authentication);
        return ResponseEntity.ok(activityService.publishActivity(id, teacher.getId()));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<ActivityDto> archiveActivity(@PathVariable Long id, Authentication authentication) {
        Teacher teacher = getTeacher(authentication);
        return ResponseEntity.ok(activityService.archiveActivity(id, teacher.getId()));
    }
}
