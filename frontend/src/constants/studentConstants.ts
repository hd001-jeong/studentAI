import type {
  AchievementItem,
  MemorizationAchievement,
} from "../types/student";

export const EMPTY_ACHIEVEMENT_ITEM: AchievementItem = {
  name: "",
  achievement: null,
};

export const ACHIEVEMENT_GOOD_MIN_SCORE = 80;
export const ACHIEVEMENT_DANGER_MAX_SCORE = 30;

export const TEACHER_COMMENT_MAX_LENGTH = 40;

export const MEMORIZATION_OPTIONS: Array<{
  label: Exclude<MemorizationAchievement, null>;
  value: Exclude<MemorizationAchievement, null>;
}> = [
  {
    label: "통과",
    value: "통과",
  },
  {
    label: "보충 필요",
    value: "보충 필요",
  },
  {
    label: "결석",
    value: "결석",
  },
];

export const ACHIEVEMENT_COLORS = {
  empty: "#bfbfbf",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
} as const;

export const ACHIEVEMENT_BACKGROUNDS = {
  empty: "#f5f5f5",
  success: "#f6ffed",
  warning: "#fffbe6",
  error: "#fff2f0",
} as const;
