package CampusConnect.Application.connect.controller;

import CampusConnect.Application.connect.entity.Notification;
import CampusConnect.Application.connect.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Notification> getNotifications(@RequestParam Long userId) {
        return notificationService.getUserNotifications(userId);
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{id}/read")
    public Notification markAsRead(@org.springframework.web.bind.annotation.PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(@RequestParam Long userId) {
        return notificationService.getUnreadCount(userId);
    }
}
