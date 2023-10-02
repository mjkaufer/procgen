import * as THREE from "three";

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';
import Boat from "../boat/Boat";

const PLANE_WIDTH = 16;
const PLANE_SEGMENTS = 32;

class Waves extends THREE.Object3D {

  private material: THREE.ShaderMaterial;
  private geometry: THREE.BufferGeometry;
  private mesh: THREE.Mesh;
  
  constructor() {
    super();
    
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      transparent: true,
      uniforms: {
        time: new THREE.Uniform(0),
      },
    });

    // TODO: Make custom
    const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_WIDTH, PLANE_SEGMENTS, PLANE_SEGMENTS);
    // geometry.rotateX(Math.PI / 2);

    const mesh = new THREE.Mesh(geometry, material);

    this.add(mesh);

    this.material = material;
    this.geometry = geometry;
    this.mesh = mesh;
  }

  // TODO: Spuport boat array?
  bindBoat = (boat: Boat) => {
    // TODO: Set uniforms
    // boatPosition, boatVelocity
  }

  setTime = (time: number) => {
    this.material.uniforms.time.value = time;
    // this.material
    this.material.needsUpdate = true;
  }


}

export default Waves;