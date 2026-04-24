'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { getToken } from '@/lib/auth';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').trim() || 'https://otrix-dev.up.railway.app';

export default function VideogamePage() {
  const router = useRouter();
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

  const progressPct = Math.round(loadingProgression * 100);
  const stageLabel =
    progressPct < 10 ? 'Initializing runtime'
    : progressPct < 40 ? 'Loading engine'
    : progressPct < 80 ? 'Streaming assets'
    : progressPct < 100 ? 'Preparing scene'
    : 'Ready';

  return (
    <div className="videogame-stage">
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
