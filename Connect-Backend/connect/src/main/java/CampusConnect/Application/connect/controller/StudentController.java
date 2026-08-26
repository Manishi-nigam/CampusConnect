package CampusConnect.Application.connect.controller;

import CampusConnect.Application.connect.dto.EventResponseDTO;
import CampusConnect.Application.connect.entity.Student;
import CampusConnect.Application.connect.entity.User;
import CampusConnect.Application.connect.exception.ResourceNotFoundException;
import CampusConnect.Application.connect.exception.StudentNotFoundException;
import CampusConnect.Application.connect.exception.UnauthorizedException;
import CampusConnect.Application.connect.repository.StudentRepository;
import CampusConnect.Application.connect.repository.UserRepository;
import CampusConnect.Application.connect.service.EventService;
import CampusConnect.Application.connect.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/students")
@Tag(name = "Students", description = "Student management and student event endpoints")
public class StudentController {

    private final StudentService studentService;
    private final EventService eventService;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public StudentController(StudentService studentService,
                             EventService eventService,
                             StudentRepository studentRepository,
                             UserRepository userRepository) {
        this.studentService = studentService;
        this.eventService = eventService;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    // ✅ CREATE STUDENT
    @PostMapping
    @Operation(summary = "Create student profile (STUDENT or ADMIN only)")
    public ResponseEntity<Student> save(@Valid @RequestBody Student student) {
        if (student.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }

        User user = userRepository.findById(student.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + student.getUserId()));

        if (!"STUDENT".equalsIgnoreCase(user.getRole()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedException("User must have STUDENT or ADMIN role to create student profile");
        }

        student.setCreatedAt(LocalDateTime.now());
        Student savedStudent = studentService.saveStudent(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedStudent);
    }

    // ✅ GET ALL STUDENTS
    @GetMapping
    @Operation(summary = "Get all student profiles")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // ✅ GET EVENTS JOINED BY STUDENT
    @GetMapping("/{studentId}/events")
    @Operation(summary = "Get events joined by a student")
    public ResponseEntity<List<EventResponseDTO>> getEventsByStudentID(@PathVariable Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException(studentId);
        }

        return ResponseEntity.ok(eventService.getEventsByStudentId(studentId));
    }

    // ✅ DELETE STUDENT (ADMIN ONLY)
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete student profile (ADMIN only)")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id, @RequestParam Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedException("Only ADMIN can delete student profiles");
        }

        if (!studentRepository.existsById(id)) {
            throw new StudentNotFoundException(id);
        }

        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}