import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

function WireShape({ geometry, position, scale = 1, speed = 1 }) {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation.x = t * 0.08 * speed
    ref.current.rotation.y = t * 0.12 * speed
  })

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={1}>
      <mesh ref={ref} position={position} scale={scale}>
        {geometry}
        <meshBasicMaterial color="#1c1c1c" wireframe transparent opacity={0.4} />
      </mesh>
    </Float>
  )
}

export default function FloatingGeometry() {
  return (
    <group>
      <WireShape
        geometry={<icosahedronGeometry args={[1, 1]} />}
        position={[-5, 2, -6]}
        scale={1.8}
        speed={0.5}
      />
      <WireShape
        geometry={<octahedronGeometry args={[1, 0]} />}
        position={[5, -2, -8]}
        scale={1.4}
        speed={0.7}
      />
      <WireShape
        geometry={<torusGeometry args={[1, 0.3, 12, 24]} />}
        position={[3, 3, -10]}
        scale={1}
        speed={0.4}
      />
      <WireShape
        geometry={<icosahedronGeometry args={[1, 0]} />}
        position={[-3, -3, -7]}
        scale={1.2}
        speed={0.6}
      />
    </group>
  )
}
