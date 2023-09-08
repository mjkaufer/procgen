import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, MeshProps, useFrame, useThree } from '@react-three/fiber'
import { useMaterial } from './useMaterial';
import { useControls } from 'leva';
import { useMouseDrag } from '../../hooks/useMouseDrag';
import { useLoadGeometryFromFile } from '../../hooks/useLoadGeometryFromFile';

const CUBE_RES = 64;
const CUBE_SIZE = 3;


// TODO: Maybe move somewhere else?
interface IVineGrowerProps {
  controlRotation: [number, number];
  fileName?: string;
}

enum MeshName {
  Statue = 'meshes/statue.obj',
}


function VineGrower(props: Partial<MeshProps> & IVineGrowerProps) {

  const fileName = props.fileName ?? MeshName.Statue;


  const {
    material,
  } = useMaterial({});

  const {
    scene,
  } = useThree();

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
      rawGeometry.scale(scale, scale, scale);
      rawGeometry.rotateX(-Math.PI / 2);
      rawGeometry.center();
      rawGeometry.computeBoundingBox();

    }
    return rawGeometry;
  }, [rawGeometry, fileName]);


  const meshRaw = useMemo(() => {
    if (!geometry || !material) {
      return null;
    }
    const m = new THREE.Mesh(geometry, material);
    m.translateZ(-5);
    return m;
  }, [geometry, material]);

  useFrame(
    (state, delta) => {
      if (meshRaw) {
        meshRaw.rotation.y = props.controlRotation[0]
        meshRaw.rotation.x = props.controlRotation[1]
      }
    });

    useEffect(() => {
      meshRaw && scene.add(meshRaw);

      return () => {
        meshRaw && scene.remove(meshRaw);
      }
    }, [meshRaw, scene])

  return null;
}

const MOUSE_SCALING = 100;

export function Scene() {

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
      <VineGrower position={[0, 0, 0]} controlRotation={controlRotation} />
    </Canvas>
  )

}