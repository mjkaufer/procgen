import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, MeshProps, useFrame } from '@react-three/fiber'

import { useBoatController } from './boat/useBoatController';
import Boat from './boat/Boat';
import Waves from './waves/Waves';

export function Scene() {


  const boat = useMemo(() => {
    return new Boat();
  }, []);

  useBoatController({boat});

  const waves = useMemo(() => {
    return new Waves();
  }, []);
  
  return (
    <Canvas style={{ width: '100%', height: '100%', background: '#000' }} camera={{ fov: 75, position: [10, 10, 0]}}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <primitive object={boat}/>
      <primitive object={waves}/>
    </Canvas>
  )

}