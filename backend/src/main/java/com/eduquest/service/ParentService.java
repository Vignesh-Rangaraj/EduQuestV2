package com.eduquest.service;

import com.eduquest.domain.Parent;
import com.eduquest.dto.ParentDto;
import com.eduquest.repository.ParentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ParentService {

    private final ParentRepository parentRepository;
    private final AdminService adminService;

    public ParentService(ParentRepository parentRepository, AdminService adminService) {
        this.parentRepository = parentRepository;
        this.adminService = adminService;
    }

    @Transactional(readOnly = true)
    public ParentDto getParentProfileByUsername(String username) {
        Parent parent = parentRepository.findByUserAccountUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Parent profile not found for user: " + username));
        return adminService.mapToParentDto(parent);
    }
}
