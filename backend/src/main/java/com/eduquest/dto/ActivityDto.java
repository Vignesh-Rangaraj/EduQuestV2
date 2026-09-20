package com.eduquest.dto;

import com.eduquest.domain.Activity;
import com.eduquest.domain.ActivityStatus;
import com.eduquest.domain.ActivityType;
import com.eduquest.domain.Subject;

import java.time.LocalDateTime;

public class ActivityDto {

    private Long id;
    private String title;
    private String description;
    private Subject subject;
    private ActivityType activityType;
    private ActivityStatus status;
    private Long createdByTeacherId;
    private Long assignedClassroomId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ActivityDto() {}

    public ActivityDto(Long id, String title, String description, Subject subject, ActivityType activityType, ActivityStatus status, Long createdByTeacherId, Long assignedClassroomId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.subject = subject;
        this.activityType = activityType;
        this.status = status;
        this.createdByTeacherId = createdByTeacherId;
        this.assignedClassroomId = assignedClassroomId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ActivityDto fromEntity(Activity activity) {
        if (activity == null) return null;
        return new ActivityDto(
                activity.getId(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getSubject(),
                activity.getActivityType(),
                activity.getStatus(),
                activity.getCreatedByTeacherId(),
                activity.getAssignedClassroomId(),
                activity.getCreatedAt(),
                activity.getUpdatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public ActivityType getActivityType() { return activityType; }
    public void setActivityType(ActivityType activityType) { this.activityType = activityType; }

    public ActivityStatus getStatus() { return status; }
    public void setStatus(ActivityStatus status) { this.status = status; }

    public Long getCreatedByTeacherId() { return createdByTeacherId; }
    public void setCreatedByTeacherId(Long createdByTeacherId) { this.createdByTeacherId = createdByTeacherId; }

    public Long getAssignedClassroomId() { return assignedClassroomId; }
    public void setAssignedClassroomId(Long assignedClassroomId) { this.assignedClassroomId = assignedClassroomId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
