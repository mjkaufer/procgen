import * as THREE from 'three';
import {Face} from 'three/examples/jsm/math/ConvexHull';

const _tri = new THREE.Triangle();

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _d = new THREE.Vector3();

// let _vi0, _vi1, _vi2 = 0;

export function getInfoFromFace(
  faceIndex: number,
  geometry: THREE.BufferGeometry,
  normalVec: THREE.Vector3 = new THREE.Vector3(),
  centerVec: THREE.Vector3 = new THREE.Vector3(),
  vertexIndexVec: THREE.Vector3 = new THREE.Vector3(),
) {

  if (!geometry.index) {
    throw new Error(`No face indices on geometry`);
  }

  const positions = geometry.getAttribute('position') as THREE.BufferAttribute | null;

  if (!positions) {
    throw new Error(`No positions attribute on geometry`);
  }

  vertexIndexVec.fromBufferAttribute(geometry.index, faceIndex * 3);

  _a.fromBufferAttribute(positions, vertexIndexVec.x);
  _b.fromBufferAttribute(positions, vertexIndexVec.y);
  _c.fromBufferAttribute(positions, vertexIndexVec.z);

  centerVec.set(0, 0, 0).add(_a).add(_b).add(_c).divideScalar(3);

  // Mutation of _a, _b, _c starts now!
  normalVec.copy(_b.sub(_a).cross(_c.sub(_a)).normalize())

  return {
    normalVec,
    centerVec,
    vertexIndexVec,
  }
}