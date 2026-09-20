package com.eduquest.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Subject subject;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityStatus status;

    @Column(name = "created_by_teacher_id")
    private Long createdByTeacherId;

    @Column(name = "assigned_classroom_id")
    private Long assignedClassroomId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Activity() {}

    public Activity(Long id, String title, String description, Subject subject, ActivityType activityType, ActivityStatus status, Long createdByTeacherId, Long assignedClassroomId, LocalDateTime createdAt, LocalDateTime updatedAt) {
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

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = ActivityStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public static ActivityBuilder builder() { return new ActivityBuilder(); }

    public static class ActivityBuilder {
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

        public ActivityBuilder id(Long id) { this.id = id; return this; }
        public ActivityBuilder title(String title) { this.title = title; return this; }
        public ActivityBuilder description(String description) { this.description = description; return this; }
        public ActivityBuilder subject(Subject subject) { this.subject = subject; return this; }
        public ActivityBuilder activityType(ActivityType activityType) { this.activityType = activityType; return this; }
        public ActivityBuilder status(ActivityStatus status) { this.status = status; return this; }
        public ActivityBuilder createdByTeacherId(Long createdByTeacherId) { this.createdByTeacherId = createdByTeacherId; return this; }
        public ActivityBuilder assignedClassroomId(Long assignedClassroomId) { this.assignedClassroomId = assignedClassroomId; return this; }
        public ActivityBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ActivityBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Activity build() {
            return new Activity(id, title, description, subject, activityType, status, createdByTeacherId, assignedClassroomId, createdAt, updatedAt);
        }
    }
}
