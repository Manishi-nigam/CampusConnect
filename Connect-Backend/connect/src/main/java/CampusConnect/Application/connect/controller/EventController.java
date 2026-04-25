package CampusConnect.Application.connect.controller;

import CampusConnect.Application.connect.dto.EventRequestDTO;
import CampusConnect.Application.connect.dto.EventResponseDTO;
import CampusConnect.Application.connect.entity.JoinRequest;
import CampusConnect.Application.connect.entity.User;
import CampusConnect.Application.connect.repository.UserRepository;
import CampusConnect.Application.connect.service.EventService;
import CampusConnect.Application.connect.service.JoinRequestService;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;
    private final JoinRequestService joinRequestService;

    public EventController(EventService eventService,
            UserRepository userRepository,
            JoinRequestService joinRequestService) {
        this.eventService = eventService;
        this.userRepository = userRepository;
        this.joinRequestService = joinRequestService;
    }

    // ✅ CREATE EVENT (ONLY CLUB)
    @PostMapping
    public ResponseEntity<EventResponseDTO> saveEvent(
            @RequestParam Long userId,
            @RequestBody EventRequestDTO eventRequestDTO) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRole().equals("CLUB")) {
            throw new RuntimeException("Only CLUB can create events");
        }

        return ResponseEntity.ok(
                eventService.saveEventFromDTO(eventRequestDTO, userId));
    }

    // ✅ GET EVENTS (PAGINATION + SORTING)
    @GetMapping
    public Page<EventResponseDTO> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return eventService.getAllEvents(pageable);
    }

    // ✅ STUDENT REQUEST TO JOIN EVENT
    @PostMapping("/{eventId}/request")
    public JoinRequest requestToJoin(
            @PathVariable Long eventId,
            @RequestParam Long userId) {

        return joinRequestService.requestToJoin(eventId, userId);
    }

    // ✅ CLUB VIEW REQUESTS
    @GetMapping("/{eventId}/requests")
    public List<JoinRequest> getRequests(@PathVariable Long eventId) {
        return joinRequestService.getRequestsForEvent(eventId);
    }

    // ✅ CLUB APPROVES REQUEST
    @PostMapping("/requests/{requestId}/approve")
    public JoinRequest approveRequest(
            @PathVariable Long requestId,
            @RequestParam Long userId) {

        return joinRequestService.approveRequest(requestId, userId);
    }

    // ✅ CLUB REJECTS REQUEST
    @PostMapping("/requests/{requestId}/reject")
    public JoinRequest rejectRequest(
            @PathVariable Long requestId,
            @RequestParam Long userId) {

        return joinRequestService.rejectRequest(requestId, userId);
    }
}