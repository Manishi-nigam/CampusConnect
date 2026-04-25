package CampusConnect.Application.connect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank
    private String name;

    @Column(nullable = false, unique = true)
    @NotBlank
    private String email;

    @Column(nullable = false, unique = true)
    @NotBlank
    private String rollNumber;

    @Column(nullable = false)
    @NotBlank
    private String department;

    @Column(nullable = false)
    @NotNull
    private Integer year;

    private LocalDateTime createdAt;
    
    private Long userId;

    @ManyToMany(mappedBy = "participants")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Event> events;
}

