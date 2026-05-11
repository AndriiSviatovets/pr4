package pr4.pr4;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:3000") // Дозвіл для React
public class MainController {

    private List<Student> students = new ArrayList<>();

    // Отримання списку (з пошуком)
    @GetMapping
    public List<Student> getStudents(@RequestParam(value = "keyword", required = false) String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            String lowerCaseKeyword = keyword.toLowerCase();
            return students.stream()
                    .filter(s -> s.getName().toLowerCase().contains(lowerCaseKeyword) ||
                                 s.getEmail().toLowerCase().contains(lowerCaseKeyword))
                    .toList();
        }
        return students;
    }

    // Отримання одного студента за ID
    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable String id) {
        return students.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Студента не знайдено"));
    }

    // Додавання студента
    @PostMapping
    public Student addStudent(@Valid @RequestBody Student student) {
        students.add(student);
        return student;
    }

    // Оновлення студента
    @PutMapping("/{id}")
    public Student updateStudent(@PathVariable String id, @Valid @RequestBody Student updatedStudent) {
        for (int i = 0; i < students.size(); i++) {
            if (students.get(i).getId().equals(id)) {
                updatedStudent.setId(id); // Зберігаємо старий ID
                students.set(i, updatedStudent);
                return updatedStudent;
            }
        }
        throw new RuntimeException("Студента не знайдено");
    }

    // Видалення студента
    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable String id) {
        students.removeIf(student -> student.getId().equals(id));
    }
}