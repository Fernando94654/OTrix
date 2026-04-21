import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Insane';
const ALLOWED_DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Insane'];
const toDifficulty = (raw: string | null): Difficulty =>
    (ALLOWED_DIFFICULTIES.includes((raw ?? '') as Difficulty) ? (raw as Difficulty) : 'Medium');

const COMPLETION_RATIO = 0.75;
const DAY_MS = 86400000;

function daysAgo(days: number) {
    return new Date(Date.now() - days * DAY_MS);
}

function dateKey(d: Date) {
    return d.toISOString().slice(0, 10);
}

function emptyDays(n: number): Map<string, { total: number; count: number }> {
    const map = new Map<string, { total: number; count: number }>();
    for (let i = n - 1; i >= 0; i--) map.set(dateKey(daysAgo(i)), { total: 0, count: 0 });
    return map;
}

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) {}

    async getPlayerStats(userId: string) {
        const [user, plays, levels, globalLeaderboard] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, last_name: true } }),
            this.prisma.levelPlayed.findMany({
                where: { user_id: userId, date: { not: null } },
                include: { level: true },
                orderBy: { date: 'desc' },
            }),
            this.prisma.level.findMany(),
            this.leaderboard(5),
        ]);

        const playerName = user ? `${user.name} ${user.last_name?.[0] ?? ''}.`.trim() : 'Player';

        const totals = {
            plays: plays.length,
            avg_score: plays.length ? Math.round(plays.reduce((s, p) => s + (p.score ?? 0), 0) / plays.length) : 0,
            best_score: plays.reduce((m, p) => Math.max(m, p.score ?? 0), 0),
            time_played_minutes: Math.round(plays.reduce((s, p) => s + (p.time_used ?? 0), 0) / 60),
            completion_rate: plays.length === 0 ? 0 : Math.round(
                (plays.filter((p) => (p.score ?? 0) >= (p.level.max_score ?? 0) * COMPLETION_RATIO).length / plays.length) * 100
            ),
        };

        const trendBuckets = emptyDays(30);
        const cutoff = daysAgo(29).getTime();
        for (const p of plays) {
            if (!p.date || p.date.getTime() < cutoff) continue;
            const bucket = trendBuckets.get(dateKey(p.date));
            if (bucket) {
                bucket.total += p.score ?? 0;
                bucket.count += 1;
            }
        }
        const scoreTrend = Array.from(trendBuckets, ([date, { total, count }]) => ({
            date,
            score: count === 0 ? 0 : Math.round(total / count),
        }));

        const levelPerformance = levels.map((level) => {
            const subset = plays.filter((p) => p.level_id === level.id);
            return {
                level_id: level.id,
                level_name: level.name ?? `Level ${level.id}`,
                difficulty: toDifficulty(level.difficulty),
                avg_score: subset.length === 0 ? 0 : Math.round(subset.reduce((s, p) => s + (p.score ?? 0), 0) / subset.length),
                max_score: level.max_score ?? 0,
            };
        });

        const attempts = { one: 0, mid: 0, many: 0 };
        for (const p of plays) {
            const a = p.attempts ?? 0;
            if (a === 1) attempts.one++;
            else if (a <= 3) attempts.mid++;
            else if (a > 0) attempts.many++;
        }

        return {
            source: 'live' as const,
            generated_at: new Date().toISOString(),
            totals,
            scoreTrend,
            levelPerformance,
            attemptsDistribution: [
                { label: '1 try', count: attempts.one },
                { label: '2–3 tries', count: attempts.mid },
                { label: '4+ tries', count: attempts.many },
            ],
            recentPlays: plays.slice(0, 8).map((p) => ({
                id: p.id,
                user_id: p.user_id,
                user_name: playerName,
                level_id: p.level_id,
                level_name: p.level.name ?? `Level ${p.level_id}`,
                difficulty: toDifficulty(p.level.difficulty),
                score: p.score ?? 0,
                attempts: p.attempts ?? 0,
                time_used: p.time_used ?? 0,
                date: p.date?.toISOString() ?? new Date().toISOString(),
            })),
            leaderboard: globalLeaderboard,
        };
    }

    async getAdminSummary() {
        const [
            total_users,
            new_users_7d,
            active7dRows,
            active30dRows,
            activeCompaniesRows,
            playsAggregate,
            users,
            plays,
            levels,
            companies,
            activityRows,
            genderGroup,
            globalLeaderboard,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { created_at: { gte: daysAgo(7) } } }),
            this.prisma.$queryRaw<{ user_id: string }[]>`SELECT DISTINCT user_id FROM level_played WHERE date >= ${daysAgo(7)}`,
            this.prisma.$queryRaw<{ user_id: string }[]>`SELECT DISTINCT user_id FROM level_played WHERE date >= ${daysAgo(30)}`,
            this.prisma.$queryRaw<{ company_id: string | null }[]>`
                SELECT DISTINCT u.company_id FROM users u
                JOIN level_played lp ON lp.user_id = u.id
                WHERE u.company_id IS NOT NULL AND lp.date >= ${daysAgo(30)}
            `,
            this.prisma.levelPlayed.aggregate({ _sum: { time_used: true }, _avg: { score: true } }),
            this.prisma.user.findMany({
                select: { id: true, company_id: true, gender: true, birthday: true, created_at: true },
            }),
            this.prisma.levelPlayed.findMany({
                where: { date: { not: null } },
                select: { id: true, user_id: true, level_id: true, score: true, time_used: true, date: true },
                orderBy: { date: 'asc' },
            }),
            this.prisma.level.findMany(),
            this.prisma.company.findMany(),
            this.prisma.$queryRaw<{ dow: number; bucket: number; count: bigint }[]>`
                SELECT EXTRACT(DOW FROM date)::int AS dow,
                       FLOOR(EXTRACT(HOUR FROM date)/3)::int AS bucket,
                       COUNT(*)::bigint AS count
                FROM level_played
                WHERE date IS NOT NULL
                GROUP BY dow, bucket
            `,
            this.prisma.user.groupBy({ by: ['gender'], _count: { _all: true } }),
            this.leaderboard(5),
        ]);

        const levelMax = new Map(levels.map((l) => [l.id, l.max_score ?? 0]));
        const platform = {
            total_users,
            active_7d: active7dRows.length,
            active_30d: active30dRows.length,
            new_users_7d,
            companies_active: activeCompaniesRows.length,
            total_hours: Math.round((playsAggregate._sum.time_used ?? 0) / 3600),
            avg_score: Math.round(playsAggregate._avg.score ?? 0),
            retention_w2: this.retentionW2(plays),
        };

        const signupByDay = emptyDays(30);
        for (const u of users) {
            if (u.created_at && u.created_at.getTime() >= daysAgo(29).getTime()) {
                const bucket = signupByDay.get(dateKey(u.created_at));
                if (bucket) bucket.count++;
            }
        }
        const sessionsByDay = emptyDays(30);
        for (const p of plays) {
            if (p.date && p.date.getTime() >= daysAgo(29).getTime()) {
                const bucket = sessionsByDay.get(dateKey(p.date));
                if (bucket) bucket.count++;
            }
        }
        const growth = Array.from(signupByDay, ([date, v]) => ({
            date,
            signups: v.count,
            sessions: sessionsByDay.get(date)?.count ?? 0,
        }));

        const playsByUser = new Map<string, { count: number; beatenLevels: Set<number> }>();
        for (const p of plays) {
            const entry = playsByUser.get(p.user_id) ?? { count: 0, beatenLevels: new Set<number>() };
            entry.count++;
            if ((p.score ?? 0) >= (levelMax.get(p.level_id) ?? 0) * COMPLETION_RATIO) {
                entry.beatenLevels.add(p.level_id);
            }
            playsByUser.set(p.user_id, entry);
        }
        const totalLevels = levels.length;
        const funnel = [
            { stage: 'Registered', count: total_users },
            { stage: 'Played ≥1 level', count: playsByUser.size },
            { stage: 'Played ≥3 levels', count: Array.from(playsByUser.values()).filter((v) => v.count >= 3).length },
            {
                stage: 'Completed all levels',
                count: Array.from(playsByUser.values()).filter((v) => v.beatenLevels.size === totalLevels).length,
            },
        ];

        const userCompanyIndex = new Map(users.map((u) => [u.id, u.company_id]));
        const companiesAgg = companies
            .map((c) => {
                const cPlays = plays.filter((p) => userCompanyIndex.get(p.user_id) === c.id);
                const activeUsers = new Set(cPlays.map((p) => p.user_id));
                const totalUsersForCompany = users.filter((u) => u.company_id === c.id).length;
                const scoreSum = cPlays.reduce((s, p) => s + (p.score ?? 0), 0);
                const secondsSum = cPlays.reduce((s, p) => s + (p.time_used ?? 0), 0);
                return {
                    company_id: c.id,
                    company_name: c.name ?? 'Unnamed company',
                    active_users: activeUsers.size,
                    total_users: totalUsersForCompany,
                    plays: cPlays.length,
                    avg_score: cPlays.length === 0 ? 0 : Math.round(scoreSum / cPlays.length),
                    hours: Math.round(secondsSum / 3600),
                };
            })
            .sort((a, b) => b.plays - a.plays);

        const curveBuckets = new Map<number, { sum: number; count: number }>();
        for (let i = 1; i <= 10; i++) curveBuckets.set(i, { sum: 0, count: 0 });
        const userAttemptCounter = new Map<string, number>();
        for (const p of plays) {
            const next = (userAttemptCounter.get(p.user_id) ?? 0) + 1;
            userAttemptCounter.set(p.user_id, next);
            const bucket = curveBuckets.get(Math.min(next, 10));
            if (bucket) {
                const max = levelMax.get(p.level_id) ?? 0;
                bucket.sum += max === 0 ? 0 : ((p.score ?? 0) / max) * 100;
                bucket.count += 1;
            }
        }
        const learningCurve = Array.from(curveBuckets, ([attempt_number, v]) => ({
            attempt_number,
            avg_score: v.count === 0 ? 0 : Math.round(v.sum / v.count),
            sample_size: v.count,
        })).filter((p) => p.sample_size > 0);

        const levelCompletion = levels.map((level) => {
            const lPlays = plays.filter((p) => p.level_id === level.id);
            const completed = lPlays.filter((p) => (p.score ?? 0) >= (level.max_score ?? 0) * COMPLETION_RATIO).length;
            return {
                level_id: level.id,
                level_name: level.name ?? `Level ${level.id}`,
                difficulty: toDifficulty(level.difficulty),
                started: lPlays.length,
                completed,
                completion_rate: lPlays.length === 0 ? 0 : Math.round((completed / lPlays.length) * 100),
            };
        });

        const genderCount = { MALE: 0, FEMALE: 0, OTHER: 0 };
        for (const g of genderGroup) genderCount[g.gender ?? 'OTHER'] = g._count._all;
        const ageBuckets = [
            { label: '20–29', min: 20, max: 29, count: 0 },
            { label: '30–39', min: 30, max: 39, count: 0 },
            { label: '40–49', min: 40, max: 49, count: 0 },
            { label: '50+', min: 50, max: 200, count: 0 },
        ];
        const now = Date.now();
        for (const u of users) {
            if (!u.birthday) continue;
            const age = Math.floor((now - u.birthday.getTime()) / (365.25 * DAY_MS));
            const bucket = ageBuckets.find((b) => age >= b.min && age <= b.max);
            if (bucket) bucket.count++;
        }

        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const hours = [0, 3, 6, 9, 12, 15, 18, 21];
        const hourLabels = hours.map((h) => `${h.toString().padStart(2, '0')}h`);
        const grid: number[][] = dayLabels.map(() => hours.map(() => 0));
        for (const row of activityRows) {
            if (row.dow >= 0 && row.dow < 7 && row.bucket >= 0 && row.bucket < 8) {
                grid[row.dow][row.bucket] = Number(row.count);
            }
        }
        // Reorder: Mon, Tue, Wed, Thu, Fri, Sat, Sun
        const activityHeatmap = {
            dayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            hourLabels,
            values: [grid[1], grid[2], grid[3], grid[4], grid[5], grid[6], grid[0]],
        };

        return {
            source: 'live' as const,
            generated_at: new Date().toISOString(),
            platform,
            growth,
            funnel,
            companies: companiesAgg,
            learningCurve,
            levelCompletion,
            demographics: {
                gender: [
                    { label: 'Male', count: genderCount.MALE },
                    { label: 'Female', count: genderCount.FEMALE },
                    { label: 'Other', count: genderCount.OTHER },
                ],
                ageRanges: ageBuckets.map((b) => ({ label: b.label, count: b.count })),
            },
            activityHeatmap,
            topPlayers: globalLeaderboard,
        };
    }

    private async leaderboard(limit: number) {
        const rows = await this.prisma.$queryRaw<
            { user_id: string; name: string; last_name: string; total_score: number; plays: number; best_score: number }[]
        >`
            SELECT lp.user_id,
                   u.name,
                   u.last_name,
                   COALESCE(SUM(lp.score), 0)::int AS total_score,
                   COUNT(lp.id)::int              AS plays,
                   COALESCE(MAX(lp.score), 0)::int AS best_score
            FROM level_played lp
            JOIN users u ON u.id = lp.user_id
            GROUP BY lp.user_id, u.name, u.last_name
            ORDER BY total_score DESC
            LIMIT ${limit}
        `;
        return rows.map((r) => ({
            user_id: r.user_id,
            user_name: `${r.name} ${r.last_name?.[0] ?? ''}.`.trim(),
            total_score: r.total_score,
            plays: r.plays,
            best_score: r.best_score,
        }));
    }

    private retentionW2(plays: { user_id: string; date: Date | null }[]) {
        const lastWeek = daysAgo(7).getTime();
        const twoWeeksAgo = daysAgo(14).getTime();
        const prevWeek = new Set<string>();
        const thisWeek = new Set<string>();
        for (const p of plays) {
            if (!p.date) continue;
            const t = p.date.getTime();
            if (t >= twoWeeksAgo && t < lastWeek) prevWeek.add(p.user_id);
            if (t >= lastWeek) thisWeek.add(p.user_id);
        }
        if (prevWeek.size === 0) return 0;
        let retained = 0;
        for (const uid of prevWeek) if (thisWeek.has(uid)) retained++;
        return Math.round((retained / prevWeek.size) * 100);
    }
}
