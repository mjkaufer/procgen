import { useMemo } from 'react';
import * as THREE from 'three';
import { MeshName } from "../utils/meshes";
import { useLoadGeometryFromFile } from './useLoadGeometryFromFile';
import { useMountSingle } from './useMountSingle';

interface IUseObjMeshProps {
  fileName: MeshName;
  material: THREE.Material;
  mountTo: THREE.Group;
  geometryTransform?: (geo: THREE.BufferGeometry) => void;
}
export function useObjMesh({
  fileName,
  material,
  mountTo,
  geometryTransform,
}: IUseObjMeshProps) {
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

    geometryTransform?.(rawGeometry);

    return rawGeometry;
  }, [rawGeometry, fileName, geometryTransform]);

  const meshRaw = useMemo(() => {
    if (!geometry || !material) {
      return null;
    }
    const m = new THREE.Mesh(geometry, material);
    (window as any).mesh = m;
    return m;
  }, [geometry, material]);

  useMountSingle(meshRaw, mountTo);

  return meshRaw;
}