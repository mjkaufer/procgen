import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, MeshProps, useFrame, useThree } from '@react-three/fiber'
import { useMaterial } from './useMaterial';
import { useControls } from 'leva';
import { useMouseDrag } from '../../hooks/useMouseDrag';
import { useLoadGeometryFromFile } from '../../hooks/useLoadGeometryFromFile';
import { MeshName } from '../../utils/meshes';
import { useMountSingle } from '../../hooks/useMountSingle';
import { useObjMesh } from '../../hooks/useObjMesh';
import { useOuterMaterial } from './useOuterMaterial';

const CUBE_RES = 64;
const CUBE_SIZE = 3;


interface IMainMeshProps {
  controlRotation: [number, number];
  pixelOffset: number;
  pixelSize: number;
}

function MainMesh(props: Partial<MeshProps> & IMainMeshProps) {

  const {
    controlRotation,
    pixelSize,
    pixelOffset,
  } = props;
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null);

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  const {scene} = useThree();

  const fileName = MeshName.Statue;

  const meshGroup = useMemo(() => {
    const g = new THREE.Group();
    return g;
  }, []);


  const {
    material,
  } = useMaterial({});

  scene.background = new THREE.Color(0xffb908);

  // const {
  //   material: outerMaterial,
  // } = useOuterMaterial({
  //   pixelOffset,
  //   pixelSize,
  // });

  // Main statue
  useObjMesh({
    fileName,
    material,
    mountTo: meshGroup,
  });
  
  // // Outer layer
  // useObjMesh({
  //   fileName,
  //   material: outerMaterial,
  //   mountTo: meshGroup,
  // });

  useMountSingle(meshGroup, scene);

  useFrame(
    (state, delta) => {
      if (meshGroup) {
        meshGroup.rotation.z = props.controlRotation[0]
        meshGroup.rotation.x = props.controlRotation[1]
      }
    });
    


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
      

    </mesh>
  )
}

const MOUSE_SCALING = 100;

export function Scene() {
  // Kind of strange, default threejs orientation is pain in butt for this idea, but don't
  // want to break everything else
  // TODO: Consolidate later
  useEffect(() => {

    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0,0,1);

    return () => {
      THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 1, 0);
    }
    
  }, [])

  const {
    "Mask Offset": pixelOffset,
    "Pixel Size": pixelSize,
  } = useControls({
    "Mask Offset": {
      min: 0.001,
      max: 0.2,
      value: 0.05
    },
    "Pixel Size": {
      min: 0.5,
      max: 4.,
      value: 1,
    }
  });

  const { mouseState, mouseTarget } = useMouseDrag({});

  const [controlRotation, setControlRotation] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!mouseState.isMouseDown) {
      return;
    }

    if (mouseTarget && (mouseTarget as HTMLDivElement).className.includes('leva-')) {
      return;
    }

    setControlRotation(([oldX, oldY]) => [
      oldX + mouseState.dx / MOUSE_SCALING,
      oldY + mouseState.dy / MOUSE_SCALING,
    ]);
  }, [mouseState, mouseState.dx, mouseState.dy, mouseTarget]);

  return (
    <Canvas style={{ width: '100%', height: '100%', background: '#000' }} camera={{ fov: 75, position: [0, -10, 0]}}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <MainMesh position={[0, 0, 0]} controlRotation={controlRotation} pixelOffset={pixelOffset} pixelSize={pixelSize}/>
    </Canvas>
  )

}