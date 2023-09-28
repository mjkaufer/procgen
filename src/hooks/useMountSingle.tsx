import { useMemo } from 'react';
import * as THREE from 'three';
import { useMountMany } from './useMountMany';

export function useMountSingle(object: THREE.Object3D | null, parent: THREE.Object3D) {

  const objectArr = useMemo(() => {
    return object === null ? [] : [object];
  }, [object]);

  useMountMany(objectArr, parent)

}