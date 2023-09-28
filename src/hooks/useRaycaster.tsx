import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useMouseDrag } from "./useMouseDrag";

interface IUseRaycasterProps {
}

export function useRaycaster({}: IUseRaycasterProps = {}) {
  const { mouseState } = useMouseDrag({});
  const raycaster = useMemo(() => {
    return new THREE.Raycaster();
  }, []);
  const { camera, mouse } = useThree();

  useEffect(() => {
    raycaster.setFromCamera( mouse, camera );
  }, [raycaster, mouse, camera, mouseState.x, mouseState.y]);
  
  const getIntersection = useCallback((target: THREE.Object3D[]) => {
    return raycaster.intersectObjects(target);
  }, [raycaster])
  

  return {
    getIntersection,
    raycaster,
  }
}