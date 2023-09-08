import { useEffect } from 'react';
import * as THREE from 'three';
export function useMountSingle(object: THREE.Object3D | null, parent: THREE.Object3D) {

  useEffect(() => {
    object && parent.add(object);
    return () => {
      object && parent.remove(object);
    }
  }, [object, parent]);

}