import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, MeshProps, useFrame, useThree } from '@react-three/fiber'
import { useMaterial } from './useMaterial';
import { useControls } from 'leva';
import { useMouseDrag } from '../../hooks/useMouseDrag';
import { useLoadGeometryFromFile } from '../../hooks/useLoadGeometryFromFile';
import { getInfoFromFace } from '../../utils/faceHelpers';
import { useMountSingle } from '../../hooks/useMountSingle';
import {VineCrawler} from './VineCrawler';
import { useVineCrawler } from './useVineCrawler';

const CUBE_RES = 64;
const CUBE_SIZE = 3;


// TODO: Maybe move somewhere else?
interface IVineGrowerProps {
  controlRotation: [number, number];
  fileName?: MeshName;
  doSomething: boolean;
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

    const {
      vineCrawler,
      stepVine,
      line,
    } = useVineCrawler({geometry: geometry ?? null});

    useMountSingle(line, meshGroup);

    useEffect(() => {
      const geo = meshRaw?.geometry;
      if (!geo) {
        return;
      }
      const faces = geo.index?.array;
      if (!faces) {
        return;
      }
      if (!vineCrawler) {
        return;
      }
      // // const randomFaceIndex = Math.floor(Math.random() * faces.length / 3);
      // const randomFaceIndex = vineCrawler.getLowestFaceIndex();
      // console.log("ADDING", randomFaceIndex);
      // const info = getInfoFromFace(randomFaceIndex, geo)
      // if (info) {
      //   const arrowHelper = new THREE.ArrowHelper( info.normalVec, info.centerVec, 5, 0xff0000 );
      //   meshGroup.add(arrowHelper)
      // }
      stepVine();


    }, [
      props.doSomething,
      stepVine,
    ])

  return null;
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

  const {"Do Something": doSomething} = useControls({
    "Do Something": false,
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
    <Canvas style={{ width: '100%', height: '100%', background: '#000' }} camera={{ fov: 75, position: [0, -20, -5]}}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <VineGrower position={[0, 0, 0]} controlRotation={controlRotation} doSomething={doSomething} />

    </Canvas>
  )

}