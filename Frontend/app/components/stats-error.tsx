import type { StatsErrorKind } from '@/lib/stats';

interface Props {
  kind: Exclude<StatsErrorKind, 'auth'>;
  onRetry: () => void;
}

const MESSAGES: Record<Props['kind'], { title: string; body: string }> = {
  network: {
    title: "Can't reach the server",
    body: 'Check your connection, then try again.'
  },
  server: {
    title: 'Stats unavailable',
    body: "Something went wrong on our side. We're looking into it."
  }
};

export default function StatsError({ kind, onRetry }: Props) {
  const { title, body } = MESSAGES[kind];
  return (
    <div className='stats-guard' role='alert'>
      <h2>{title}</h2>
      <p>{body}</p>
      <div className='stats-guard-actions'>
        <button type='button' className='btn btn-custom px-4' onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  );
}
