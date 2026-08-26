package CampusConnect.Application.connect.service;

import CampusConnect.Application.connect.entity.Event;
import CampusConnect.Application.connect.entity.JoinRequest;
import CampusConnect.Application.connect.entity.Student;
import CampusConnect.Application.connect.entity.User;
import CampusConnect.Application.connect.exception.ResourceNotFoundException;
import CampusConnect.Application.connect.exception.UnauthorizedException;
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
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        if (!"STUDENT".equalsIgnoreCase(user.getRole()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedException("Only STUDENT can request to join events");
        }

        Optional<JoinRequest> existingRequest = joinRequestRepository.findByEventIdAndUserId(eventId, userId);

        if (existingRequest.isPresent() && "PENDING".equalsIgnoreCase(existingRequest.get().getStatus())) {
            throw new IllegalArgumentException("Request already pending");
        }

        JoinRequest request = new JoinRequest();
        request.setEventId(eventId);
        request.setUserId(userId);
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());

        return joinRequestRepository.save(request);
    }

    // ✅ CLUB HEAD APPROVES REQUEST
    public JoinRequest approveRequest(Long requestId, Long clubUserId) {
        User clubUser = userRepository.findById(clubUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + clubUserId));

        if (!"CLUB_HEAD".equalsIgnoreCase(clubUser.getRole()) &&
            !"ADMIN".equalsIgnoreCase(clubUser.getRole())) {
            throw new UnauthorizedException("Only CLUB_HEAD or ADMIN can approve requests");
        }

        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id " + requestId));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + request.getEventId()));

        if (!"ADMIN".equalsIgnoreCase(clubUser.getRole()) && !event.getCreatedBy().getId().equals(clubUserId)) {
            throw new UnauthorizedException("Only the club that created the event can approve requests");
        }

        request.setStatus("APPROVED");
        JoinRequest savedRequest = joinRequestRepository.save(request);

        // Add participant (student)
        Optional<Student> participantOpt = studentRepository.findByUserId(request.getUserId());
        if (participantOpt.isPresent()) {
            Student participant = participantOpt.get();
            if (!event.getParticipants().contains(participant)) {
                event.getParticipants().add(participant);
                eventRepository.save(event);
            }
        }

        // Send notification
        notificationService.createNotification(request.getUserId(),
                "Your request for event \"" + event.getTitle() + "\" is APPROVED");

        return savedRequest;
    }

    // ✅ CLUB HEAD REJECTS REQUEST
    public JoinRequest rejectRequest(Long requestId, Long clubUserId) {
        User clubUser = userRepository.findById(clubUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + clubUserId));

        if (!"CLUB_HEAD".equalsIgnoreCase(clubUser.getRole()) &&
            !"ADMIN".equalsIgnoreCase(clubUser.getRole())) {
            throw new UnauthorizedException("Only CLUB_HEAD or ADMIN can reject requests");
        }

        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id " + requestId));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + request.getEventId()));

        if (!"ADMIN".equalsIgnoreCase(clubUser.getRole()) && !event.getCreatedBy().getId().equals(clubUserId)) {
            throw new UnauthorizedException("Only the club that created the event can reject requests");
        }

        request.setStatus("REJECTED");
        JoinRequest savedRequest = joinRequestRepository.save(request);

        // Send notification
        notificationService.createNotification(request.getUserId(),
                "Your request for event \"" + event.getTitle() + "\" is REJECTED");

        return savedRequest;
    }

    // ✅ VIEW ALL REQUESTS FOR EVENT
    public List<JoinRequest> getRequestsForEvent(Long eventId) {
        return joinRequestRepository.findByEventId(eventId);
    }

    // ✅ BATCH AGGREGATE: VIEW REQUESTS FOR MULTIPLE EVENTS
    public List<JoinRequest> getRequestsForEvents(List<Long> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) {
            return List.of();
        }
        return joinRequestRepository.findByEventIdIn(eventIds);
    }
}