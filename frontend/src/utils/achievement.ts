import {
  ACHIEVEMENT_BACKGROUNDS,
  ACHIEVEMENT_COLORS,
  ACHIEVEMENT_DANGER_MAX_SCORE,
  ACHIEVEMENT_GOOD_MIN_SCORE,
} from "@/constants/studentConstants";

import type {
  MemorizationAchievement,
  OverallSummary,
  LessonRecord,
} from "@/types/lessonRecord";

export type AchievementTagColor = "default" | "success" | "warning" | "error";

export function getAchievementColor(score: number | null): string {
  if (score === null) {
    return ACHIEVEMENT_COLORS.empty;
  }

  if (score >= ACHIEVEMENT_GOOD_MIN_SCORE) {
    return ACHIEVEMENT_COLORS.success;
  }

  if (score <= ACHIEVEMENT_DANGER_MAX_SCORE) {
    return ACHIEVEMENT_COLORS.error;
  }

  return ACHIEVEMENT_COLORS.warning;
}

export function getAchievementBackground(score: number | null): string {
  if (score === null) {
    return ACHIEVEMENT_BACKGROUNDS.empty;
  }

  if (score >= ACHIEVEMENT_GOOD_MIN_SCORE) {
    return ACHIEVEMENT_BACKGROUNDS.success;
  }

  if (score <= ACHIEVEMENT_DANGER_MAX_SCORE) {
    return ACHIEVEMENT_BACKGROUNDS.error;
  }

  return ACHIEVEMENT_BACKGROUNDS.warning;
}

export function getAchievementTagColor(
  score: number | null,
): AchievementTagColor {
  if (score === null) {
    return "default";
  }

  if (score >= ACHIEVEMENT_GOOD_MIN_SCORE) {
    return "success";
  }

  if (score <= ACHIEVEMENT_DANGER_MAX_SCORE) {
    return "error";
  }

  return "warning";
}

export function getAchievementLabel(score: number | null): string {
  if (score === null) {
    return "";
  }

  if (score >= ACHIEVEMENT_GOOD_MIN_SCORE) {
    return "우수";
  }

  if (score <= ACHIEVEMENT_DANGER_MAX_SCORE) {
    return "보완 필요";
  }

  return "주의";
}

export function getMemorizationTagColor(
  value: MemorizationAchievement,
): AchievementTagColor {
  if (value === "통과") {
    return "success";
  }

  if (value === "보충 필요") {
    return "warning";
  }

  if (value === "결석") {
    return "error";
  }

  return "default";
}

export function calculateAverage(values: Array<number | null>): number | null {
  const validValues = values.filter((value): value is number => value !== null);

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce((sum, value) => sum + value, 0);

  return Math.round(total / validValues.length);
}

export function calculateReviewScore(
  questionCount: number | null,
  correctCount: number | null,
): number | null {
  if (questionCount === null || correctCount === null || questionCount <= 0) {
    return null;
  }

  return Math.round((correctCount / questionCount) * 100);
}

export function calculateOverallSummary(
  records: LessonRecord[],
): OverallSummary {
  const homeworkAverage = calculateAverage(
    records.flatMap((record) =>
      record.homeworks.map((homework) => homework.achievement),
    ),
  );

  const dailyAverage = calculateAverage(
    records.flatMap((record) =>
      record.dailyEvaluations.map((evaluation) => evaluation.achievement),
    ),
  );

  const reviewAverage = calculateAverage(
    records.map((record) => record.reviewTestScore),
  );

  return {
    homeworkAverage,
    dailyAverage,
    reviewAverage,
  };
}
