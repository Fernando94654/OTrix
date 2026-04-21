"use client";

import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import Link from 'next/link';

export default function VideogamePage() {
  // Configuración de los archivos que moviste a /public/unity/Build
  const { unityProvider } = useUnityContext({
    loaderUrl: "/unity/Build/juego2.loader.js", // CAMBIA "tu-archivo" por el nombre real
    dataUrl: "/unity/Build/juego2.data",
    frameworkUrl: "/unity/Build/juego2.framework.js",
    codeUrl: "/unity/Build/juego2.wasm",
  });

  return (
    <div className='container app-page d-flex flex-column justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
      <div className='panel-card videogame-card p-4 bg-white shadow-lg rounded text-center'>
        <h2 className='videogame-title mb-3'>Videogame</h2>
        
        {/* Contenedor del Juego */}
        <div className="unity-wrapper mb-4" style={{ width: "100%", 
          maxWidth: "960px", 
          margin: "0 auto", // Esto centra el juego
          aspectRatio: "16 / 9", 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          overflow: 'hidden', 
          backgroundColor: '#f000'}}>
          <Unity unityProvider={unityProvider} style={{ width: "100%", height: "100%" }} /> 
        </div>

        <div className='d-grid gap-2 d-md-flex justify-content-md-center'>
          <Link href='/stats' className='btn btn-outline-secondary px-4'>
            View stats
          </Link>
          <Link href='/' className='btn btn-custom px-5'>
            Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
}
