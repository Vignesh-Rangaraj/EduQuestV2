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
    private final ActivityRepository activityRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            SchoolRepository schoolRepository,
            ClassroomRepository classroomRepository,
            UserAccountRepository userAccountRepository,
            TeacherRepository teacherRepository,
            ParentRepository parentRepository,
            StudentRepository studentRepository,
            ActivityRepository activityRepository,
            PasswordEncoder passwordEncoder) {
        this.schoolRepository = schoolRepository;
        this.classroomRepository = classroomRepository;
        this.userAccountRepository = userAccountRepository;
        this.teacherRepository = teacherRepository;
        this.parentRepository = parentRepository;
        this.studentRepository = studentRepository;
        this.activityRepository = activityRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (schoolRepository.count() > 0) {
            log.info("Database already seeded. Checking activities seeding...");
            seedActivitiesIfMissing();
            return;
        }

        log.info("Seeding Phase 1.1 & Phase 2 Foundation Data (Grades 6–9)...");

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
        Teacher t6 = createTeacherAccount("teacher_6a", "password123", "Anita Sharma", class6a);
        Teacher t7 = createTeacherAccount("teacher_7a", "password123", "Karthikeyan R", class7a);
        Teacher t8 = createTeacherAccount("teacher_8a", "password123", "Senthil Kumar", class8a);
        Teacher t9 = createTeacherAccount("teacher_9a", "password123", "Priya Ramesh", class9a);

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

        // 6. Seed Demo Activities
        seedDemoActivities(t6, t7, t8, t9, class6a, class7a, class8a, class9a);

        log.info("Phase 2 Data Seeding Complete!");
    }

    private void seedActivitiesIfMissing() {
        if (activityRepository.count() == 0) {
            log.info("Seeding initial Phase 2 Activities...");
            Teacher t6 = teacherRepository.findByUserAccountUsername("teacher_6a").orElse(null);
            Teacher t7 = teacherRepository.findByUserAccountUsername("teacher_7a").orElse(null);
            Teacher t8 = teacherRepository.findByUserAccountUsername("teacher_8a").orElse(null);
            Teacher t9 = teacherRepository.findByUserAccountUsername("teacher_9a").orElse(null);

            Classroom c6 = classroomRepository.findByName("6-A").orElse(null);
            Classroom c7 = classroomRepository.findByName("7-A").orElse(null);
            Classroom c8 = classroomRepository.findByName("8-A").orElse(null);
            Classroom c9 = classroomRepository.findByName("9-A").orElse(null);

            seedDemoActivities(t6, t7, t8, t9, c6, c7, c8, c9);
        }
    }

    private void seedDemoActivities(Teacher t6, Teacher t7, Teacher t8, Teacher t9, Classroom c6, Classroom c7, Classroom c8, Classroom c9) {
        // Grade 6 Mathematics
        createActivity("Fractions Basics", "Introduction to proper, improper, and mixed fractions.", Subject.MATHEMATICS, ActivityType.LESSON, ActivityStatus.PUBLISHED, t6 != null ? t6.getId() : null, c6 != null ? c6.getId() : null);
        createActivity("Fractions Quiz", "Test your knowledge on fraction operations and simplification.", Subject.MATHEMATICS, ActivityType.QUIZ, ActivityStatus.PUBLISHED, t6 != null ? t6.getId() : null, c6 != null ? c6.getId() : null);

        // Grade 6 Science
        createActivity("Living Things Around Us", "Explore habitats, adaptation, and characteristics of living organisms.", Subject.SCIENCE, ActivityType.LESSON, ActivityStatus.PUBLISHED, t6 != null ? t6.getId() : null, c6 != null ? c6.getId() : null);
        createActivity("Plants and Animals Quiz", "Assessment on plant structures and animal classifications.", Subject.SCIENCE, ActivityType.QUIZ, ActivityStatus.PUBLISHED, t6 != null ? t6.getId() : null, c6 != null ? c6.getId() : null);

        // Grade 7 Mathematics
        createActivity("Integers Introduction", "Understanding positive and negative numbers on a number line.", Subject.MATHEMATICS, ActivityType.LESSON, ActivityStatus.PUBLISHED, t7 != null ? t7.getId() : null, c7 != null ? c7.getId() : null);
        createActivity("Integers Quiz", "Practice addition and subtraction rules of integers.", Subject.MATHEMATICS, ActivityType.QUIZ, ActivityStatus.PUBLISHED, t7 != null ? t7.getId() : null, c7 != null ? c7.getId() : null);

        // Grade 8 Science
        createActivity("Force and Pressure", "Concepts of push, pull, atmospheric pressure, and friction.", Subject.SCIENCE, ActivityType.LESSON, ActivityStatus.PUBLISHED, t8 != null ? t8.getId() : null, c8 != null ? c8.getId() : null);
        createActivity("Force Assessment Quiz", "Quiz on calculating pressure and identifying friction types.", Subject.SCIENCE, ActivityType.QUIZ, ActivityStatus.PUBLISHED, t8 != null ? t8.getId() : null, c8 != null ? c8.getId() : null);

        // Grade 9 Science
        createActivity("Motion and Speed", "Understanding displacement, velocity, and acceleration equations.", Subject.SCIENCE, ActivityType.LESSON, ActivityStatus.PUBLISHED, t9 != null ? t9.getId() : null, c9 != null ? c9.getId() : null);
        createActivity("Motion Quiz", "Solve problems on speed, distance-time graphs, and uniform motion.", Subject.SCIENCE, ActivityType.QUIZ, ActivityStatus.PUBLISHED, t9 != null ? t9.getId() : null, c9 != null ? c9.getId() : null);
    }

    private void createActivity(String title, String description, Subject subject, ActivityType type, ActivityStatus status, Long teacherId, Long classroomId) {
        activityRepository.save(Activity.builder()
                .title(title)
                .description(description)
                .subject(subject)
                .activityType(type)
                .status(status)
                .createdByTeacherId(teacherId)
                .assignedClassroomId(classroomId)
                .build());
    }

    private Teacher createTeacherAccount(String username, String rawPassword, String fullName, Classroom classroom) {
        UserAccount teacherUser = userAccountRepository.save(UserAccount.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(fullName)
                .role(Role.TEACHER)
                .build());

        return teacherRepository.save(Teacher.builder()
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
