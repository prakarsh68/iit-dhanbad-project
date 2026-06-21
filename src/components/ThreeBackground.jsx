import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function RotatingGrid() {
  const meshRef1 = useRef();
  const meshRef2 = useRef();
  const pointsRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef1.current) {
      meshRef1.current.rotation.y = time * 0.03;
      meshRef1.current.rotation.x = time * 0.015;
    }
    if (meshRef2.current) {
      meshRef2.current.rotation.y = -time * 0.02;
      meshRef2.current.rotation.z = time * 0.01;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = -time * 0.01;
      pointsRef.current.rotation.x = time * 0.005;
    }
  });

  // Create floating particle system
  const count = 300;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Create a nice distribution sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 4 + Math.random() * 8; // distributed between radius 4 and 12

      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Outer wireframe sphere */}
      <mesh ref={meshRef1}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial 
          color="#00f7ff" 
          wireframe 
          transparent 
          opacity={0.06} 
        />
      </mesh>

      {/* Inner wireframe torus knot */}
      <mesh ref={meshRef2}>
        <torusKnotGeometry args={[2.5, 0.4, 64, 8, 3, 5]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          wireframe 
          transparent 
          opacity={0.08} 
        />
      </mesh>

      {/* Classy floating starfield */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#00f7ff"
          size={0.05}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.35}
        />
      </points>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: -1,
      pointerEvents: "none",
      opacity: 0.6,
      background: "radial-gradient(circle at 50% 30%, #030712 0%, #020408 100%)"
    }}>
      <Canvas camera={{ position: [0, 0, 9], fov: 60 }}>
        <RotatingGrid />
      </Canvas>
    </div>
  );
}
