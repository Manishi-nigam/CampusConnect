package CampusConnect.Application.connect.controller;

import CampusConnect.Application.connect.entity.Notification;
import CampusConnect.Application.connect.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notifications", description = "User notification management")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get all notifications for a user")
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get total unread notifications count for a user")
    public ResponseEntity<Long> getUnreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }
}
