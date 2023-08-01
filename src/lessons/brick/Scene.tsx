import { createRoot } from 'react-dom/client'
import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, MeshProps, ThreeElements, useFrame } from '@react-three/fiber'
import { Material } from './Material';

const black = new THREE.Color(0, 0, 0);
const red = new THREE.Color(0.5, 0, 0);
function Box(props: Partial<MeshProps>) {
  console.log("RERENDERING??")
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null);

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  useFrame(
    (state, delta) => {
      if (ref.current && hovered) {
        ref.current.rotation.y += delta;
        ref.current.rotation.z += delta;
      }
    });


  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
      >
      <boxGeometry args={[1, 1, 1]} />
      <Material color={hovered ? black : red}/>
      
    </mesh>
  )
}

export function Scene() {
  return (
    <Canvas style={{width: '100%', height: '100%'}}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[0, 0, 0]} />
    </Canvas>
  )
}