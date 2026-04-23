'use client';

import Link from 'next/link';
import { BarChart, Donut, LineChart, Sparkline } from '@/app/components/charts';
import { DIFFICULTY_COLORS } from '@/lib/stats';
import type { PlayerStatsPayload } from '@/types/stats';

interface Props {
  stats: PlayerStatsPayload;
}

const DONUT_COLORS = ['#4ade80', '#fbbf24', '#fb7185'];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerDashboard({ stats }: Props) {
  const { totals, scoreTrend, levelPerformance, attemptsDistribution, recentPlays, leaderboard } = stats;

  if (stats.source === 'live' && totals.plays === 0) {
    return <PlayerEmptyState />;
  }

  const trendValues = scoreTrend.map((t) => t.score);

  return (
    <div className='stats-dashboard'>
      <header className='stats-header'>
        <div>
          <p className='stats-eyebrow'>OTrix · My progress</p>
          <h1 className='stats-hero-title'>Your performance at a glance</h1>
          <p className='stats-hero-sub'>
            Scores, streaks and level mastery — updated {new Date(stats.generated_at).toLocaleString()}.
          </p>
        </div>
        <div className='stats-header-actions'>
          {stats.source === 'demo' && <span className='stats-demo-pill'>Demo data</span>}
          <Link href='/' className='btn btn-light btn-sm'>Back to menu</Link>
        </div>
      </header>

      {stats.source === 'demo' && (
        <div className='stats-demo-banner' role='status'>
          Showing sample data. Connect the backend endpoint <code>/stats/me</code> to see real gameplay metrics.
        </div>
      )}

      <section className='stats-kpi-grid'>
        <KpiCard label='Total plays' value={totals.plays} accent='#ff6a88' spark={trendValues} />
        <KpiCard label='Average score' value={totals.avg_score} accent='#60a5fa' spark={trendValues} />
        <KpiCard label='Best score' value={totals.best_score} accent='#fbbf24' spark={trendValues.slice(-14)} />
        <KpiCard
          label='Time played'
          value={`${totals.time_played_minutes} min`}
          accent='#4ade80'
          spark={trendValues.slice(-14)}
          footer={`${totals.completion_rate}% completion rate`}
        />
      </section>

      <section className='stats-grid'>
        <article className='stats-panel stats-panel--wide'>
          <header className='stats-panel-head'>
            <h2>Score trend</h2>
            <span>Last 30 days</span>
          </header>
          <LineChart data={scoreTrend} />
        </article>

        <article className='stats-panel'>
          <header className='stats-panel-head'>
            <h2>Attempts distribution</h2>
            <span>How often you one-shot levels</span>
          </header>
          <Donut
            segments={attemptsDistribution.map((a, i) => ({
              label: a.label,
              value: a.count,
              color: DONUT_COLORS[i % DONUT_COLORS.length]
            }))}
            centerLabel='plays'
          />
        </article>

        <article className='stats-panel stats-panel--wide'>
          <header className='stats-panel-head'>
            <h2>Level mastery</h2>
            <span>Avg score vs max · colored by difficulty</span>
          </header>
          <BarChart
            items={levelPerformance.map((lp) => ({
              label: `${lp.level_name} · ${lp.difficulty}`,
              value: lp.avg_score,
              max: lp.max_score,
              color: DIFFICULTY_COLORS[lp.difficulty]
            }))}
          />
        </article>

        <article className='stats-panel stats-panel--full'>
          <header className='stats-panel-head'>
            <h2>Recent runs</h2>
            <span>Latest {recentPlays.length} plays</span>
          </header>
          <div className='table-responsive'>
            <table className='stats-table'>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Player</th>
                  <th>Level</th>
                  <th>Difficulty</th>
                  <th className='text-end'>Score</th>
                  <th className='text-end'>Attempts</th>
                  <th className='text-end'>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentPlays.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.date)}</td>
                    <td>{p.user_name}</td>
                    <td>{p.level_name}</td>
                    <td>
                      <span className='stats-diff-chip' style={{ background: `${DIFFICULTY_COLORS[p.difficulty]}22`, color: DIFFICULTY_COLORS[p.difficulty] }}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className='text-end stats-num'>{p.score}</td>
                    <td className='text-end stats-num'>{p.attempts}</td>
                    <td className='text-end stats-num'>{formatTime(p.time_used)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

interface KpiProps {
  label: string;
  value: string | number;
  accent: string;
  spark: number[];
  footer?: string;
}

function PlayerEmptyState() {
  return (
    <div className='stats-dashboard stats-empty'>
      <header className='stats-header'>
        <div>
          <p className='stats-eyebrow'>OTrix · My progress</p>
          <h1 className='stats-hero-title'>No plays yet.</h1>
          <p className='stats-hero-sub'>Launch a scenario to start filling in your metrics.</p>
        </div>
      </header>
      <div className='stats-empty__cta'>
        <Link href='/videogame' className='home-btn home-btn--primary home-btn--large'>
          <span>Launch arcade</span>
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M5 12h14M13 6l6 6-6 6' stroke='currentColor' strokeWidth='2' fill='none' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function KpiCard({ label, value, accent, spark, footer }: KpiProps) {
  return (
    <div className='stats-kpi' style={{ ['--kpi-accent' as string]: accent }}>
      <span className='stats-kpi-label'>{label}</span>
      <div className='stats-kpi-body'>
        <span className='stats-kpi-value'>{typeof value === 'number' ? value.toLocaleString() : value}</span>
        <Sparkline values={spark} color={accent} />
      </div>
      {footer && <span className='stats-kpi-footer'>{footer}</span>}
    </div>
  );
}
