import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, MeshProps, useFrame, useThree } from '@react-three/fiber'

import { BoatController } from './boat/BoatController';
import Boat from './boat/Boat';
import Waves from './waves/Waves';
import { WavesController } from './waves/WavesController';

export function Scene() {


  useEffect(() => {

    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0,0,1);

    return () => {
      THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 1, 0);
    }
    
  }, []);

  // const {camera} = useThree();

  // camera.lookAt(new THREE.Vector3());
  // useEffect(() => {
  // }, [camera]);


  // Boat Controller needs access to scene, boat
  // Wave needs access to Boat Controller content

  // Option 1. Define boat obj in Scene, BoatController which renders primitive
  // Can store boat metadata inside of boat?
  // Then define wave obj in scene, and its controller / updater can take in boat or smthng?

  const boat = useMemo(() => {
    return new Boat();
  }, []);


  const waves = useMemo(() => {
    return new Waves();
  }, []);

  return (
    <Canvas style={{ width: '100%', height: '100%', background: '#000' }} camera={{ fov: 75, position: [0, -5, 2.5]}}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      
      <BoatController boat={boat}/>
      <WavesController waves={waves}/>
    </Canvas>
  )

}