import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, MeshProps, useFrame } from '@react-three/fiber'
import { useMaterial } from './useMaterial';
import { useControls } from 'leva';
import { useMouseDrag } from '../../hooks/useMouseDrag';
import { EffectComposer } from '@react-three/postprocessing';
import { SceneEffect, SceneEffectChoice } from './SceneEffect';


interface IMainMeshProps {
  controlRotation: [number, number];
  lightingAtCamera?: boolean;
}
function MainMesh(props: Partial<MeshProps> & IMainMeshProps) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null);

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  useFrame(
    (state, delta) => {
      if (ref.current) {
        ref.current.rotation.x = -props.controlRotation[0]
        ref.current.rotation.z = props.controlRotation[1]
      }
    });

  const {
    material,
  } = useMaterial({lightingAtCamera: props.lightingAtCamera ?? true})


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
      <torusKnotGeometry args={[
          1, // radius
          0.25, // tube thickness
          50, // tube segments
          20, // rad segments
          1,
          3,
        ]} />


    </mesh>
  )
}

const MOUSE_SCALING = 100;
const effectChoiceOptions = Object.values(SceneEffectChoice);

const lightingAtCamera = true;
export function Scene() {
  const {
    "Effect Choice": effectChoice,
  } = useControls({
    "Effect Choice": {
      value: SceneEffectChoice.MouseWeightedSwirl,
      options: effectChoiceOptions,
    },
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
      <MainMesh position={[0, 0, 0]} controlRotation={controlRotation} lightingAtCamera={lightingAtCamera}/>
      <EffectComposer>
        <SceneEffect sceneEffect={effectChoice}/>
        
      </EffectComposer>
    </Canvas>
  )

}