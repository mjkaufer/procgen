import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, MeshProps, useFrame } from '@react-three/fiber'
import { useMaterial } from './useMaterial';
import { useControls } from 'leva';
import { useMouseDrag } from '../../hooks/useMouseDrag';

const CUBE_RES = 64;
const CUBE_SIZE = 3;


interface IMainMeshProps {
  controlRotation: [number, number];
  lightingAtCamera: boolean;
  moveLight: boolean;
}
function MainMesh(props: Partial<MeshProps> & IMainMeshProps) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null);

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  const startTime = useMemo(() => {
    return +new Date() / 1000
  }, [])

  useFrame(
    (state, delta) => {
      // if (ref.current && hovered) {
      //   ref.current.rotation.y += delta;
      //   ref.current.rotation.z += delta;
      // }
      // state.camera.position.z += (Math.sin(+new Date() / 1000) / 30);
      // state.camera.position.x += (Math.cos(+new Date() / 1000) / 30);
      if (ref.current) {
        const offset = (+new Date() / 1000) - startTime;
        ref.current.rotation.y = props.controlRotation[0]
          // + Math.sin(offset / 4.0) * 0.75;
        ref.current.rotation.x = props.controlRotation[1]
          // + Math.sin(offset / 4.0) * 0.5;
      }
    });

  const {
    material,
  } = useMaterial({ lightingAtCamera: props.lightingAtCamera, moveLight: props.moveLight })


  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      // onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
      material={material}
    >
      {/* <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, CUBE_RES, CUBE_RES, CUBE_RES]} /> */}
      <torusKnotGeometry args={[
        1, // radius
        0.25, // tube thickness
        100, // tube segments
        30, // rad segments
        2, // idk lol
        7, // num twists
      ]} />


    </mesh>
  )
}

const MOUSE_SCALING = 100;

export function Scene() {
  const {
    "Ambient Light": lightingAtCamera,
    "Move Light": moveLight,
  } = useControls({
    "Ambient Light": false,
    "Move Light": true,
  });

  const { mouseState } = useMouseDrag({});

  const [controlRotation, setControlRotation] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!mouseState.isMouseDown) {
      return;
    }
    setControlRotation(([oldX, oldY]) => [
      oldX + mouseState.dx / MOUSE_SCALING,
      oldY + mouseState.dy / MOUSE_SCALING,
    ])
  }, [mouseState, mouseState.dx, mouseState.dy])

  return (
    <Canvas style={{ width: '100%', height: '100%', background: '#000' }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <MainMesh position={[0, 0, 0]} controlRotation={controlRotation} lightingAtCamera={lightingAtCamera} moveLight={moveLight} />
    </Canvas>
  )

}