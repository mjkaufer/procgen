import * as THREE from 'three';
// todo: make work for all typed arrays
export function setVectorInArray(array: Float32Array, vec: THREE.Vector3, absoluteIndex: number) {
  array[absoluteIndex] = vec.x;
  array[absoluteIndex + 1] = vec.y;
  array[absoluteIndex + 2] = vec.z;

}