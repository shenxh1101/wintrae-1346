import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CourseCategory, Difficulty } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split("T")[0]) {
    return "今天";
  }
  if (dateStr === yesterday.toISOString().split("T")[0]) {
    return "昨天";
  }

  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function getCategoryName(category: CourseCategory): string {
  const names: Record<CourseCategory, string> = {
    stretch: "拉伸",
    fatburn: "燃脂",
    strength: "力量",
    neck: "肩颈放松",
  };
  return names[category] || category;
}

export function getDifficultyName(difficulty: Difficulty): string {
  const names: Record<Difficulty, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难",
  };
  return names[difficulty] || difficulty;
}

export function getDifficultyColor(difficulty: Difficulty): string {
  const colors: Record<Difficulty, string> = {
    easy: "bg-mint-green/20 text-mint-green",
    medium: "bg-soft-yellow/20 text-soft-yellow",
    hard: "bg-vibrant-orange/20 text-vibrant-orange",
  };
  return colors[difficulty] || "";
}

export function getCategoryColor(category: CourseCategory): string {
  const colors: Record<CourseCategory, string> = {
    stretch: "from-mint-green to-teal-400",
    fatburn: "from-vibrant-orange to-red-400",
    strength: "from-soft-yellow to-amber-400",
    neck: "from-purple-400 to-pink-400",
  };
  return colors[category] || "";
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}
