export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Insane';

export interface LevelSummary {
  id: number;
  name: string;
  max_score: number;
  difficulty: Difficulty;
}

export interface LevelPlayedRecord {
  id: string;
  user_id: string;
  user_name: string;
  level_id: number;
  level_name: string;
  difficulty: Difficulty;
  score: number;
  attempts: number;
  time_used: number;
  formatted_time?: string;
  top_score?: boolean;
  date: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  total_score: number;
  plays: number;
  best_score: number;
}

export interface PlayerStatsPayload {
  source: 'live' | 'demo';
  generated_at: string;
  totals: {
    plays: number;
    avg_score: number;
    best_score: number;
    time_played_minutes: number;
    completion_rate: number;
    total_attempts: number;
    avg_attempts: number;
  };
  scoreTrend: { date: string; score: number }[];
  levelPerformance: {
    level_id: number;
    level_name: string;
    difficulty: Difficulty;
    avg_score: number;
    max_score: number;
  }[];
  attemptsDistribution: { label: string; count: number }[];
  recentPlays: LevelPlayedRecord[];
  leaderboard: LeaderboardEntry[];
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface AdminStatsPayload {
  source: 'live' | 'demo';
  generated_at: string;
  platform: {
    total_users: number;
    active_7d: number;
    active_30d: number;
    new_users_7d: number;
    companies_active: number;
    total_hours: number;
    avg_score: number;
    retention_w2: number;
  };
  growth: { date: string; signups: number; sessions: number }[];
  funnel: { stage: string; count: number }[];
  companies: {
    company_id: string;
    company_name: string;
    active_users: number;
    total_users: number;
    plays: number;
    avg_score: number;
    hours: number;
  }[];
  learningCurve: { attempt_number: number; avg_score: number; sample_size: number }[];
  levelCompletion: {
    level_id: number;
    level_name: string;
    difficulty: Difficulty;
    started: number;
    completed: number;
    completion_rate: number;
  }[];
  demographics: {
    gender: { label: string; count: number }[];
    ageRanges: { label: string; count: number }[];
  };
  activityHeatmap: { dayLabels: string[]; hourLabels: string[]; values: number[][] };
  topPlayers: LeaderboardEntry[];
}
