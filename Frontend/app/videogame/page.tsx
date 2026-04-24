'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { getToken } from '@/lib/auth';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').trim() || 'https://otrix-dev.up.railway.app';

export default function VideogamePage() {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: '/unity/Build/buildwebGL.loader.js',
    dataUrl: '/unity/Build/buildwebGL.data',
    frameworkUrl: '/unity/Build/buildwebGL.framework.js',
    codeUrl: '/unity/Build/buildwebGL.wasm',
  });

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  useEffect(() => {
    if (!isLoaded) return;
    const token = getToken();
    if (!token) return;
    sendMessage('GameBridge', 'SetSession', JSON.stringify({ token, apiUrl: API_URL }));
  }, [isLoaded, sendMessage]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      stageRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  const progressPct = Math.round(loadingProgression * 100);
  const stageLabel =
    progressPct < 10 ? 'Initializing runtime'
    : progressPct < 40 ? 'Loading engine'
    : progressPct < 80 ? 'Streaming assets'
    : progressPct < 100 ? 'Preparing scene'
    : 'Ready';

  return (
    <div className="videogame-stage" ref={stageRef}>
      <div className="videogame-stage__inner">
        <header className="videogame-hud">
          <div className="videogame-hud__left">
            <h1 className="videogame-hud__title">OTrix</h1>
          </div>
          <div className="videogame-hud__right">
            <span className={`videogame-hud__status ${isLoaded ? 'is-live' : 'is-loading'}`}>
              <span className="videogame-hud__dot" />
              {isLoaded ? 'Session live' : `Loading ${progressPct}%`}
            </span>
            <button
              type="button"
              className="videogame-hud__fullscreen"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              aria-pressed={isFullscreen}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 4v5H4M20 9h-5V4M4 15h5v5M15 15h5v5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          </div>
        </header>

        <div className="videogame-canvas">
          <div className="videogame-canvas__frame">
            <Unity unityProvider={unityProvider} style={{ width: '100%', height: '100%' }} />
            {!isLoaded && (
              <div className="videogame-loader" role="status" aria-live="polite" aria-label={`Loading ${progressPct}%`}>
                <div className="videogame-loader__grid" aria-hidden="true" />
                <div className="videogame-loader__glow" aria-hidden="true" />
                <div className="videogame-loader__content">
                  <div className="videogame-loader__brand">
                    <span className="videogame-loader__mark" aria-hidden="true" />
                    <span className="videogame-loader__wordmark">OTRIX</span>
                  </div>

                  <div className="videogame-loader__meter">
                    <div className="videogame-loader__percent">
                      <span className="videogame-loader__percent-value">{String(progressPct).padStart(2, '0')}</span>
                      <span className="videogame-loader__percent-unit">%</span>
                    </div>
                    <div className="videogame-loader__track">
                      <div
                        className="videogame-loader__fill"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="videogame-loader__ticks" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="videogame-loader__status">
                    <span className="videogame-loader__status-dot" aria-hidden="true" />
                    <span className="videogame-loader__status-label">{stageLabel}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
