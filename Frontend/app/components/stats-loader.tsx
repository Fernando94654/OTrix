interface StatsLoaderProps {
  label?: string;
  sublabel?: string;
}

export default function StatsLoader({
  label = 'Loading analytics',
  sublabel = 'Crunching the latest numbers for you'
}: StatsLoaderProps) {
  return (
    <div className='stats-guard' role='status' aria-live='polite'>
      <div className='stats-loader'>
        <svg
          className='stats-loader__svg'
          viewBox='0 0 64 64'
          aria-hidden='true'
        >
          <defs>
            <linearGradient id='stats-loader-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor='#cd163f' />
              <stop offset='100%' stopColor='#ff8fa3' />
            </linearGradient>
          </defs>
          <circle
            cx='32'
            cy='32'
            r='26'
            fill='none'
            stroke='rgba(255,255,255,0.08)'
            strokeWidth='3'
          />
          <circle
            className='stats-loader__arc'
            cx='32'
            cy='32'
            r='26'
            fill='none'
            stroke='url(#stats-loader-gradient)'
            strokeWidth='3'
            strokeLinecap='round'
            pathLength={100}
          />
        </svg>
        <span className='stats-loader__core' aria-hidden='true' />
      </div>
      <div className='stats-loader__copy'>
        <p className='stats-loader__label'>
          <span>{label}</span>
          <span className='stats-loader__dots' aria-hidden='true'>
            <span />
            <span />
            <span />
          </span>
        </p>
        {sublabel ? <p className='stats-loader__sub'>{sublabel}</p> : null}
      </div>
    </div>
  );
}
