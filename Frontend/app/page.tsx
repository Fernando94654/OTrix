import Link from 'next/link';

export default function HomePage() {
  return (
    <div className='home'>
      <HeroSection />
      {/* <MetricsStrip /> */}
      <FeaturesSection />
      <HowItWorksSection />
      {/* <RockwellSection /> */}
      <ClosingCta />
    </div>
  );
}

function HeroSection() {
  return (
    <section className='home-hero'>
      <div className='app-shell-container home-hero__inner'>
        <div className='home-hero__copy'>
          <span className='home-chip'>
            <span className='home-chip__dot' />
            Powered by Rockwell Automation
          </span>
          <h1 className='home-hero__title'>
            Train your instincts.
            <span className='home-hero__title-accent'> Defend the factory floor.</span>
          </h1>
          <p className='home-hero__sub'>
            OTrix is an immersive cybersecurity simulation where operators, engineers and
            analysts sharpen their response to real-world industrial threats, one scenario at a time.
          </p>
          <div className='home-hero__actions'>
            <Link href='/videogame' className='home-btn home-btn--primary'>
              <span>Enter the simulation</span>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M5 12h14M13 6l6 6-6 6' stroke='currentColor' strokeWidth='2' fill='none' strokeLinecap='round' strokeLinejoin='round'/>
              </svg>
            </Link>
            <Link href='/me/progress' className='home-btn home-btn--ghost'>
              View your progress
            </Link>
          </div>
          <div className='home-hero__meta'>
            <span><b>Browser-based</b> · no install</span>
            <span className='home-hero__meta-sep' />
            <span><b>WebGL</b> powered</span>
            <span className='home-hero__meta-sep' />
            <span><b>Work in progress</b> · new scenarios shipping</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricsStrip() {
  const items = [
    { label: 'Scenarios' },
    { label: 'Active operators' },
    { label: 'Completion rate' },
    { label: 'Always online' }
  ];
  return (
    <section className='home-metrics'>
      <div className='app-shell-container home-metrics__inner'>
        <div className='home-metrics__badge'>
          <span className='home-chip__dot' />
          Live metrics · available soon
        </div>
        <div className='home-metrics__grid'>
          {items.map((item) => (
            <div key={item.label} className='home-metric'>
              <div className='home-metric__value home-metric__value--placeholder' aria-hidden='true'>—</div>
              <div className='home-metric__label'>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
          <path d='M12 2L3 6v6c0 5 3.8 9.3 9 10 5.2-.7 9-5 9-10V6l-9-4z' strokeLinejoin='round'/>
          <path d='M9 12l2 2 4-4' strokeLinecap='round' strokeLinejoin='round'/>
        </svg>
      ),
      title: 'Simulation over slides',
      body: 'Learn by doing. Every scenario drops you inside a plant network with live consequences, not a quiz.'
    },
    {
      icon: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
          <circle cx='12' cy='12' r='9'/>
          <path d='M12 3a9 9 0 0 1 0 18M3 12h18' strokeLinecap='round'/>
        </svg>
      ),
      title: 'Industrial-grade threats',
      body: 'Scenarios modelled on real incidents, from OT spear-phishing to PLC firmware tampering.'
    },
    {
      icon: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
          <path d='M3 20V10M9 20V4M15 20v-7M21 20v-3' strokeLinecap='round'/>
        </svg>
      ),
      title: 'Deep analytics',
      body: 'Personal dashboards and org-wide heatmaps show exactly where training is moving the needle.'
    },
    {
      icon: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
          <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' strokeLinecap='round'/>
        </svg>
      ),
      title: 'Ready in a browser',
      body: 'Powered by WebGL. No installs, no IT tickets, just a URL and your workforce is training.'
    }
  ];

  return (
    <section className='home-section'>
      <div className='app-shell-container'>
        <header className='home-section__header'>
          <span className='home-section__eyebrow'>Why OTrix</span>
          <h2 className='home-section__title'>Built for the people who keep the plant running.</h2>
          <p className='home-section__sub'>
            A training platform engineered around the reality of industrial operations, not a generic
            corporate LMS with a cyber chapter bolted on.
          </p>
        </header>

        <div className='home-features'>
          {features.map((f) => (
            <article key={f.title} className='home-feature'>
              <div className='home-feature__icon'>{f.icon}</div>
              <h3 className='home-feature__title'>{f.title}</h3>
              <p className='home-feature__body'>{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Enter the simulation',
      body: 'Launch the OTrix arcade and pick a scenario matched to your role and current skill level.'
    },
    {
      num: '02',
      title: 'Face the threat',
      body: 'React in real time to intrusions, anomalies and social-engineering attempts on the factory floor.'
    },
    {
      num: '03',
      title: 'Track your evolution',
      body: 'Review your score trend, attempt distribution and completion rate and see how your org stacks up.'
    }
  ];

  return (
    <section className='home-section home-section--steps'>
      <div className='app-shell-container'>
        <header className='home-section__header'>
          <span className='home-section__eyebrow'>How it works</span>
          <h2 className='home-section__title'>Three steps between you and a safer plant.</h2>
        </header>

        <ol className='home-steps'>
          {steps.map((step, idx) => (
            <li key={step.num} className='home-step'>
              <div className='home-step__num'>{step.num}</div>
              <div className='home-step__body'>
                <h3 className='home-step__title'>{step.title}</h3>
                <p className='home-step__text'>{step.body}</p>
              </div>
              {idx < steps.length - 1 && <div className='home-step__connector' aria-hidden='true' />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function RockwellSection() {
  return (
    <section className='home-rockwell'>
      <div className='app-shell-container home-rockwell__inner'>
        <div className='home-rockwell__brand'>
          <img src='/img/Rockwell_Automation_Logo.png' alt='Rockwell Automation' />
        </div>
        <div className='home-rockwell__copy'>
          <span className='home-section__eyebrow'>Built by</span>
          <h2 className='home-section__title'>The Rockwell Automation team.</h2>
          <p className='home-section__sub'>
            OTrix is an internal project by the Rockwell Automation team, exploring how game-based
            simulation can be used for cybersecurity awareness in industrial environments.
          </p>
          <p className='home-section__sub home-rockwell__note'>
            This is an early work-in-progress build, scenarios, content and dashboards are
            actively being designed.
          </p>
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className='home-closing'>
      <div className='app-shell-container home-closing__inner'>
        <div className='home-closing__card'>
          <span className='home-chip home-chip--dark'>
            <span className='home-chip__dot' />
            Ready when you are
          </span>
          <h2 className='home-closing__title'>Your next shift is a simulation away.</h2>
          <p className='home-closing__sub'>
            Jump into the arcade, run a scenario, and come out sharper than you walked in.
          </p>
          <div className='home-closing__actions'>
            <Link href='/videogame' className='home-btn home-btn--primary home-btn--large'>
              <span>Launch the arcade</span>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M5 12h14M13 6l6 6-6 6' stroke='currentColor' strokeWidth='2' fill='none' strokeLinecap='round' strokeLinejoin='round'/>
              </svg>
            </Link>
            <Link href='/signin' className='home-btn home-btn--ghost home-btn--large'>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
