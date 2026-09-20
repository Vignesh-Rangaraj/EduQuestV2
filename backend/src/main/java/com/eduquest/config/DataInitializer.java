package com.eduquest.config;

import com.eduquest.domain.*;
import com.eduquest.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final SchoolRepository schoolRepository;
    private final ClassroomRepository classroomRepository;
    private final UserAccountRepository userAccountRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            SchoolRepository schoolRepository,
            ClassroomRepository classroomRepository,
            UserAccountRepository userAccountRepository,
            TeacherRepository teacherRepository,
            ParentRepository parentRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {
        this.schoolRepository = schoolRepository;
        this.classroomRepository = classroomRepository;
        this.userAccountRepository = userAccountRepository;
        this.teacherRepository = teacherRepository;
        this.parentRepository = parentRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (schoolRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data generation.");
            return;
        }

        log.info("Seeding Phase 1.1 Foundation Data (Grades 6–9)...");

        // 1. Create School
        School school = schoolRepository.save(School.builder()
                .name("EduQuest Demo School")
                .code("EQ-DEMO-01")
                .build());

        // 2. Create Classrooms (6-A, 7-A, 8-A, 9-A)
        Classroom class6a = classroomRepository.save(Classroom.builder()
                .grade(6)
                .section("A")
                .name("6-A")
                .school(school)
                .build());

        Classroom class7a = classroomRepository.save(Classroom.builder()
                .grade(7)
                .section("A")
                .name("7-A")
                .school(school)
                .build());

        Classroom class8a = classroomRepository.save(Classroom.builder()
                .grade(8)
                .section("A")
                .name("8-A")
                .school(school)
                .build());

        Classroom class9a = classroomRepository.save(Classroom.builder()
                .grade(9)
                .section("A")
                .name("9-A")
                .school(school)
                .build());

        // 3. Create Super Admin
        userAccountRepository.save(UserAccount.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator")
                .role(Role.SUPER_ADMIN)
                .build());

        // 4. Create Teachers (1 per class)
        createTeacherAccount("teacher_6a", "password123", "Anita Sharma", class6a);
        createTeacherAccount("teacher_7a", "password123", "Karthikeyan R", class7a);
        createTeacherAccount("teacher_8a", "password123", "Senthil Kumar", class8a);
        createTeacherAccount("teacher_9a", "password123", "Priya Ramesh", class9a);

        // 5. Seed Students & Parents for Grades 6-A, 7-A, 8-A, 9-A
        String[][] class6aData = {
                {"student_6a_1", "Arjun Kumar", "parent_6a_1", "Lakshmi Arjun"},
                {"student_6a_2", "Harini S", "parent_6a_2", "Meena Harini"},
                {"student_6a_3", "Pranav K", "parent_6a_3", "Kavitha Pranav"},
                {"student_6a_4", "Nivetha R", "parent_6a_4", "Rameshwari Nivetha"},
                {"student_6a_5", "Surya Prakash", "parent_6a_5", "Kalaivani Surya"}
        };
        seedClassroomStudentsAndParents(class6a, class6aData);

        String[][] class7aData = {
                {"student_7a_1", "Kavin Raj", "parent_7a_1", "Revathi Kavin"},
                {"student_7a_2", "Keerthana M", "parent_7a_2", "Shanthi Keerthana"},
                {"student_7a_3", "Vishnu V", "parent_7a_3", "Gomathi Vishnu"},
                {"student_7a_4", "Aishwarya P", "parent_7a_4", "Rajalakshmi Aishwarya"},
                {"student_7a_5", "Dharshan S", "parent_7a_5", "Selvi Dharshan"}
        };
        seedClassroomStudentsAndParents(class7a, class7aData);

        String[][] class8aData = {
                {"student_8a_1", "Gokul Krishna", "parent_8a_1", "Lakshmi Gokul"},
                {"student_8a_2", "Nandhini S", "parent_8a_2", "Revathi Nandhini"},
                {"student_8a_3", "Vignesh R", "parent_8a_3", "Kalaivani Vignesh"},
                {"student_8a_4", "Deepika M", "parent_8a_4", "Selvi Deepika"},
                {"student_8a_5", "Harish Kumar", "parent_8a_5", "Meenakshi Harish"}
        };
        seedClassroomStudentsAndParents(class8a, class8aData);

        String[][] class9aData = {
                {"student_9a_1", "Akash P", "parent_9a_1", "Rajalakshmi Akash"},
                {"student_9a_2", "Aarthi K", "parent_9a_2", "Shanthi Aarthi"},
                {"student_9a_3", "Sanjay R", "parent_9a_3", "Gomathi Sanjay"},
                {"student_9a_4", "Swetha M", "parent_9a_4", "Uma Swetha"},
                {"student_9a_5", "Dinesh Kumar", "parent_9a_5", "Kala Dinesh"}
        };
        seedClassroomStudentsAndParents(class9a, class9aData);

        log.info("Phase 1.1 Data Seeding Complete! 1 School, 4 Classrooms (6-A, 7-A, 8-A, 9-A), 1 Admin, 4 Teachers, 20 Parents, 20 Students initialized.");
    }

    private void createTeacherAccount(String username, String rawPassword, String fullName, Classroom classroom) {
        UserAccount teacherUser = userAccountRepository.save(UserAccount.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(fullName)
                .role(Role.TEACHER)
                .build());

        teacherRepository.save(Teacher.builder()
                .userAccount(teacherUser)
                .classroom(classroom)
                .build());
    }

    private void seedClassroomStudentsAndParents(Classroom classroom, String[][] studentParentData) {
        for (String[] entry : studentParentData) {
            String studentUsername = entry[0];
            String studentFullName = entry[1];
            String parentUsername = entry[2];
            String parentFullName = entry[3];

            UserAccount parentUser = userAccountRepository.save(UserAccount.builder()
                    .username(parentUsername)
                    .password(passwordEncoder.encode("password123"))
                    .fullName(parentFullName)
                    .role(Role.PARENT)
                    .build());

            Parent parent = parentRepository.save(Parent.builder()
                    .userAccount(parentUser)
                    .build());

            UserAccount studentUser = userAccountRepository.save(UserAccount.builder()
                    .username(studentUsername)
                    .password(passwordEncoder.encode("password123"))
                    .fullName(studentFullName)
                    .role(Role.STUDENT)
                    .build());

            studentRepository.save(Student.builder()
                    .userAccount(studentUser)
                    .classroom(classroom)
                    .parent(parent)
                    .build());
        }
    }
}
