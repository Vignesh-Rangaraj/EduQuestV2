package com.eduquest.controller;

import com.eduquest.domain.Student;
import com.eduquest.domain.UserAccount;
import com.eduquest.dto.SyncRequestDto;
import com.eduquest.dto.SyncResponse;
import com.eduquest.repository.StudentRepository;
import com.eduquest.service.SyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/sync")
public class StudentSyncController {

    private final SyncService syncService;
    private final StudentRepository studentRepository;

    public StudentSyncController(SyncService syncService, StudentRepository studentRepository) {
        this.syncService = syncService;
        this.studentRepository = studentRepository;
    }

    @PostMapping
    public ResponseEntity<SyncResponse> processSync(@RequestBody SyncRequestDto request, Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserAccount) {
            UserAccount user = (UserAccount) authentication.getPrincipal();
            Student student = studentRepository.findByUserAccountUsername(user.getUsername()).orElse(null);
            if (student != null && request.getStudentId() == null) {
                request.setStudentId(student.getId());
            }
        }

        SyncResponse response = syncService.processSync(request);
        return ResponseEntity.ok(response);
    }
}
