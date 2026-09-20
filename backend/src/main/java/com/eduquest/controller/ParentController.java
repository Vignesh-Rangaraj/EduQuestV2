package com.eduquest.controller;

import com.eduquest.domain.UserAccount;
import com.eduquest.dto.ParentDto;
import com.eduquest.service.ParentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parent")
public class ParentController {

    private final ParentService parentService;

    public ParentController(ParentService parentService) {
        this.parentService = parentService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ParentDto> getProfile(Authentication authentication) {
        UserAccount user = (UserAccount) authentication.getPrincipal();
        return ResponseEntity.ok(parentService.getParentProfileByUsername(user.getUsername()));
    }
}
