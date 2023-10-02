import * as THREE from "three";


const BOAT_HEIGHT = 0.5;
const BOAT_WIDTH = 0.75;
const BOAT_DEPTH = 2;
class Boat extends THREE.Object3D {

  private material: THREE.Material;
  private geometry: THREE.BufferGeometry;
  private mesh: THREE.Mesh;

  private _velocity = new THREE.Vector3();
  
  constructor() {
    super();
    
    const material = new THREE.MeshBasicMaterial({
      color: 0xC19A6B,
    });

    // TODO: Make custom
    const geometry = new THREE.BoxGeometry(BOAT_WIDTH, BOAT_HEIGHT, BOAT_DEPTH);
    geometry.rotateX(Math.PI / 2.);

    const mesh = new THREE.Mesh(geometry, material);

    this.add(mesh);

    this.material = material;
    this.geometry = geometry;
    this.mesh = mesh;
  }

  get velocity() {
    return this._velocity;
  }

}

export default Boat;