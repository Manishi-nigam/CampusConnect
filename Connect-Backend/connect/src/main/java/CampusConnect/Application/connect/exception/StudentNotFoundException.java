package CampusConnect.Application.connect.exception;

public class StudentNotFoundException extends ResourceNotFoundException {
    public StudentNotFoundException(Long id) {
        super("Student not found with id " + id);
    }
}
