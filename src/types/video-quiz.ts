import { Timestamp } from 'firebase/firestore';
import { Question, QuestionType, DifficultyLevel } from './quiz';

/**
 * Video-based quiz question with timestamp
 * Extends the base Question type with video-specific properties
 */
export interface VideoQuizQuestion extends Question {
  timestamp: number; // seconds into video where question appears
  pauseDuration?: number; // optional auto-advance after X seconds
  allowVideoControl?: boolean; // can student rewind to see content again?
}

/**
 * Video quiz specific settings
 */
export interface VideoQuizSettings {
  allowPlaybackSpeedChange: boolean;
  playbackSpeeds: number[]; // e.g., [0.5, 0.75, 1, 1.25, 1.5, 2]
  allowRewind: boolean;
  allowSkipAhead: boolean; // can skip past unanswered questions
  requireSequentialAnswers: boolean; // must answer questions in order
  showProgressBar: boolean;
  autoPlayNext: boolean; // after completing quiz
  passingScore: number; // percentage (0-100)
  maxAttempts: number;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
}

/**
 * Complete video quiz structure
 */
export interface VideoQuiz {
  id: string;
  title: string;
  description?: string;
  sportId: string; // MANDATORY - Every quiz must have a sport
  skillId: string; // MANDATORY - Every quiz must have a skill
  videoUrl: string; // Firebase Storage URL or external URL
  videoDuration: number; // total video length in seconds
  thumbnail?: string; // video thumbnail/poster image
  coverImage?: string; // quiz cover image
  instructions?: string;
  questions: VideoQuizQuestion[];
  settings: VideoQuizSettings;
  difficulty: DifficultyLevel;
  estimatedDuration: number; // estimated time to complete in minutes
  tags: string[];
  isActive: boolean;
  isPublished: boolean;
  category: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  metadata: VideoQuizMetadata;
}

/**
 * Video quiz metadata for analytics
 */
export interface VideoQuizMetadata {
  totalAttempts: number;
  totalCompletions: number;
  averageScore: number;
  averageTimeSpent: number; // in minutes
  averageCompletionTime: number; // time to complete video + questions
  passRate: number; // percentage of students who passed
  dropOffPoints: DropOffPoint[]; // where students abandon the quiz
}

/**
 * Tracks where students abandon quizzes
 */
export interface DropOffPoint {
  timestamp: number; // seconds into video
  count: number; // number of students who dropped off here
}

/**
 * Answer to a video question
 */
export interface VideoQuestionAnswer {
  questionId: string;
  questionType: QuestionType;
  timestamp: number; // when question appeared in video
  answer: string | number | string[]; // supports multiple answer types
  isCorrect: boolean;
  pointsEarned: number;
  timeToAnswer: number; // seconds taken to answer
  attempts?: number; // number of attempts (if retries allowed)
  answeredAt: Timestamp;
}

/**
 * Student progress through video quiz
 */
export interface VideoQuizProgress {
  id: string;
  userId: string;
  videoQuizId: string;
  skillId: string;
  sportId: string;
  currentTime: number; // last watched position in seconds
  questionsAnswered: VideoQuestionAnswer[];
  questionsRemaining: number;
  score: number; // points earned
  maxScore: number; // total points possible
  percentage: number; // score as percentage
  passed: boolean;
  isCompleted: boolean;
  status: 'in-progress' | 'submitted' | 'timed-out' | 'abandoned';
  attemptNumber: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  lastAccessedAt?: Timestamp;
  watchTime: number; // actual time spent watching (excludes pause time)
  totalTimeSpent: number; // total time including pauses
  feedback?: string;
}

/**
 * Question with answered state (for UI)
 */
export interface VideoQuizQuestionWithState extends VideoQuizQuestion {
  answered: boolean;
  userAnswer?: string | number | string[];
  isCorrect?: boolean;
}

/**
 * Video player state
 */
export interface VideoPlayerState {
  playing: boolean;
  playbackRate: number;
  currentTime: number;
  duration: number;
  buffering: boolean;
  muted: boolean;
  volume: number;
}

/**
 * Props for video quiz components
 */
export interface VideoQuizPlayerProps {
  videoUrl: string;
  questions: VideoQuizQuestionWithState[];
  settings: VideoQuizSettings;
  initialTime?: number;
  onQuestionAnswer: (questionId: string, answer: string | string[]) => void;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
}

/**
 * Props for question overlay
 */
export interface QuestionOverlayProps {
  question: VideoQuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string | string[]) => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

/**
 * Video controls props
 */
export interface VideoControlsProps {
  playing: boolean;
  playbackRate: number;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  disabled?: boolean;
}
