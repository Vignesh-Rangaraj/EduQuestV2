package com.eduquest.config;

import com.eduquest.domain.*;
import com.eduquest.domain.Module;
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
    private final ModuleRepository moduleRepository;
    private final ActivityRepository activityRepository;
    private final LessonContentRepository lessonContentRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final GameConfigurationRepository gameConfigRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            SchoolRepository schoolRepository,
            ClassroomRepository classroomRepository,
            UserAccountRepository userAccountRepository,
            TeacherRepository teacherRepository,
            ParentRepository parentRepository,
            StudentRepository studentRepository,
            ModuleRepository moduleRepository,
            ActivityRepository activityRepository,
            LessonContentRepository lessonContentRepository,
            QuizQuestionRepository quizQuestionRepository,
            GameConfigurationRepository gameConfigRepository,
            PasswordEncoder passwordEncoder) {
        this.schoolRepository = schoolRepository;
        this.classroomRepository = classroomRepository;
        this.userAccountRepository = userAccountRepository;
        this.teacherRepository = teacherRepository;
        this.parentRepository = parentRepository;
        this.studentRepository = studentRepository;
        this.moduleRepository = moduleRepository;
        this.activityRepository = activityRepository;
        this.lessonContentRepository = lessonContentRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.gameConfigRepository = gameConfigRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (schoolRepository.count() > 0) {
            log.info("Database already seeded. Checking Phase 3 modules seeding...");
            seedPhase3ModulesIfMissing();
            return;
        }

        log.info("Seeding Phase 1, 2 & 3 Data (Grades 6–9)...");

        // 1. Create School
        School school = schoolRepository.save(School.builder()
                .name("EduQuest Demo School")
                .code("EQ-DEMO-01")
                .build());

        // 2. Create Classrooms (6-A, 7-A, 8-A, 9-A)
        Classroom class6a = classroomRepository.save(Classroom.builder().grade(6).section("A").name("6-A").school(school).build());
        Classroom class7a = classroomRepository.save(Classroom.builder().grade(7).section("A").name("7-A").school(school).build());
        Classroom class8a = classroomRepository.save(Classroom.builder().grade(8).section("A").name("8-A").school(school).build());
        Classroom class9a = classroomRepository.save(Classroom.builder().grade(9).section("A").name("9-A").school(school).build());

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

        // 5. Seed Students & Parents
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

        // 6. Seed Modules & Content
        seedPhase3Modules(t6, t7, t8, t9, class6a, class7a, class8a, class9a);

        log.info("Phase 3 Data Seeding Complete!");
    }

    private void seedPhase3ModulesIfMissing() {
        if (moduleRepository.count() == 0) {
            log.info("Seeding initial Phase 3 Modules & Activities...");
            Teacher t6 = teacherRepository.findByUserAccountUsername("teacher_6a").orElse(null);
            Teacher t7 = teacherRepository.findByUserAccountUsername("teacher_7a").orElse(null);
            Teacher t8 = teacherRepository.findByUserAccountUsername("teacher_8a").orElse(null);
            Teacher t9 = teacherRepository.findByUserAccountUsername("teacher_9a").orElse(null);

            Classroom c6 = classroomRepository.findByName("6-A").orElse(null);
            Classroom c7 = classroomRepository.findByName("7-A").orElse(null);
            Classroom c8 = classroomRepository.findByName("8-A").orElse(null);
            Classroom c9 = classroomRepository.findByName("9-A").orElse(null);

            seedPhase3Modules(t6, t7, t8, t9, c6, c7, c8, c9);
        }
    }

    private void seedPhase3Modules(Teacher t6, Teacher t7, Teacher t8, Teacher t9, Classroom c6, Classroom c7, Classroom c8, Classroom c9) {
        // Module 1: Fractions Module (Grade 6 Math)
        Module mFractions = moduleRepository.save(Module.builder()
                .title("Fractions & Decimals")
                .description("Master the basics of proper fractions, mixed numbers, and decimal operations.")
                .subject(Subject.MATHEMATICS)
                .difficultyLevel(DifficultyLevel.BEGINNER)
                .estimatedMinutes(45)
                .classroomId(c6 != null ? c6.getId() : null)
                .status(ActivityStatus.PUBLISHED)
                .createdByTeacherId(t6 != null ? t6.getId() : null)
                .build());

        Activity a1 = createActivity("Fractions Basics Lesson", "Introduction to proper, improper, and mixed fractions.", Subject.MATHEMATICS, ActivityType.LESSON, mFractions.getId(), 1, null, 10, t6, c6);
        seedLessonContent(a1.getId(), "### What is a Fraction?\nA fraction represents a part of a whole. It consists of a **numerator** (top) and a **denominator** (bottom).\n\n- **Proper Fraction**: Numerator < Denominator (e.g. 3/4)\n- **Improper Fraction**: Numerator >= Denominator (e.g. 5/3)\n- **Mixed Number**: Whole number + Proper fraction (e.g. 1 2/3)");

        Activity a2 = createActivity("Fractions Quiz", "Test your knowledge on fraction operations.", Subject.MATHEMATICS, ActivityType.QUIZ, mFractions.getId(), 2, a1.getId(), 20, t6, c6);
        seedQuizQuestion(a2.getId(), "Which of the following is a proper fraction?", "5/3", "3/4", "7/2", "4/3", "B", "In a proper fraction, the numerator is strictly smaller than the denominator.", 1);
        seedQuizQuestion(a2.getId(), "What is 1/2 + 1/4?", "2/4", "3/4", "1/4", "2/2", "B", "1/2 converts to 2/4. 2/4 + 1/4 = 3/4.", 2);

        Activity a3 = createActivity("Match Fractions Game", "Interactive matching exercise.", Subject.MATHEMATICS, ActivityType.MATCH_THE_FOLLOWING, mFractions.getId(), 3, a2.getId(), 25, t6, c6);
        seedGameConfig(a3.getId(), "{\"type\":\"MATCH_THE_FOLLOWING\",\"pairs\":[{\"left\":\"1/2\",\"right\":\"0.5\"},{\"left\":\"1/4\",\"right\":\"0.25\"},{\"left\":\"3/4\",\"right\":\"0.75\"}]}");

        // Module 2: Living Things (Grade 6 Science)
        Module mLiving = moduleRepository.save(Module.builder()
                .title("Living Things & Habitats")
                .description("Explore living organisms, ecosystems, and adaptation mechanisms.")
                .subject(Subject.SCIENCE)
                .difficultyLevel(DifficultyLevel.BEGINNER)
                .estimatedMinutes(40)
                .classroomId(c6 != null ? c6.getId() : null)
                .status(ActivityStatus.PUBLISHED)
                .createdByTeacherId(t6 != null ? t6.getId() : null)
                .build());

        Activity a4 = createActivity("Living Things Overview", "Characteristics of living vs non-living things.", Subject.SCIENCE, ActivityType.LESSON, mLiving.getId(), 1, null, 10, t6, c6);
        seedLessonContent(a4.getId(), "### Characteristics of Living Organisms\n\n1. **Nutrition**: Living things require food for energy.\n2. **Respiration**: Release of energy from food.\n3. **Growth**: Permanent increase in size and cell count.\n4. **Excretion**: Removal of metabolic waste.");

        Activity a5 = createActivity("Plants & Animals Quiz", "Assessment on habitats and adaptations.", Subject.SCIENCE, ActivityType.QUIZ, mLiving.getId(), 2, a4.getId(), 20, t6, c6);
        seedQuizQuestion(a5.getId(), "Which organ helps fish breathe underwater?", "Lungs", "Skin", "Gills", "Fins", "C", "Fish absorb dissolved oxygen through gills.", 1);

        // Module 3: Integers (Grade 7 Math)
        Module mIntegers = moduleRepository.save(Module.builder()
                .title("Integers & Number Line")
                .description("Understanding negative numbers, absolute values, and arithmetic rules.")
                .subject(Subject.MATHEMATICS)
                .difficultyLevel(DifficultyLevel.INTERMEDIATE)
                .estimatedMinutes(50)
                .classroomId(c7 != null ? c7.getId() : null)
                .status(ActivityStatus.PUBLISHED)
                .createdByTeacherId(t7 != null ? t7.getId() : null)
                .build());

        Activity a6 = createActivity("Integers Introduction", "Understanding numbers below zero on a number line.", Subject.MATHEMATICS, ActivityType.LESSON, mIntegers.getId(), 1, null, 10, t7, c7);
        seedLessonContent(a6.getId(), "### What are Integers?\nIntegers are whole numbers including positive numbers, zero, and negative numbers.\n\n- Example: ... -3, -2, -1, 0, 1, 2, 3 ...");

        Activity a7 = createActivity("Integers Quiz", "Practice integer addition and subtraction.", Subject.MATHEMATICS, ActivityType.QUIZ, mIntegers.getId(), 2, a6.getId(), 20, t7, c7);
        seedQuizQuestion(a7.getId(), "What is (-5) + 8?", "-3", "3", "13", "-13", "B", "8 minus 5 equals 3.", 1);
    }

    private Activity createActivity(String title, String description, Subject subject, ActivityType type, Long moduleId, int displayOrder, Long prereqId, int xp, Teacher teacher, Classroom classroom) {
        return activityRepository.save(Activity.builder()
                .title(title)
                .description(description)
                .subject(subject)
                .activityType(type)
                .status(ActivityStatus.PUBLISHED)
                .moduleId(moduleId)
                .displayOrder(displayOrder)
                .prerequisiteActivityId(prereqId)
                .xpReward(xp)
                .visibleToStudents(true)
                .createdByTeacherId(teacher != null ? teacher.getId() : null)
                .assignedClassroomId(classroom != null ? classroom.getId() : null)
                .build());
    }

    private void seedLessonContent(Long activityId, String content) {
        lessonContentRepository.save(LessonContent.builder()
                .activityId(activityId)
                .content(content)
                .estimatedMinutes(15)
                .build());
    }

    private void seedQuizQuestion(Long activityId, String qText, String optA, String optB, String optC, String optD, String correct, String explanation, int order) {
        quizQuestionRepository.save(QuizQuestion.builder()
                .activityId(activityId)
                .questionText(qText)
                .optionA(optA)
                .optionB(optB)
                .optionC(optC)
                .optionD(optD)
                .correctAnswer(correct)
                .explanation(explanation)
                .displayOrder(order)
                .build());
    }

    private void seedGameConfig(Long activityId, String jsonConfig) {
        gameConfigRepository.save(GameConfiguration.builder()
                .activityId(activityId)
                .jsonConfiguration(jsonConfig)
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
                    .xp(0)
                    .level(1)
                    .build());
        }
    }
}
