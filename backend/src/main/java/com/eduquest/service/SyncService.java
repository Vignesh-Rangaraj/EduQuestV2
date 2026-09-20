package com.eduquest.service;

import com.eduquest.domain.SyncQueue;
import com.eduquest.domain.SyncStatus;
import com.eduquest.dto.SyncItemDto;
import com.eduquest.dto.SyncRequestDto;
import com.eduquest.dto.SyncResponse;
import com.eduquest.repository.SyncQueueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SyncService {

    private final SyncQueueRepository syncQueueRepository;
    private final StudentProgressService progressService;

    public SyncService(SyncQueueRepository syncQueueRepository, StudentProgressService progressService) {
        this.syncQueueRepository = syncQueueRepository;
        this.progressService = progressService;
    }

    @Transactional
    public SyncResponse processSync(SyncRequestDto request) {
        List<String> syncedItems = new ArrayList<>();
        List<String> failedItems = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        if (request.getItems() == null || request.getItems().isEmpty()) {
            return new SyncResponse(true, syncedItems, failedItems, errors);
        }

        for (SyncItemDto item : request.getItems()) {
            String clientItemId = item.getId();

            // Deduplication Check for Idempotency
            if (clientItemId != null && !clientItemId.trim().isEmpty()) {
                Optional<SyncQueue> existingEntry = syncQueueRepository.findFirstByClientQueueItemId(clientItemId);
                if (existingEntry.isPresent() && existingEntry.get().getStatus() == SyncStatus.COMPLETED) {
                    // Item was already successfully processed in a previous sync request retry
                    syncedItems.add(clientItemId);
                    continue;
                }
            }

            SyncQueue queueEntry = SyncQueue.builder()
                    .clientQueueItemId(clientItemId)
                    .studentId(request.getStudentId() != null ? request.getStudentId() : item.getStudentId())
                    .actionType(item.getActionType())
                    .payloadJson(item.getPayload() != null ? item.getPayload() : "{}")
                    .status(SyncStatus.PROCESSING)
                    .build();
            syncQueueRepository.save(queueEntry);

            try {
                if ("COMPLETE_ACTIVITY".equalsIgnoreCase(item.getActionType()) || "UPDATE_PROGRESS".equalsIgnoreCase(item.getActionType())) {
                    Long studentId = request.getStudentId() != null ? request.getStudentId() : item.getStudentId();
                    Long activityId = item.getActivityId();
                    Integer score = item.getScore() != null ? item.getScore() : 100;
                    LocalDateTime completedAt = parseDateTime(item.getCompletedAt());

                    if (studentId != null && activityId != null) {
                        progressService.saveProgress(studentId, activityId, score, true, completedAt);
                    }
                }

                queueEntry.setStatus(SyncStatus.COMPLETED);
                queueEntry.setProcessedAt(LocalDateTime.now());
                syncQueueRepository.save(queueEntry);

                syncedItems.add(clientItemId != null ? clientItemId : String.valueOf(queueEntry.getId()));
            } catch (Exception e) {
                queueEntry.setStatus(SyncStatus.FAILED);
                queueEntry.setProcessedAt(LocalDateTime.now());
                syncQueueRepository.save(queueEntry);

                failedItems.add(clientItemId != null ? clientItemId : String.valueOf(queueEntry.getId()));
                errors.add("Failed item " + clientItemId + ": " + e.getMessage());
            }
        }

        boolean overallSuccess = failedItems.isEmpty();
        return new SyncResponse(overallSuccess, syncedItems, failedItems, errors);
    }

    private LocalDateTime parseDateTime(String str) {
        if (str == null || str.trim().isEmpty()) return LocalDateTime.now();
        try {
            return LocalDateTime.parse(str, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}
