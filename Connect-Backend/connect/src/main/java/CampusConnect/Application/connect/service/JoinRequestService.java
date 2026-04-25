package CampusConnect.Application.connect.service;

import CampusConnect.Application.connect.entity.Event;
import CampusConnect.Application.connect.entity.JoinRequest;
import CampusConnect.Application.connect.entity.Student;
import CampusConnect.Application.connect.entity.User;
import CampusConnect.Application.connect.repository.EventRepository;
import CampusConnect.Application.connect.repository.JoinRequestRepository;
import CampusConnect.Application.connect.repository.StudentRepository;
import CampusConnect.Application.connect.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;

    public JoinRequestService(JoinRequestRepository joinRequestRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            EventRepository eventRepository,
            NotificationService notificationService) {
        this.joinRequestRepository = joinRequestRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.notificationService = notificationService;
    }

    // ✅ STUDENT REQUEST TO JOIN
    public JoinRequest requestToJoin(Long eventId, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"STUDENT".equals(user.getRole())) {
            throw new RuntimeException("Only STUDENT can request to join");
        }

        Optional<JoinRequest> existingRequest = joinRequestRepository.findByEventIdAndUserId(eventId, userId);

        if (existingRequest.isPresent() &&
                "PENDING".equals(existingRequest.get().getStatus())) {
            throw new RuntimeException("Request already pending");
        }

        JoinRequest request = new JoinRequest();
        request.setEventId(eventId);
        request.setUserId(userId);
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());

        return joinRequestRepository.save(request);
    }

    // ✅ CLUB APPROVES REQUEST
    public JoinRequest approveRequest(Long requestId, Long clubUserId) {

        User clubUser = userRepository.findById(clubUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"CLUB".equals(clubUser.getRole())) {
            throw new RuntimeException("Only CLUB can approve requests");
        }

        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // 🔥 FIXED: check event ownership using USER
        if (!event.getCreatedBy().getId().equals(clubUserId)) {
            throw new RuntimeException("Only the club that created the event can approve requests");
        }

        request.setStatus("APPROVED");
        JoinRequest savedRequest = joinRequestRepository.save(request);

        // Add participant (student)
        Student participant = studentRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Participant profile not found"));

        if (!event.getParticipants().contains(participant)) {
            event.getParticipants().add(participant);
            eventRepository.save(event);
        }

        // Send notification
        notificationService.createNotification(request.getUserId(), 
            "Your request for event " + event.getTitle() + " is APPROVED");

        return savedRequest;
    }

    // ✅ CLUB REJECTS REQUEST
    public JoinRequest rejectRequest(Long requestId, Long clubUserId) {

        User clubUser = userRepository.findById(clubUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"CLUB".equals(clubUser.getRole())) {
            throw new RuntimeException("Only CLUB can reject requests");
        }

        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // 🔥 FIXED: check event ownership using USER
        if (!event.getCreatedBy().getId().equals(clubUserId)) {
            throw new RuntimeException("Only the club that created the event can reject requests");
        }

        request.setStatus("REJECTED");
        JoinRequest savedRequest = joinRequestRepository.save(request);

        // Send notification
        notificationService.createNotification(request.getUserId(), 
            "Your request for event " + event.getTitle() + " is REJECTED");

        return savedRequest;
    }

    // ✅ VIEW ALL REQUESTS FOR EVENT
    public List<JoinRequest> getRequestsForEvent(Long eventId) {
        return joinRequestRepository.findByEventId(eventId);
    }
}