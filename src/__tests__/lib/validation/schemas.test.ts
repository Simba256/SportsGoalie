import { describe, it, expect } from 'vitest';
import {
  userSchema,
  createUserSchema,
  sportSchema,
  createSportSchema,
  skillSchema,
  quizSchema,
  quizQuestionSchema,
  quizAttemptSchema,
  loginFormSchema,
  registerFormSchema,
  validateWithSchema,
  userRoleSchema,
  difficultyLevelSchema,
  questionTypeSchema,
} from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('Basic Type Schemas', () => {
    describe('userRoleSchema', () => {
      it('should validate valid user roles', () => {
        expect(userRoleSchema.parse('student')).toBe('student');
        expect(userRoleSchema.parse('admin')).toBe('admin');
      });

      it('should reject invalid user roles', () => {
        expect(() => userRoleSchema.parse('invalid')).toThrow();
        expect(() => userRoleSchema.parse('teacher')).toThrow();
        expect(() => userRoleSchema.parse('')).toThrow();
      });
    });

    describe('difficultyLevelSchema', () => {
      it('should validate valid difficulty levels', () => {
        expect(difficultyLevelSchema.parse('introduction')).toBe('introduction');
        expect(difficultyLevelSchema.parse('development')).toBe('development');
        expect(difficultyLevelSchema.parse('refinement')).toBe('refinement');
      });

      it('should reject invalid difficulty levels', () => {
        expect(() => difficultyLevelSchema.parse('beginner')).toThrow();
        expect(() => difficultyLevelSchema.parse('advanced')).toThrow();
        expect(() => difficultyLevelSchema.parse('')).toThrow();
      });
    });

    describe('questionTypeSchema', () => {
      it('should validate valid question types', () => {
        expect(questionTypeSchema.parse('multiple_choice')).toBe('multiple_choice');
        expect(questionTypeSchema.parse('true_false')).toBe('true_false');
        expect(questionTypeSchema.parse('descriptive')).toBe('descriptive');
        expect(questionTypeSchema.parse('image_choice')).toBe('image_choice');
      });

      it('should reject invalid question types', () => {
        expect(() => questionTypeSchema.parse('essay')).toThrow();
        expect(() => questionTypeSchema.parse('fill_blank')).toThrow();
      });
    });
  });

  describe('User Schemas', () => {
    describe('userSchema', () => {
      const validUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'student',
        emailVerified: true,
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: {
            progress: true,
            quizResults: true,
            newContent: true,
            reminders: true,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it('should validate a complete valid user', () => {
        const result = userSchema.parse(validUser);
        expect(result).toEqual(validUser);
      });

      it('should validate user with optional fields', () => {
        const userWithOptionals = {
          ...validUser,
          profileImage: 'https://example.com/avatar.jpg',
          lastLoginAt: new Date(),
          profile: {
            firstName: 'Test',
            lastName: 'User',
            experienceLevel: 'introduction',
            sportsInterests: ['basketball'],
            goals: ['improve fitness'],
          },
        };

        const result = userSchema.parse(userWithOptionals);
        expect(result).toEqual(userWithOptionals);
      });

      it('should reject invalid email format', () => {
        const invalidUser = { ...validUser, email: 'invalid-email' };
        expect(() => userSchema.parse(invalidUser)).toThrow();
      });

      it('should reject invalid role', () => {
        const invalidUser = { ...validUser, role: 'teacher' };
        expect(() => userSchema.parse(invalidUser)).toThrow();
      });

      it('should require all mandatory fields', () => {
        const { email, ...incompleteUser } = validUser;
        expect(() => userSchema.parse(incompleteUser)).toThrow();
      });
    });

    describe('createUserSchema', () => {
      it('should validate user creation data without system fields', () => {
        const createData = {
          email: 'new@example.com',
          displayName: 'New User',
          role: 'student',
          emailVerified: true,
          preferences: {
            notifications: true,
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            emailNotifications: {
              progress: true,
              quizResults: true,
              newContent: true,
              reminders: true,
            },
          },
        };

        const result = createUserSchema.parse(createData);
        expect(result).toEqual(createData);
      });
    });
  });

  describe('Sport Schemas', () => {
    describe('sportSchema', () => {
      const validSport = {
        id: 'sport-123',
        name: 'Basketball',
        description: 'A popular team sport',
        icon: '🏀',
        color: '#FF8C00',
        category: 'Team Sports',
        difficulty: 'introduction',
        estimatedTimeToComplete: 40,
        skillsCount: 5,
        tags: ['team', 'indoor'],
        isActive: true,
        isFeatured: false,
        order: 1,
        metadata: {
          totalEnrollments: 100,
          totalCompletions: 50,
          averageRating: 4.5,
          totalRatings: 25,
          averageCompletionTime: 35,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin-123',
      };

      it('should validate a complete valid sport', () => {
        const result = sportSchema.parse(validSport);
        expect(result).toEqual(validSport);
      });

      it('should validate sport with optional fields', () => {
        const sportWithOptionals = {
          ...validSport,
          imageUrl: 'https://example.com/basketball.jpg',
          prerequisites: ['sport-101'],
        };

        const result = sportSchema.parse(sportWithOptionals);
        expect(result).toEqual(sportWithOptionals);
      });

      it('should reject invalid color format', () => {
        const invalidSport = { ...validSport, color: 'orange' };
        expect(() => sportSchema.parse(invalidSport)).toThrow();
      });

      it('should reject negative estimated time', () => {
        const invalidSport = { ...validSport, estimatedTimeToComplete: -5 };
        expect(() => sportSchema.parse(invalidSport)).toThrow();
      });

      it('should reject invalid difficulty level', () => {
        const invalidSport = { ...validSport, difficulty: 'expert' };
        expect(() => sportSchema.parse(invalidSport)).toThrow();
      });
    });

    describe('createSportSchema', () => {
      it('should validate sport creation data', () => {
        const createData = {
          name: 'Tennis',
          description: 'Individual racket sport',
          icon: '🎾',
          color: '#FFD700',
          category: 'Individual Sports',
          difficulty: 'development',
          estimatedTimeToComplete: 30,
          tags: ['individual', 'outdoor'],
          isActive: true,
          isFeatured: true,
          order: 2,
          createdBy: 'admin-123',
        };

        const result = createSportSchema.parse(createData);
        expect(result).toEqual(createData);
      });
    });
  });

  describe('Skill Schemas', () => {
    describe('skillSchema', () => {
      const validSkill = {
        id: 'skill-123',
        sportId: 'sport-123',
        name: 'Dribbling',
        description: 'Basic ball handling skill',
        difficulty: 'introduction',
        estimatedTimeToComplete: 30,
        externalResources: [
          {
            id: 'resource-1',
            title: 'Dribbling Guide',
            url: 'https://example.com/guide',
            type: 'website',
          },
        ],
        prerequisites: [],
        learningObjectives: ['Master basic dribbling'],
        tags: ['fundamental'],
        hasVideo: true,
        hasQuiz: true,
        isActive: true,
        order: 1,
        metadata: {
          totalCompletions: 50,
          averageCompletionTime: 25,
          averageRating: 4.0,
          totalRatings: 10,
          difficulty: 'introduction',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin-123',
      };

      it('should validate a complete valid skill', () => {
        const result = skillSchema.parse(validSkill);
        expect(result).toEqual(validSkill);
      });

      it('should validate skill with media', () => {
        const skillWithMedia = {
          ...validSkill,
          content: '<p>Skill content</p>',
          media: {
            text: 'Watch this video',
            images: [
              {
                id: 'img-1',
                url: 'https://example.com/image.jpg',
                alt: 'Dribbling technique',
                order: 1,
              },
            ],
            videos: [
              {
                id: 'vid-1',
                youtubeId: 'dQw4w9WgXcQ',
                title: 'Dribbling Tutorial',
                duration: 300,
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg',
                order: 1,
              },
            ],
          },
        };

        const result = skillSchema.parse(skillWithMedia);
        expect(result).toEqual(skillWithMedia);
      });

      it('should reject invalid external resource URL', () => {
        const invalidSkill = {
          ...validSkill,
          externalResources: [
            {
              id: 'resource-1',
              title: 'Guide',
              url: 'not-a-url',
              type: 'website',
            },
          ],
        };
        expect(() => skillSchema.parse(invalidSkill)).toThrow();
      });

      it('should reject empty learning objectives', () => {
        const invalidSkill = {
          ...validSkill,
          learningObjectives: [''],
        };
        expect(() => skillSchema.parse(invalidSkill)).toThrow();
      });
    });
  });

  describe('Quiz Schemas', () => {
    describe('quizSchema', () => {
      const validQuiz = {
        id: 'quiz-123',
        skillId: 'skill-123',
        sportId: 'sport-123',
        title: 'Dribbling Quiz',
        description: 'Test your dribbling knowledge',
        difficulty: 'introduction',
        timeLimit: 10,
        passingScore: 70,
        maxAttempts: 3,
        allowReview: true,
        shuffleQuestions: false,
        showAnswersAfterCompletion: true,
        isActive: true,
        metadata: {
          totalAttempts: 100,
          totalCompletions: 80,
          averageScore: 75,
          averageTimeSpent: 8,
          passRate: 80,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin-123',
      };

      it('should validate a complete valid quiz', () => {
        const result = quizSchema.parse(validQuiz);
        expect(result).toEqual(validQuiz);
      });

      it('should reject invalid passing score range', () => {
        const invalidQuiz = { ...validQuiz, passingScore: 150 };
        expect(() => quizSchema.parse(invalidQuiz)).toThrow();
      });

      it('should reject negative time limit', () => {
        const invalidQuiz = { ...validQuiz, timeLimit: -5 };
        expect(() => quizSchema.parse(invalidQuiz)).toThrow();
      });

      it('should reject negative max attempts', () => {
        const invalidQuiz = { ...validQuiz, maxAttempts: 0 };
        expect(() => quizSchema.parse(invalidQuiz)).toThrow();
      });
    });

    describe('quizQuestionSchema', () => {
      const validQuestion = {
        id: 'question-123',
        quizId: 'quiz-123',
        type: 'multiple_choice',
        question: 'What is the correct dribbling technique?',
        options: ['Use palm', 'Use fingertips', 'Use knuckles'],
        correctAnswer: 'Use fingertips',
        explanation: 'Fingertips provide better control',
        points: 10,
        order: 1,
        difficulty: 'introduction',
        tags: ['technique'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it('should validate a complete valid question', () => {
        const result = quizQuestionSchema.parse(validQuestion);
        expect(result).toEqual(validQuestion);
      });

      it('should validate question with media', () => {
        const questionWithMedia = {
          ...validQuestion,
          media: {
            type: 'image',
            url: 'https://example.com/technique.jpg',
            caption: 'Proper dribbling form',
            alt: 'Player dribbling correctly',
          },
        };

        const result = quizQuestionSchema.parse(questionWithMedia);
        expect(result).toEqual(questionWithMedia);
      });

      it('should reject invalid question type', () => {
        const invalidQuestion = { ...validQuestion, type: 'essay' };
        expect(() => quizQuestionSchema.parse(invalidQuestion)).toThrow();
      });

      it('should reject negative points', () => {
        const invalidQuestion = { ...validQuestion, points: -5 };
        expect(() => quizQuestionSchema.parse(invalidQuestion)).toThrow();
      });
    });

    describe('quizAttemptSchema', () => {
      const validAttempt = {
        id: 'attempt-123',
        userId: 'user-123',
        quizId: 'quiz-123',
        skillId: 'skill-123',
        sportId: 'sport-123',
        answers: [
          {
            questionId: 'question-1',
            answer: 'Use fingertips',
            isCorrect: true,
            timeSpent: 15,
            skipped: false,
          },
        ],
        score: 10,
        maxScore: 10,
        percentage: 100,
        passed: true,
        timeSpent: 5,
        attemptNumber: 1,
        isCompleted: true,
        startedAt: new Date(),
        completedAt: new Date(),
        submittedAt: new Date(),
      };

      it('should validate a complete valid attempt', () => {
        const result = quizAttemptSchema.parse(validAttempt);
        expect(result).toEqual(validAttempt);
      });

      it('should reject invalid percentage range', () => {
        const invalidAttempt = { ...validAttempt, percentage: 150 };
        expect(() => quizAttemptSchema.parse(invalidAttempt)).toThrow();
      });

      it('should reject negative time spent', () => {
        const invalidAttempt = { ...validAttempt, timeSpent: -5 };
        expect(() => quizAttemptSchema.parse(invalidAttempt)).toThrow();
      });

      it('should reject invalid attempt number', () => {
        const invalidAttempt = { ...validAttempt, attemptNumber: 0 };
        expect(() => quizAttemptSchema.parse(invalidAttempt)).toThrow();
      });
    });
  });

  describe('Form Schemas', () => {
    describe('loginFormSchema', () => {
      it('should validate valid login form', () => {
        const loginData = {
          email: 'user@example.com',
          password: 'password123',
          rememberMe: true,
        };

        const result = loginFormSchema.parse(loginData);
        expect(result).toEqual(loginData);
      });

      it('should validate without optional rememberMe', () => {
        const loginData = {
          email: 'user@example.com',
          password: 'password123',
        };

        const result = loginFormSchema.parse(loginData);
        expect(result).toEqual(loginData);
      });

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'password123',
        };
        expect(() => loginFormSchema.parse(invalidData)).toThrow();
      });

      it('should reject short password', () => {
        const invalidData = {
          email: 'user@example.com',
          password: '123',
        };
        expect(() => loginFormSchema.parse(invalidData)).toThrow();
      });
    });

    describe('registerFormSchema', () => {
      it('should validate valid registration form', () => {
        const registerData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          role: 'student',
          agreeToTerms: true,
          agreeToPrivacy: true,
        };

        const result = registerFormSchema.parse(registerData);
        expect(result).toEqual(registerData);
      });

      it('should reject mismatched passwords', () => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123',
          confirmPassword: 'DifferentPassword',
          role: 'student',
          agreeToTerms: true,
          agreeToPrivacy: true,
        };
        expect(() => registerFormSchema.parse(invalidData)).toThrow();
      });

      it('should reject weak password', () => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'weakpassword',
          confirmPassword: 'weakpassword',
          role: 'student',
          agreeToTerms: true,
          agreeToPrivacy: true,
        };
        expect(() => registerFormSchema.parse(invalidData)).toThrow();
      });

      it('should reject without agreeing to terms', () => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          role: 'student',
          agreeToTerms: false,
          agreeToPrivacy: true,
        };
        expect(() => registerFormSchema.parse(invalidData)).toThrow();
      });

      it('should reject without agreeing to privacy', () => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          role: 'student',
          agreeToTerms: true,
          agreeToPrivacy: false,
        };
        expect(() => registerFormSchema.parse(invalidData)).toThrow();
      });
    });
  });

  describe('validateWithSchema helper', () => {
    it('should return success result for valid data', () => {
      const validEmail = 'test@example.com';
      const emailSchema = userSchema.pick({ email: true }).shape.email;

      const result = validateWithSchema(emailSchema, validEmail);

      expect(result.success).toBe(true);
      expect(result.data).toBe(validEmail);
      expect(result.errors).toBeUndefined();
    });

    it('should return error result for invalid data', () => {
      const invalidEmail = 'invalid-email';
      const emailSchema = userSchema.pick({ email: true }).shape.email;

      const result = validateWithSchema(emailSchema, invalidEmail);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]).toMatchObject({
        field: '',
        message: expect.stringContaining('email'),
        code: expect.any(String),
      });
    });

    it('should handle complex validation errors', () => {
      const invalidUser = {
        email: 'invalid-email',
        displayName: '', // Empty required field
        role: 'invalid-role',
      };

      const result = validateWithSchema(userSchema, invalidUser);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(1);
    });

    it('should handle non-Zod errors gracefully', () => {
      const throwingSchema = {
        parse: () => {
          throw new Error('Unexpected error');
        },
      };

      const result = validateWithSchema(throwingSchema as any, 'test');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].field).toBe('unknown');
    });
  });
});