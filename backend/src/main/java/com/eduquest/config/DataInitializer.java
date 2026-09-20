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

        log.info("Seeding Phase 1 Foundation Data...");

        // 1. Create School
        School school = schoolRepository.save(School.builder()
                .name("EduQuest Demo School")
                .code("EQ-DEMO-01")
                .build());

        // 2. Create Classrooms (6-A and 7-A)
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

        // 3. Create Super Admin
        userAccountRepository.save(UserAccount.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator")
                .role(Role.SUPER_ADMIN)
                .build());

        // 4. Create Teachers (1 per class)
        UserAccount teacher6aUser = userAccountRepository.save(UserAccount.builder()
                .username("teacher_6a")
                .password(passwordEncoder.encode("password123"))
                .fullName("Anita Sharma")
                .role(Role.TEACHER)
                .build());

        teacherRepository.save(Teacher.builder()
                .userAccount(teacher6aUser)
                .classroom(class6a)
                .build());

        UserAccount teacher7aUser = userAccountRepository.save(UserAccount.builder()
                .username("teacher_7a")
                .password(passwordEncoder.encode("password123"))
                .fullName("Rajesh Verma")
                .role(Role.TEACHER)
                .build());

        teacherRepository.save(Teacher.builder()
                .userAccount(teacher7aUser)
                .classroom(class7a)
                .build());

        // 5. Create 10 Parents & 10 Students (5 per class)
        // 6th Standard Students & Parents
        for (int i = 1; i <= 5; i++) {
            UserAccount parentUser = userAccountRepository.save(UserAccount.builder()
                    .username("parent_6a_" + i)
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Parent 6A " + i)
                    .role(Role.PARENT)
                    .build());

            Parent parent = parentRepository.save(Parent.builder()
                    .userAccount(parentUser)
                    .build());

            UserAccount studentUser = userAccountRepository.save(UserAccount.builder()
                    .username("student_6a_" + i)
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Student 6A " + i)
                    .role(Role.STUDENT)
                    .build());

            studentRepository.save(Student.builder()
                    .userAccount(studentUser)
                    .classroom(class6a)
                    .parent(parent)
                    .build());
        }

        // 7th Standard Students & Parents
        for (int i = 1; i <= 5; i++) {
            UserAccount parentUser = userAccountRepository.save(UserAccount.builder()
                    .username("parent_7a_" + i)
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Parent 7A " + i)
                    .role(Role.PARENT)
                    .build());

            Parent parent = parentRepository.save(Parent.builder()
                    .userAccount(parentUser)
                    .build());

            UserAccount studentUser = userAccountRepository.save(UserAccount.builder()
                    .username("student_7a_" + i)
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Student 7A " + i)
                    .role(Role.STUDENT)
                    .build());

            studentRepository.save(Student.builder()
                    .userAccount(studentUser)
                    .classroom(class7a)
                    .parent(parent)
                    .build());
        }

        log.info("Phase 1 Data Seeding Complete! 1 School, 2 Classrooms, 1 Admin, 2 Teachers, 10 Parents, 10 Students initialized.");
    }
}
