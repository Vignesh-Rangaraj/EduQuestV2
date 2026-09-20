package com.eduquest.dto;

import com.eduquest.domain.ActivityType;
import com.eduquest.domain.Subject;

public class CreateActivityRequest {

    private String title;
    private String description;
    private Subject subject;
    private ActivityType activityType;
    private Long assignedClassroomId;

    public CreateActivityRequest() {}

    public CreateActivityRequest(String title, String description, Subject subject, ActivityType activityType, Long assignedClassroomId) {
        this.title = title;
        this.description = description;
        this.subject = subject;
        this.activityType = activityType;
        this.assignedClassroomId = assignedClassroomId;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public ActivityType getActivityType() { return activityType; }
    public void setActivityType(ActivityType activityType) { this.activityType = activityType; }

    public Long getAssignedClassroomId() { return assignedClassroomId; }
    public void setAssignedClassroomId(Long assignedClassroomId) { this.assignedClassroomId = assignedClassroomId; }
}
