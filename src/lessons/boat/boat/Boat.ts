import * as THREE from "three";

class Boat extends THREE.Object3D {

  private material: THREE.Material;
  private geometry: THREE.BufferGeometry;
  private mesh: THREE.Mesh;
  
  constructor() {
    super();
    
    const material = new THREE.MeshBasicMaterial({
      color: 0xC19A6B,
    });

    // TODO: Make custom
    const geometry = new THREE.BoxGeometry();

    const mesh = new THREE.Mesh(geometry, material);

    this.add(mesh);

    this.material = material;
    this.geometry = geometry;
    this.mesh = mesh;
  }


}

export default Boat;