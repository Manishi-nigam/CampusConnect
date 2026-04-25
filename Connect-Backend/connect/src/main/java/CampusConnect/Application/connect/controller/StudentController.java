package CampusConnect.Application.connect.controller;

import CampusConnect.Application.connect.dto.EventResponseDTO;
import CampusConnect.Application.connect.entity.Student;
import CampusConnect.Application.connect.entity.User;
import CampusConnect.Application.connect.service.EventService;
import CampusConnect.Application.connect.service.StudentService;
import CampusConnect.Application.connect.repository.StudentRepository;
import CampusConnect.Application.connect.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/students")
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
    public ResponseEntity<Student> save(@Valid @RequestBody Student student) {

        if (student.getUserId() == null) {
            throw new RuntimeException("userId is required");
        }

        User user = userRepository.findById(student.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"STUDENT".equals(user.getRole())) {
            throw new RuntimeException("User must have STUDENT role to create student profile");
        }

        student.setCreatedAt(LocalDateTime.now());

        Student savedStudent = studentService.saveStudent(student);
        return ResponseEntity.ok(savedStudent);
    }

    // ✅ GET ALL STUDENTS
    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    // ✅ GET EVENTS JOINED BY STUDENT (FIXED)
    @GetMapping("/{studentId}/events")
    public ResponseEntity<List<EventResponseDTO>> getEventsByStudentID(
            @PathVariable Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return ResponseEntity.ok(
                eventService.getEventsByStudentId(student.getId()) // ✅ FIXED
        );
    }

    // ✅ DELETE STUDENT (ADMIN ONLY)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id,
            @RequestParam Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only ADMIN can delete student");
        }

        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found");
        }

        studentRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}