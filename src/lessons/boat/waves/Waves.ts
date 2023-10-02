import * as THREE from "three";

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

const PLANE_WIDTH = 160;
const PLANE_SEGMENTS = 32;

class Waves extends THREE.Object3D {

  private material: THREE.Material;
  private geometry: THREE.BufferGeometry;
  private mesh: THREE.Mesh;
  
  constructor() {
    super();
    
    const material = new THREE.MeshBasicMaterial({
      color: 0x006BBB,
      side: THREE.DoubleSide,
    });

    // TODO: Make custom
    const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_WIDTH, PLANE_SEGMENTS, PLANE_SEGMENTS);
    geometry.rotateX(Math.PI / 2);

    const mesh = new THREE.Mesh(geometry, material);

    this.add(mesh);

    this.material = material;
    this.geometry = geometry;
    this.mesh = mesh;
  }


}

export default Waves;