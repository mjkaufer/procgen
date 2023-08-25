import { createRoot } from 'react-dom/client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, MeshProps, ThreeElements, useFrame } from '@react-three/fiber'
import { useMaterial } from './useMaterial';
import { useControls } from 'leva';
import { useMouseDrag } from '../../hooks/useMouseDrag';

const black = new THREE.Color(0, 0, 0);
const red = new THREE.Color(0.5, 0, 0);

const CUBE_RES = 64;
const CUBE_SIZE = 3;

const PLANE_RES = 128;
const PLANE_SIZE = 5;

const SPHERE_RES = 128;
const SPHERE_SIZE = 3;

enum BrickShape {
  Wall = 'Wall',
  Cube = 'Cube',
  Sphere = 'Sphere',
}

interface IBrickProps {
  controlRotation: [number, number];
  temporalPan: boolean;
  shape: BrickShape;
}
function Brick(props: Partial<MeshProps> & IBrickProps) {
  console.log("RERENDERING??")
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null);

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  useFrame(
    (state, delta) => {
      // if (ref.current && hovered) {
      //   ref.current.rotation.y += delta;
      //   ref.current.rotation.z += delta;
      // }
      // state.camera.position.z += (Math.sin(+new Date() / 1000) / 30);
      // state.camera.position.x += (Math.cos(+new Date() / 1000) / 30);
      if (ref.current) {
        ref.current.rotation.y = props.controlRotation[0]
        ref.current.rotation.x = props.controlRotation[1]
      }
    });

  const {
    material,
  } = useMaterial({
    color: hovered ? black : red,
    hovered,
    temporalPan: props.temporalPan,
  })


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
      {props.shape === BrickShape.Cube && (
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, CUBE_RES, CUBE_RES, CUBE_RES]} />
      )}
      {props.shape === BrickShape.Wall && (
        <planeGeometry args={[PLANE_SIZE, PLANE_SIZE, PLANE_RES, PLANE_RES]} />
      )}

      {props.shape === BrickShape.Sphere && (
        // <planeGeometry args={[PLANE_SIZE, PLANE_SIZE, PLANE_RES, PLANE_RES]} />
        <sphereGeometry args={[SPHERE_SIZE, SPHERE_RES]} />
      )}
      

    </mesh>
  )
}

const MOUSE_SCALING = 100;

export function Scene() {
  const { "Animate Bricks": temporalPan, Shape } = useControls({
    "Animate Bricks": {
      value: false,
    },
    Shape: {
      value: BrickShape.Cube,
      options: Object.values(BrickShape),
    }
  })

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
      <Brick position={[0, 0, 0]} controlRotation={controlRotation} temporalPan={temporalPan} shape={Shape} />
    </Canvas>
  )

}