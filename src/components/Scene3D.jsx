import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import ParticleField from './ParticleField'
import FloatingGeometry from './FloatingGeometry'

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0C0C0C']} />
        <fog attach="fog" args={['#0C0C0C', 10, 35]} />

        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.2} color="#14B8A6" />

        <ParticleField />
        <FloatingGeometry />

        <Preload all />
      </Canvas>
    </div>
  )
}
