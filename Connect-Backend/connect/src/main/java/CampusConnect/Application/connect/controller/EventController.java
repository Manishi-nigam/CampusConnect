package CampusConnect.Application.connect.controller;

import CampusConnect.Application.connect.dto.EventRequestDTO;
import CampusConnect.Application.connect.dto.EventResponseDTO;
import CampusConnect.Application.connect.entity.JoinRequest;
import CampusConnect.Application.connect.entity.User;
import CampusConnect.Application.connect.exception.ResourceNotFoundException;
import CampusConnect.Application.connect.exception.UnauthorizedException;
import CampusConnect.Application.connect.repository.UserRepository;
import CampusConnect.Application.connect.service.EventService;
import CampusConnect.Application.connect.service.JoinRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@Tag(name = "Events", description = "Event creation, listing, and join request management")
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

    // ✅ CREATE EVENT (CLUB or ADMIN)
    @PostMapping
    @Operation(summary = "Create an event (CLUB or ADMIN)")
    public ResponseEntity<EventResponseDTO> saveEvent(
            @RequestParam Long userId,
            @Valid @RequestBody EventRequestDTO eventRequestDTO) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        if (!"CLUB_HEAD".equalsIgnoreCase(user.getRole()) && 
            !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedException("Only CLUB_HEAD or ADMIN can create events");
        }

        EventResponseDTO created = eventService.saveEventFromDTO(eventRequestDTO, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ✅ GET EVENTS (PAGINATION + SORTING)
    @GetMapping
    @Operation(summary = "Get all events with pagination and sorting")
    public ResponseEntity<Page<EventResponseDTO>> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(eventService.getAllEvents(pageable));
    }

    // ✅ STUDENT REQUEST TO JOIN EVENT
    @PostMapping("/{eventId}/request")
    @Operation(summary = "Request to join an event (STUDENT)")
    public ResponseEntity<JoinRequest> requestToJoin(
            @PathVariable Long eventId,
            @RequestParam Long userId) {

        JoinRequest request = joinRequestService.requestToJoin(eventId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(request);
    }

    // ✅ CLUB VIEW BATCH REQUESTS (AGGREGATE FOR MULTIPLE EVENTS)
    @GetMapping("/requests")
    @Operation(summary = "View join requests for multiple events in a single batch request (CLUB or ADMIN)")
    public ResponseEntity<List<JoinRequest>> getBatchRequests(@RequestParam(required = false) List<Long> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(joinRequestService.getRequestsForEvents(eventIds));
    }

    // ✅ CLUB VIEW REQUESTS FOR SINGLE EVENT
    @GetMapping("/{eventId}/requests")
    @Operation(summary = "View join requests for an event (CLUB or ADMIN)")
    public ResponseEntity<List<JoinRequest>> getRequests(@PathVariable Long eventId) {
        return ResponseEntity.ok(joinRequestService.getRequestsForEvent(eventId));
    }

    // ✅ CLUB APPROVES REQUEST
    @PostMapping("/requests/{requestId}/approve")
    @Operation(summary = "Approve a join request (Event Creator CLUB)")
    public ResponseEntity<JoinRequest> approveRequest(
            @PathVariable Long requestId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(joinRequestService.approveRequest(requestId, userId));
    }

    // ✅ CLUB REJECTS REQUEST
    @PostMapping("/requests/{requestId}/reject")
    @Operation(summary = "Reject a join request (Event Creator CLUB)")
    public ResponseEntity<JoinRequest> rejectRequest(
            @PathVariable Long requestId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(joinRequestService.rejectRequest(requestId, userId));
    }
}