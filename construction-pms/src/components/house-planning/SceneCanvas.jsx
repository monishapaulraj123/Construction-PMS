/**
 * SceneCanvas.jsx
 * 3D Scene Canvas component powered by React Three Fiber & Drei styled for PMS
 */

import React, { Suspense } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { BuildingRenderer } from './BuildingRenderer'
import { useHousePlanning } from '../../context/HousePlanningContext'
import { useApp } from '../../context/AppContext'

export default function SceneCanvas() {
  const { cameraMode } = useHousePlanning()
  const { theme } = useApp()

  const isDark = theme === 'dark'
  const bgColor = isDark ? '#0F1F19' : '#f8f6f0'
  const cellColor = isDark ? '#1D362E' : '#e1d6bd'
  const sectionColor = isDark ? '#337362' : '#2f5d50'

  return (
    <div style={{ flexGrow: 1, height: '100%', position: 'relative', overflow: 'hidden', background: bgColor }}>
      <Canvas
        shadows={{ enabled: true, type: THREE.PCFShadowMap }}
        dpr={[1, 2]}
        camera={{ position: [15, 15, 15], fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={[bgColor]} />

        {/* Multi-directional Lighting */}
        <ambientLight intensity={isDark ? 0.8 : 0.7} />
        <directionalLight
          position={[15, 25, 12]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.00015}
        />
        <directionalLight position={[-15, 15, -12]} intensity={0.4} />
        <hemisphereLight args={['#d4b06a', '#244a3f', 0.5]} />

        {/* Reference Grid */}
        <Grid
          args={[60, 60]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={cellColor}
          sectionSize={5}
          sectionColor={sectionColor}
          sectionThickness={1.2}
          fadeDistance={60}
          position={[0, -0.01, 0]}
        />

        {/* Camera Controls */}
        {cameraMode === 'orbit' && (
          <OrbitControls makeDefault enableDamping dampingFactor={0.06} minDistance={2} maxDistance={120} />
        )}
        {cameraMode === 'topdown' && (
          <OrbitControls makeDefault target={[0, 0, 0]} enableRotate={false} minPolarAngle={0} maxPolarAngle={0.001} />
        )}
        {cameraMode === 'walkthrough' && (
          <OrbitControls makeDefault target={[0, 1.2, 0]} enableDamping dampingFactor={0.08} minDistance={1} maxDistance={30} />
        )}

        {/* HUD Viewport Indicator */}
        <GizmoHelper alignment="bottom-right" margin={[88, 88]}>
          <GizmoViewport axisColors={['#a24d43', '#4a927e', '#2f5d50']} labelColor={isDark ? '#F8F6F0' : '#262218'} />
        </GizmoHelper>

        {/* Scene Content */}
        <Suspense fallback={null}>
          <BuildingRenderer />
        </Suspense>
      </Canvas>
    </div>
  )
}
