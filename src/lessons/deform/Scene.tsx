import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, MeshProps, useFrame, useThree } from '@react-three/fiber'
import { useMaterial } from './useMaterial';
import { useControls } from 'leva';
import { useMouseDrag } from '../../hooks/useMouseDrag';
import { useLoadGeometryFromFile } from '../../hooks/useLoadGeometryFromFile';
import { MeshName } from '../../utils/meshes';
import { useMountSingle } from '../../hooks/useMountSingle';

const CUBE_RES = 64;
const CUBE_SIZE = 3;


interface IMainMeshProps {
  controlRotation: [number, number];
}
function MainMesh(props: Partial<MeshProps> & IMainMeshProps) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null);

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  const {scene} = useThree();

  const fileName = MeshName.Statue;
  const {
    geometry: rawGeometry
  } = useLoadGeometryFromFile({
    fileName,
  })

  const geometry = useMemo(() => {
    if (!rawGeometry) {
      return rawGeometry;
    }

    if (fileName === MeshName.Statue) {
      const scale = 0.0625;
      // mutates geometry's underlying points
      rawGeometry.scale(scale, scale, scale);
      // rawGeometry.rotateY(-Math.PI / 2);
      rawGeometry.center();
      rawGeometry.computeBoundingBox();

    }
    return rawGeometry;
  }, [rawGeometry, fileName]);


  const meshGroup = useMemo(() => {
    const g = new THREE.Group();
    // g.translateZ(-5);
    return g;
  }, []);

  const bbox = useMemo(() => {
    if (!geometry) {
      return null;
    }
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }

    return geometry.boundingBox;
  }, [geometry])


  const {
    material,
  } = useMaterial({
    bbox,
  });

  const meshRaw = useMemo(() => {
    if (!geometry || !material) {
      return null;
    }
    const m = new THREE.Mesh(geometry, material);
    (window as any).mesh = m;
    return m;
  }, [geometry, material]);

  useMountSingle(meshRaw, meshGroup);
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

  // const {
  // } = useControls({
  // });

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
    <Canvas style={{ width: '100%', height: '100%', background: '#000' }} camera={{ fov: 75, position: [0, -10, 0]}}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <MainMesh position={[0, 0, 0]} controlRotation={controlRotation}/>
    </Canvas>
  )

}