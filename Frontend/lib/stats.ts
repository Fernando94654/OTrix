import type {
  AdminStatsPayload,
  Difficulty,
  LeaderboardEntry,
  LevelPlayedRecord,
  LevelSummary,
  PlayerStatsPayload
} from '@/types/stats';

const defaultApiUrl = 'https://otrix-dev.up.railway.app';
// const defaultApiUrl = 'http://localhost:3000';

function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  const baseUrl = configured && configured.length > 0 ? configured : defaultApiUrl;
  return baseUrl.replace(/\/+$/, '');
}

interface FetchOpts {
  forceDemo?: boolean;
  token?: string | null;
}

export type StatsErrorKind = 'auth' | 'server' | 'network';

export class StatsFetchError extends Error {
  constructor(public kind: StatsErrorKind) {
    super(kind);
    this.name = 'StatsFetchError';
  }
}

async function fetchLive<T>(path: string, token: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {
    throw new StatsFetchError('network');
  }
  if (response.status === 401) throw new StatsFetchError('auth');
  if (!response.ok) throw new StatsFetchError('server');
  return (await response.json()) as T;
}

export async function getPlayerStats({ forceDemo = false, token }: FetchOpts = {}): Promise<PlayerStatsPayload> {
  if (forceDemo || !token) return mockPlayerStats();
  return fetchLive<PlayerStatsPayload>('/stats/me', token);
}

export async function getAdminStats({ forceDemo = false, token }: FetchOpts = {}): Promise<AdminStatsPayload> {
  if (forceDemo || !token) return mockAdminStats();
  return fetchLive<AdminStatsPayload>('/admin/stats/summary', token);
}

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const LEVELS: LevelSummary[] = [
  { id: 1, name: 'Neon Warmup', max_score: 1000, difficulty: 'Easy' },
  { id: 2, name: 'Cyber Tides', max_score: 1500, difficulty: 'Medium' },
  { id: 3, name: 'Voltage Storm', max_score: 2200, difficulty: 'Hard' },
  { id: 4, name: 'Quantum Abyss', max_score: 3000, difficulty: 'Insane' }
];

function daysAgoIso(days: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function levelMax(id: number) {
  return LEVELS.find((l) => l.id === id)?.max_score ?? 1000;
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: '#4ade80',
  Medium: '#fbbf24',
  Hard: '#fb7185',
  Insane: '#a855f7'
};

const PLAYER_NAMES = [
  'Fernando G.',
  'Aria Vox',
  'Kai Ember',
  'Luna Rift',
  'Nova Crane',
  'Echo Mori'
];

export function mockPlayerStats(): PlayerStatsPayload {
  const rand = seeded(42);
  const plays: LevelPlayedRecord[] = [];
  const totalPlays = 48;

  for (let i = 0; i < totalPlays; i++) {
    const level = LEVELS[Math.floor(rand() * LEVELS.length)];
    const name = PLAYER_NAMES[Math.floor(rand() * PLAYER_NAMES.length)];
    const progress = 0.55 + rand() * 0.45;
    const score = Math.round(level.max_score * progress);
    const attempts = 1 + Math.floor(rand() * 5);
    const time_used = 45 + Math.floor(rand() * 240);
    const daysBack = Math.floor(rand() * 30);
    plays.push({
      id: `lp-${i}`,
      user_id: `u-${(i % 6) + 1}`,
      user_name: name,
      level_id: level.id,
      level_name: level.name,
      difficulty: level.difficulty,
      score,
      attempts,
      time_used,
      date: daysAgoIso(daysBack)
    });
  }

  plays.sort((a, b) => (a.date < b.date ? 1 : -1));

  const totals = {
    plays: plays.length,
    avg_score: Math.round(plays.reduce((s, p) => s + p.score, 0) / plays.length),
    best_score: plays.reduce((m, p) => Math.max(m, p.score), 0),
    time_played_minutes: Math.round(plays.reduce((s, p) => s + p.time_used, 0) / 60),
    completion_rate: Math.round(
      (plays.filter((p) => p.score >= levelMax(p.level_id) * 0.75).length / plays.length) * 100
    )
  };

  const trendMap = new Map<string, { total: number; count: number }>();
  for (let d = 29; d >= 0; d--) {
    trendMap.set(daysAgoIso(d).slice(0, 10), { total: 0, count: 0 });
  }
  for (const p of plays) {
    const key = p.date.slice(0, 10);
    const bucket = trendMap.get(key);
    if (bucket) {
      bucket.total += p.score;
      bucket.count += 1;
    }
  }
  const scoreTrend = Array.from(trendMap.entries()).map(([date, { total, count }]) => ({
    date,
    score: count === 0 ? 0 : Math.round(total / count)
  }));

  const levelPerformance = LEVELS.map((level) => {
    const subset = plays.filter((p) => p.level_id === level.id);
    const avg = subset.length === 0 ? 0 : Math.round(subset.reduce((s, p) => s + p.score, 0) / subset.length);
    return {
      level_id: level.id,
      level_name: level.name,
      difficulty: level.difficulty,
      avg_score: avg,
      max_score: level.max_score
    };
  });

  const attempts = { '1': 0, '2-3': 0, '4+': 0 };
  for (const p of plays) {
    if (p.attempts === 1) attempts['1']++;
    else if (p.attempts <= 3) attempts['2-3']++;
    else attempts['4+']++;
  }

  const leaderMap = new Map<string, LeaderboardEntry>();
  for (const p of plays) {
    const current = leaderMap.get(p.user_id) ?? {
      user_id: p.user_id,
      user_name: p.user_name,
      total_score: 0,
      plays: 0,
      best_score: 0
    };
    current.total_score += p.score;
    current.plays += 1;
    current.best_score = Math.max(current.best_score, p.score);
    leaderMap.set(p.user_id, current);
  }

  return {
    source: 'demo',
    generated_at: new Date().toISOString(),
    totals,
    scoreTrend,
    levelPerformance,
    attemptsDistribution: [
      { label: '1 try', count: attempts['1'] },
      { label: '2–3 tries', count: attempts['2-3'] },
      { label: '4+ tries', count: attempts['4+'] }
    ],
    recentPlays: plays.slice(0, 8),
    leaderboard: Array.from(leaderMap.values()).sort((a, b) => b.total_score - a.total_score).slice(0, 5)
  };
}

const COMPANIES = [
  { id: 'c-1', name: 'Rockwell HQ' },
  { id: 'c-2', name: 'Rockwell México' },
  { id: 'c-3', name: 'Rockwell Brasil' },
  { id: 'c-4', name: 'Rockwell Europe' },
  { id: 'c-5', name: 'Rockwell India' },
  { id: 'c-6', name: 'Partner · Siemens' },
  { id: 'c-7', name: 'Partner · ABB' },
  { id: 'c-8', name: 'Rockwell Automation US' }
];

const FIRST_NAMES = [
  'Alex', 'Ariel', 'Blake', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Hayden',
  'Jordan', 'Kai', 'Logan', 'Morgan', 'Parker', 'Quinn', 'Reese', 'Sage',
  'Sky', 'Taylor', 'Avery', 'Rowan'
];
const LAST_NAMES = [
  'Vargas', 'Chen', 'Torres', 'Ali', 'Nakamura', 'Silva', 'Romero', 'Kumar',
  'Ibrahim', 'Jensen', 'Petrov', 'Okafor', 'Kim', 'Reyes', 'Abbas', 'Lopez'
];

export function mockAdminStats(): AdminStatsPayload {
  const rand = seeded(99);

  const users: {
    id: string;
    name: string;
    company_id: string;
    created_days_ago: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    age: number;
  }[] = [];
  const userCount = 142;

  const companyWeights = COMPANIES.map((_, i) => Math.pow(0.75, i));
  const totalWeight = companyWeights.reduce((s, w) => s + w, 0);

  for (let i = 0; i < userCount; i++) {
    let roll = rand() * totalWeight;
    let companyIdx = 0;
    for (let c = 0; c < COMPANIES.length; c++) {
      roll -= companyWeights[c];
      if (roll <= 0) {
        companyIdx = c;
        break;
      }
    }
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const genderRoll = rand();
    const gender = genderRoll < 0.48 ? 'MALE' : genderRoll < 0.9 ? 'FEMALE' : 'OTHER';
    users.push({
      id: `u-${i + 1}`,
      name: `${first} ${last[0]}.`,
      company_id: COMPANIES[companyIdx].id,
      created_days_ago: Math.floor(rand() * 90),
      gender,
      age: 22 + Math.floor(rand() * 33)
    });
  }

  const plays: (LevelPlayedRecord & { company_id: string; attempt_number: number })[] = [];
  for (const user of users) {
    const activeRoll = rand();
    if (activeRoll < 0.15) continue;
    const playCount = 3 + Math.floor(rand() * 28);
    let attemptCounter = 0;
    for (let i = 0; i < playCount; i++) {
      attemptCounter++;
      const level = LEVELS[Math.floor(rand() * LEVELS.length)];
      const learningBoost = Math.min(0.35, attemptCounter * 0.015);
      const progress = Math.min(1, 0.45 + rand() * 0.4 + learningBoost);
      const score = Math.round(level.max_score * progress);
      const maxDay = Math.min(user.created_days_ago, 60);
      const daysBack = Math.floor(rand() * Math.max(maxDay, 1));
      plays.push({
        id: `lp-${user.id}-${i}`,
        user_id: user.id,
        user_name: user.name,
        level_id: level.id,
        level_name: level.name,
        difficulty: level.difficulty,
        score,
        attempts: 1 + Math.floor(rand() * 4),
        time_used: 60 + Math.floor(rand() * 240),
        date: daysAgoIso(daysBack),
        company_id: user.company_id,
        attempt_number: Math.min(attemptCounter, 10)
      });
    }
  }

  const now = new Date();
  const active7d = new Set(
    plays.filter((p) => (now.getTime() - new Date(p.date).getTime()) / 86400000 <= 7).map((p) => p.user_id)
  );
  const active30d = new Set(
    plays.filter((p) => (now.getTime() - new Date(p.date).getTime()) / 86400000 <= 30).map((p) => p.user_id)
  );
  const newUsers7d = users.filter((u) => u.created_days_ago <= 7).length;
  const totalHours = Math.round(plays.reduce((s, p) => s + p.time_used, 0) / 3600);
  const avgScore = plays.length === 0 ? 0 : Math.round(plays.reduce((s, p) => s + p.score, 0) / plays.length);

  const companiesWithActivity = new Set(plays.map((p) => p.company_id));

  const usersWhoPlayedByWeek = new Map<string, Set<string>>();
  for (const p of plays) {
    const week = Math.floor((now.getTime() - new Date(p.date).getTime()) / (86400000 * 7));
    const key = `w-${week}`;
    if (!usersWhoPlayedByWeek.has(key)) usersWhoPlayedByWeek.set(key, new Set());
    usersWhoPlayedByWeek.get(key)!.add(p.user_id);
  }
  const w1Users = usersWhoPlayedByWeek.get('w-1') ?? new Set();
  const w2Users = usersWhoPlayedByWeek.get('w-0') ?? new Set();
  const retainedW2 = Array.from(w1Users).filter((u) => w2Users.has(u)).length;
  const retentionW2 = w1Users.size === 0 ? 0 : Math.round((retainedW2 / w1Users.size) * 100);

  const growthMap = new Map<string, { signups: number; sessions: number }>();
  for (let d = 29; d >= 0; d--) {
    growthMap.set(daysAgoIso(d).slice(0, 10), { signups: 0, sessions: 0 });
  }
  for (const u of users) {
    if (u.created_days_ago <= 29) {
      const key = daysAgoIso(u.created_days_ago).slice(0, 10);
      const bucket = growthMap.get(key);
      if (bucket) bucket.signups++;
    }
  }
  for (const p of plays) {
    const key = p.date.slice(0, 10);
    const bucket = growthMap.get(key);
    if (bucket) bucket.sessions++;
  }
  const growth = Array.from(growthMap.entries()).map(([date, v]) => ({ date, ...v }));

  const playedUsers = new Set(plays.map((p) => p.user_id));
  const threePlusUsers = new Set(
    Array.from(playedUsers).filter((uid) => plays.filter((p) => p.user_id === uid).length >= 3)
  );
  const completedAllUsers = new Set(
    Array.from(playedUsers).filter((uid) => {
      const userPlays = plays.filter((p) => p.user_id === uid);
      const levelsBeaten = new Set(
        userPlays.filter((p) => p.score >= levelMax(p.level_id) * 0.75).map((p) => p.level_id)
      );
      return levelsBeaten.size === LEVELS.length;
    })
  );
  const funnel = [
    { stage: 'Registered', count: users.length },
    { stage: 'Played ≥1 level', count: playedUsers.size },
    { stage: 'Played ≥3 levels', count: threePlusUsers.size },
    { stage: 'Completed all levels', count: completedAllUsers.size }
  ];

  const companiesAgg = COMPANIES.map((c) => {
    const cPlays = plays.filter((p) => p.company_id === c.id);
    const cUsers = users.filter((u) => u.company_id === c.id);
    const cActive = new Set(cPlays.map((p) => p.user_id));
    const avg = cPlays.length === 0 ? 0 : Math.round(cPlays.reduce((s, p) => s + p.score, 0) / cPlays.length);
    return {
      company_id: c.id,
      company_name: c.name,
      active_users: cActive.size,
      total_users: cUsers.length,
      plays: cPlays.length,
      avg_score: avg,
      hours: Math.round(cPlays.reduce((s, p) => s + p.time_used, 0) / 3600)
    };
  }).sort((a, b) => b.plays - a.plays);

  const curveBuckets = new Map<number, { sum: number; count: number }>();
  for (let i = 1; i <= 10; i++) curveBuckets.set(i, { sum: 0, count: 0 });
  for (const p of plays) {
    const bucket = curveBuckets.get(p.attempt_number);
    if (bucket) {
      bucket.sum += (p.score / levelMax(p.level_id)) * 100;
      bucket.count++;
    }
  }
  const learningCurve = Array.from(curveBuckets.entries())
    .filter(([, v]) => v.count > 0)
    .map(([attempt_number, v]) => ({
      attempt_number,
      avg_score: Math.round(v.sum / v.count),
      sample_size: v.count
    }));

  const levelCompletion = LEVELS.map((level) => {
    const lPlays = plays.filter((p) => p.level_id === level.id);
    const completed = lPlays.filter((p) => p.score >= level.max_score * 0.75).length;
    return {
      level_id: level.id,
      level_name: level.name,
      difficulty: level.difficulty,
      started: lPlays.length,
      completed,
      completion_rate: lPlays.length === 0 ? 0 : Math.round((completed / lPlays.length) * 100)
    };
  });

  const genderCounts = { MALE: 0, FEMALE: 0, OTHER: 0 };
  for (const u of users) genderCounts[u.gender]++;
  const ageRangeBuckets = [
    { label: '20–29', min: 20, max: 29, count: 0 },
    { label: '30–39', min: 30, max: 39, count: 0 },
    { label: '40–49', min: 40, max: 49, count: 0 },
    { label: '50+', min: 50, max: 120, count: 0 }
  ];
  for (const u of users) {
    const bucket = ageRangeBuckets.find((b) => u.age >= b.min && u.age <= b.max);
    if (bucket) bucket.count++;
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [0, 3, 6, 9, 12, 15, 18, 21];
  const hourLabels = hours.map((h) => `${h.toString().padStart(2, '0')}h`);
  const heatmap = dayLabels.map((_, dayIdx) =>
    hours.map((startHour) => {
      const isWeekend = dayIdx >= 5;
      const isPeak = startHour >= 9 && startHour <= 18;
      const base = isPeak ? 45 : 12;
      const weekendFactor = isWeekend ? 0.3 : 1;
      return Math.max(0, Math.round(base * weekendFactor + (rand() * 20 - 10)));
    })
  );

  const topPlayerMap = new Map<string, LeaderboardEntry>();
  for (const p of plays) {
    const current = topPlayerMap.get(p.user_id) ?? {
      user_id: p.user_id,
      user_name: p.user_name,
      total_score: 0,
      plays: 0,
      best_score: 0
    };
    current.total_score += p.score;
    current.plays += 1;
    current.best_score = Math.max(current.best_score, p.score);
    topPlayerMap.set(p.user_id, current);
  }

  return {
    source: 'demo',
    generated_at: new Date().toISOString(),
    platform: {
      total_users: users.length,
      active_7d: active7d.size,
      active_30d: active30d.size,
      new_users_7d: newUsers7d,
      companies_active: companiesWithActivity.size,
      total_hours: totalHours,
      avg_score: avgScore,
      retention_w2: retentionW2
    },
    growth,
    funnel,
    companies: companiesAgg,
    learningCurve,
    levelCompletion,
    demographics: {
      gender: [
        { label: 'Male', count: genderCounts.MALE },
        { label: 'Female', count: genderCounts.FEMALE },
        { label: 'Other', count: genderCounts.OTHER }
      ],
      ageRanges: ageRangeBuckets.map((b) => ({ label: b.label, count: b.count }))
    },
    activityHeatmap: { dayLabels, hourLabels, values: heatmap },
    topPlayers: Array.from(topPlayerMap.values()).sort((a, b) => b.total_score - a.total_score).slice(0, 5)
  };
}
