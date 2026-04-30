'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BarChart, FunnelChart, Heatmap, MultiLineChart } from '@/app/components/charts';
import { DIFFICULTY_COLORS } from '@/lib/stats';
import { runAdminMaintenance } from '@/lib/stats';
import { getToken } from '@/lib/auth';
import { notifyError, notifySuccess } from '@/lib/notifications';
import type { AdminStatsPayload } from '@/types/stats';

interface Props {
  stats: AdminStatsPayload;
}

function stickiness(active7d: number, active30d: number) {
  if (active30d === 0) return 0;
  return Math.round((active7d / active30d) * 100);
}

export default function AdminDashboard({ stats }: Props) {
  const { platform, growth, funnel, companies, levelCompletion, activityHeatmap } = stats;
  const [maintenanceNote, setMaintenanceNote] = useState<string>('');
  const [companyName, setCompanyName] = useState('');
  const [levelId, setLevelId] = useState('');

  async function runAction(action: 'clean-sessions' | 'add-company' | 'reset-level') {
    try {
      const token = getToken();
      if (!token) throw new Error('auth');

      if (action === 'clean-sessions') {
        const res = await runAdminMaintenance({ action, token });
        const message = `Sessions cleaned · ${new Date(res.cleaned_at).toLocaleString()}`;
        setMaintenanceNote(message);
        notifySuccess(message);
        return;
      }

      if (action === 'add-company') {
        const name = companyName.trim();
        if (!name) throw new Error('Company name required');
        const res = await runAdminMaintenance({ action, token, name });
        const message = `Company created · ${res.name}`;
        setMaintenanceNote(message);
        notifySuccess(message);
        setCompanyName('');
        return;
      }

      const id = Number(levelId);
      if (!Number.isFinite(id) || id <= 0) throw new Error('Valid level id required');
      const res = await runAdminMaintenance({ action, token, level_id: id });
      const message = `Level reset · ${res.level_id}`;
      setMaintenanceNote(message);
      notifySuccess(message);
      setLevelId('');
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Could not run action');
    }
  }

  return (
    <div className='stats-dashboard'>
      <header className='stats-header'>
        <div>
          <p className='stats-eyebrow'>OTrix · Admin analytics</p>
          <h1 className='stats-hero-title'>Game adoption &amp; impact</h1>
          <p className='stats-hero-sub'>
            How Rockwell teams and partners are using OTrix — updated {new Date(stats.generated_at).toLocaleString()}.
          </p>
        </div>
        <div className='stats-header-actions'>
          {stats.source === 'demo' && <span className='stats-demo-pill'>Demo data</span>}
          <Link href='/' className='btn btn-light btn-sm'>Back to menu</Link>
        </div>
      </header>

      <section className='stats-kpi-grid'>
        <KpiCard label='Total users' value={platform.total_users} accent='#60a5fa' hint={`+${platform.new_users_7d} new this week`} />
        <KpiCard label='Active 7d' value={platform.active_7d} accent='#ff6a88' hint={`${stickiness(platform.active_7d, platform.active_30d)}% stickiness`} />
        <KpiCard label='Active 30d' value={platform.active_30d} accent='#a855f7' />
        <KpiCard label='Companies active' value={platform.companies_active} accent='#4ade80' />
        <KpiCard label='Hours played' value={platform.total_hours.toLocaleString()} accent='#fbbf24' />
      </section>

      <section className='stats-grid'>
        <article className='stats-panel stats-panel--sm'>
          <header className='stats-panel-head'>
            <h2>DB maintenance</h2>
            <span>Run stored procedures</span>
          </header>
          <div className='stats-maintenance'>
            <button className='btn btn-light btn-sm' onClick={() => runAction('clean-sessions')}>Clean sessions</button>
            <div className='stats-inline-form'>
              <input
                className='input'
                placeholder='Company name'
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <button className='btn btn-light btn-sm' onClick={() => runAction('add-company')}>Add company</button>
            </div>
            <div className='stats-inline-form'>
              <input
                className='input'
                placeholder='Level id'
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
              />
              <button className='btn btn-light btn-sm' onClick={() => runAction('reset-level')}>Reset level</button>
            </div>
            {maintenanceNote && <p className='stats-note'>{maintenanceNote}</p>}
          </div>
        </article>
        <article className='stats-panel stats-panel--wide'>
          <header className='stats-panel-head'>
            <h2>Growth</h2>
            <span>Signups &amp; sessions · last 30 days</span>
          </header>
          <MultiLineChart
            series={[
              {
                label: 'Signups',
                color: '#60a5fa',
                values: growth.map((g) => ({ x: g.date, y: g.signups }))
              },
              {
                label: 'Sessions',
                color: '#ff6a88',
                values: growth.map((g) => ({ x: g.date, y: g.sessions }))
              }
            ]}
          />
        </article>

        <article className='stats-panel stats-panel--sm'>
          <header className='stats-panel-head'>
            <h2>Engagement funnel</h2>
            <span>Registered → committed</span>
          </header>
          <FunnelChart stages={funnel} />
        </article>

        <article className='stats-panel stats-panel--full'>
          <header className='stats-panel-head'>
            <h2>Impact by company</h2>
            <span>Sorted by total plays</span>
          </header>
          <div className='table-responsive'>
            <table className='stats-table'>
              <thead>
                <tr>
                  <th>Company</th>
                  <th className='text-end'>Active users</th>
                  <th className='text-end'>Total users</th>
                  <th className='text-end'>Plays</th>
                  <th className='text-end'>Avg score</th>
                  <th className='text-end'>Hours</th>
                  <th>Engagement</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => {
                  const engagement = c.total_users === 0 ? 0 : Math.min(100, Math.round((c.active_users / c.total_users) * 100));
                  return (
                    <tr key={c.company_id}>
                      <td className='stats-company-name'>{c.company_name}</td>
                      <td className='text-end stats-num'>{c.active_users}</td>
                      <td className='text-end stats-num'>{c.total_users}</td>
                      <td className='text-end stats-num'>{c.plays.toLocaleString()}</td>
                      <td className='text-end stats-num'>{c.avg_score}</td>
                      <td className='text-end stats-num'>{c.hours}</td>
                      <td>
                        <div className='stats-inline-bar'>
                          <div className='stats-inline-bar-fill' style={{ width: `${engagement}%` }} />
                          <span>{engagement}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className='stats-panel'>
          <header className='stats-panel-head'>
            <h2>Level completion</h2>
            <span>% reaching ≥75% of max score</span>
          </header>
          <BarChart
            items={levelCompletion.map((l) => ({
              label: `${l.level_name} · ${l.difficulty}`,
              value: l.completion_rate,
              max: 100,
              color: DIFFICULTY_COLORS[l.difficulty],
              sublabel: `${l.completed}/${l.started} plays completed`
            }))}
          />
        </article>

        <article className='stats-panel'>
          <header className='stats-panel-head'>
            <h2>Activity heatmap</h2>
            <span>When players are online</span>
          </header>
          <Heatmap
            data={activityHeatmap.values}
            rowLabels={activityHeatmap.dayLabels}
            colLabels={activityHeatmap.hourLabels}
          />
        </article>

        {/* <article className='stats-panel'>
          <header className='stats-panel-head'>
            <h2>Gender</h2>
            <span>Registered users</span>
          </header>
          <Donut
            centerLabel='users'
            segments={demographics.gender.map((g, i) => ({
              label: g.label,
              value: g.count,
              color: DEMO_COLORS[i % DEMO_COLORS.length]
            }))}
          />
        </article> */}

        {/* <article className='stats-panel'>
          <header className='stats-panel-head'>
            <h2>Age ranges</h2>
            <span>Derived from birthday</span>
          </header>
          <Donut
            centerLabel='users'
            segments={demographics.ageRanges.map((r, i) => ({
              label: r.label,
              value: r.count,
              color: AGE_COLORS[i % AGE_COLORS.length]
            }))}
          />
        </article> */}

      </section>
    </div>
  );
}

interface KpiProps {
  label: string;
  value: string | number;
  accent: string;
  hint?: string;
}

function KpiCard({ label, value, accent, hint }: KpiProps) {
  return (
    <div className='stats-kpi' style={{ ['--kpi-accent' as string]: accent }}>
      <span className='stats-kpi-label'>{label}</span>
      <div className='stats-kpi-body'>
        <span className='stats-kpi-value'>{typeof value === 'number' ? value.toLocaleString() : value}</span>
      </div>
      {hint && <span className='stats-kpi-footer'>{hint}</span>}
    </div>
  );
}
