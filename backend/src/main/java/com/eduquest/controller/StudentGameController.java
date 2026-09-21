package com.eduquest.controller;

import com.eduquest.domain.GameConfiguration;
import com.eduquest.domain.Student;
import com.eduquest.domain.UserAccount;
import com.eduquest.repository.StudentRepository;
import com.eduquest.service.GameEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student/game")
public class StudentGameController {

    private final GameEngineService gameEngineService;
    private final StudentRepository studentRepository;

    public StudentGameController(GameEngineService gameEngineService, StudentRepository studentRepository) {
        this.gameEngineService = gameEngineService;
        this.studentRepository = studentRepository;
    }

    private Student getStudentFromAuth(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        UserAccount user = (UserAccount) auth.getPrincipal();
        return studentRepository.findByUserAccountUsername(user.getUsername()).orElse(null);
    }

    @GetMapping("/config/{activityId}")
    public ResponseEntity<?> getGameConfig(@PathVariable Long activityId) {
        GameConfiguration config = gameEngineService.getGameConfigByActivityId(activityId);
        if (config == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(config);
    }

    @PostMapping("/submit/{activityId}")
    public ResponseEntity<Map<String, Object>> submitGame(
            @PathVariable Long activityId,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        Student student = getStudentFromAuth(auth);
        if (student == null) return ResponseEntity.badRequest().build();

        String submittedAnswersJson = body.containsKey("answers") ? body.get("answers").toString() : "{}";
        Map<String, Object> result = gameEngineService.evaluateGame(student.getId(), activityId, submittedAnswersJson);
        return ResponseEntity.ok(result);
    }
}
