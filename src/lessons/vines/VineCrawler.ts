import _ from 'lodash';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { generateUUID } from 'three/src/math/MathUtils';
import { setVectorInArray } from '../../utils/bufferHelpers';
import { getInfoFromFace } from "../../utils/faceHelpers";
import { FastCatmullRomCurve3 } from '../../utils/FastCatmullRomCurve3';

const _centerVec = new THREE.Vector3();
const _normalVec = new THREE.Vector3();
const _vertexIndexVec = new THREE.Vector3();

// TODO: Texture this
const tubeMat = new THREE.MeshBasicMaterial({
  color: 0x2D5A27,
})

export class VineCrawler {
  // This is the strict point geometry
  private uuid: string = generateUUID();
  private geometry: THREE.BufferGeometry;
  private rawLineGeometry: THREE.BufferGeometry;

  private facePositionInfo: Float32Array;
  private faceNormalInfo: Float32Array;
  private facesByVertexIndex: Record<number, Set<number>> = {};
  // todo: make getter or smthng and revert to private
  private lowestFaceIndex: number;

  private visitedFaceIndices: Set<number>;
  private nextFaceIndex: number;

  // private line: Line2;
  private line: THREE.Mesh;
  private doneCrawling: boolean;
  private localMaximumThreshold: number | undefined;
  private localMaximum: number;
  private lastFork: number = 0;

  constructor(geometry: THREE.BufferGeometry, localMaximumThreshold: number | undefined, cloneOpts?: {
    facePositionInfo: Float32Array;
    faceNormalInfo: Float32Array;
    facesByVertexIndex: Record<number, Set<number>>;
    lowestFaceIndex: number;
    visitedFaceIndices: Set<number>;
    nextFaceIndex: number;
    doneCrawling: boolean;
    rawLineGeometry: THREE.BufferGeometry;
    localMaximum: number;
  }) {
    this.geometry = geometry;
    this.localMaximumThreshold = localMaximumThreshold;

    if (cloneOpts) {
      this.facePositionInfo = cloneOpts.facePositionInfo;
      this.faceNormalInfo = cloneOpts.faceNormalInfo;
      this.facesByVertexIndex = cloneOpts.facesByVertexIndex;
      this.lowestFaceIndex = cloneOpts.lowestFaceIndex;
      this.visitedFaceIndices = cloneOpts.visitedFaceIndices;
      this.nextFaceIndex = cloneOpts.nextFaceIndex;
      this.doneCrawling = cloneOpts.doneCrawling;
      this.localMaximum = cloneOpts.localMaximum;
      this.rawLineGeometry = cloneOpts.rawLineGeometry;
      this.line = this.createLineStub();
      // this.rawLineGeometry = opts.rawLineGeometry;
      return;
    }

    if (!geometry.index) {
      throw new Error(`No face indices on geometry`);
    }

    const numFaces = geometry.index.array.length / 3;
    if (numFaces === 0) {
      throw new Error(`Empty geometry`)
    }

    this.facePositionInfo = new Float32Array(numFaces * 3);
    this.faceNormalInfo = new Float32Array(numFaces * 3);

    for (let faceIndex = 0; faceIndex < numFaces; faceIndex++) {
      getInfoFromFace(faceIndex, this.geometry, _normalVec, _centerVec, _vertexIndexVec);

      setVectorInArray(this.facePositionInfo, _centerVec, faceIndex * 3);
      setVectorInArray(this.faceNormalInfo, _normalVec, faceIndex * 3);

      _vertexIndexVec.toArray().forEach(vertexIndex => {
        this.facesByVertexIndex[vertexIndex] = this.facesByVertexIndex[vertexIndex] || new Set();
        this.facesByVertexIndex[vertexIndex].add(faceIndex);
      })
    }

    // Get face w/ smallest Z value
    const lowestFaces = _.sortBy(_.range(numFaces), faceIndex => this.facePositionInfo[faceIndex * 3 + 2]);
    this.lowestFaceIndex = _.first(lowestFaces)!;

    this.visitedFaceIndices = new Set();
    // this.nextFaceIndex = this.lowestFaceIndex;
    this.nextFaceIndex = _.sample(lowestFaces.slice(0, 5))!;
    this.doneCrawling = false;
    this.rawLineGeometry = (new THREE.BufferGeometry()).setFromPoints([]);
    this.line = this.createLineStub();
    this.localMaximum = -Infinity;
  }

  createLineStub = () => {
    return new THREE.Mesh(
      new THREE.BufferGeometry(),
      tubeMat,
    );
    // this.rawLineGeometry = new THREE.BufferGeometry().setFromPoints(
    //   [
    //     new THREE.Vector3(0, 0, 0),
    //     _centerVec,
    //   ]
    // )
    // return new Line2(
    //   // this.rawLineGeometry
    //   new LineGeometry().setPositions(
    //     this.rawLineGeometry.attributes.position.array.buffer as Float32Array
    //   ),
    //   lineMat
    // )
  }

  getInfoFromFaceFast = (faceIndex: number) => {
    _centerVec.fromArray(this.facePositionInfo, faceIndex * 3);
    _normalVec.fromArray(this.faceNormalInfo, faceIndex * 3);
    _vertexIndexVec.fromBufferAttribute(this.geometry.index!, faceIndex * 3);
  }

  getNeighborFaces = (faceIndex: number) => {
    _vertexIndexVec.fromBufferAttribute(this.geometry.index!, faceIndex * 3);

    const temp = (new Set<number>([
      ...this.facesByVertexIndex[_vertexIndexVec.x],
      ...this.facesByVertexIndex[_vertexIndexVec.y],
      ...this.facesByVertexIndex[_vertexIndexVec.z],
    ]))
    // remove ourself from neighbors list
    temp.delete(faceIndex);
    return temp;
  }

  // Takes a current face index and finds
  // * next highest face index
  //   * TODO later: bias this so we can put in the camera pos, etc. to resolve tie-breaks, etc.
  // * best point connecting faces (based on a few factors)
  // return null if we can't really go higher
  crawlHelper = (currentFaceIndex: number, visitedFaces: Set<number>) => {
    const neighbors = this.getNeighborFaces(currentFaceIndex);

    if (!neighbors.size) {
      return null;
    }

    // todo: make a fuzzy min
    // const bestFace = _.maxBy([...neighbors].map(
    //   faceIndex => ({ faceIndex, z: this.facePositionInfo[faceIndex * 3 + 2] })
    // ).filter(
    //   f => !visitedFaces.has(f.faceIndex)
    // ), v => v.z);

    
    // Keep as an array so we can be positive there'll be something to fork to if we choose to do so
    // But don't keep as array if we don't need to fork at all
    const shouldFork = this.shouldFork();

    const facesToCheck = [...neighbors].map(
      faceIndex => ({ faceIndex, z: this.facePositionInfo[faceIndex * 3 + 2] })
    ).filter(
      f => !visitedFaces.has(f.faceIndex)
    );

    const bestFaces = shouldFork ? _.sortBy(facesToCheck, v => v.z) : [_.maxBy(facesToCheck, v => v.z)!];
    const bestFace = _.last(bestFaces);

    if (!bestFace) {
      return null;
    }

    const { faceIndex: nextFaceIndex, z: nextFaceZ } = bestFace;

    // If we are going down by a LOT, stop
    if (this.localMaximumThreshold !== undefined && this.localMaximum - nextFaceZ > this.localMaximumThreshold) {
      return null;
    }

    this.localMaximum = Math.max(this.localMaximum, nextFaceZ);

    _vertexIndexVec.fromBufferAttribute(this.geometry.index!, currentFaceIndex * 3);
    const currentVertexIndices = _vertexIndexVec.toArray();
    _vertexIndexVec.fromBufferAttribute(this.geometry.index!, nextFaceIndex * 3);
    const nextVertexIndices = _vertexIndexVec.toArray();

    const sharedVertexIndices = _.intersection(currentVertexIndices, nextVertexIndices);

    const vectors = sharedVertexIndices.map(vertexIndex => new THREE.Vector3().fromBufferAttribute(this.geometry.getAttribute('position'), vertexIndex));

    const midpoint = vectors.reduce((acc, curr) => acc.add(curr)).divideScalar(vectors.length);
    _centerVec.fromArray(this.facePositionInfo, nextFaceIndex * 3);

    // const forkFaceIndex = this.shouldFork() && bestFaces.length > 3 ? bestFaces[Math.floor(bestFaces.length / 2)].faceIndex : undefined;
    // Use currentFaceIndex rather than random best face, so that we can continue from last point / have continual vine
    // Plus we'll auto filter the next face in this branch anyways
    const forkFaceIndex = shouldFork && bestFaces.length > 3 ? currentFaceIndex : undefined;
    
    return {
      geometryJump: (new THREE.BufferGeometry()).setFromPoints([
        midpoint,
        _centerVec,
      ]),
      nextFaceIndex,
      forkFaceIndex,
    }
  }

  createTubeGeometry = (curve: THREE.Curve<THREE.Vector3> | undefined, numPoints: number) => {
    const tg = new THREE.TubeGeometry(
      curve,
      numPoints * 4,
      0.05,
    );
    return tg;
  }

  crawl = (): {done: boolean, childrenToAdd: VineCrawler[]} => {
    if (this.doneCrawling) {
      return {
        done: true,
        childrenToAdd: [],
      };
    }

    // crawl index, update stuff
    const crawlRes = this.crawlHelper(
      this.nextFaceIndex,
      this.visitedFaceIndices,
    );

    this.visitedFaceIndices.add(this.nextFaceIndex);

    if (!crawlRes) {
      this.doneCrawling = true;
      return {
        done: true,
        childrenToAdd: [],
      };
    }

    const newGeo = BufferGeometryUtils.mergeGeometries([
      this.rawLineGeometry, crawlRes.geometryJump,
    ].filter((v): v is THREE.BufferGeometry => !!v));
    this.rawLineGeometry = newGeo;

    this.line.geometry = this.createTubeGeometry(
      (new THREE.CatmullRomCurve3(
        _.range(this.rawLineGeometry.attributes.position.array.length / 3).map(i => new THREE.Vector3().fromArray(
          this.rawLineGeometry.attributes.position.array,
          i * 3,
        ))
      )),
      this.getNumPoints() + 2,
    );
    
    this.nextFaceIndex = crawlRes.nextFaceIndex;

    return {
      done: false,
      // TODO: Update fork logic
      childrenToAdd: crawlRes.forkFaceIndex ? [this.clone(crawlRes.forkFaceIndex)] : [],
    };
  }
  
  shouldFork = (minToFork: number = 2) => {
    const vineLength = this.getNumPoints();
    const lengthSinceLastFork = vineLength - this.lastFork;

    if (lengthSinceLastFork <= minToFork) {
      return false;
    }

    // The more global entries we have, the fewer forks we want
    // Not totally sure what this does xd but it looks nicer
    const res = Math.random() > 1 / (lengthSinceLastFork - minToFork);

    if (res) {
      this.lastFork = vineLength;
    }
    return res;
  }

  getLine = () => {
    return this.line;
  }

  getLowestFaceIndex = () => {
    return this.lowestFaceIndex;
  }

  getNumPoints = () => {
    return this.rawLineGeometry.getAttribute('position').array.length / 3;
  }

  clone = (forkFaceIndex?: number, keepSomeGeometry: boolean = true) => {
    // Need to keep a chunk of last stuff so we don't make points appear from nowhere
    const newRawLineGeometry = this.rawLineGeometry.clone();
    if (keepSomeGeometry) {
      const numPoints = this.getNumPoints();
      newRawLineGeometry.setAttribute('position', new THREE.BufferAttribute(newRawLineGeometry.getAttribute('position').array.slice(
        Math.max((numPoints - 2) * 3, 0),
      ), 3))
    } else {
      newRawLineGeometry.setFromPoints([]);
    }

    return new VineCrawler(
      this.geometry,
      this.localMaximumThreshold,
      {
        facePositionInfo: this.facePositionInfo,
        faceNormalInfo: this.faceNormalInfo,
        facesByVertexIndex: this.facesByVertexIndex,
        lowestFaceIndex: this.lowestFaceIndex,
        // When cloning, choose to reuse visitedFaceIndices, so we don't overlap!
        // Might want to change later
        visitedFaceIndices: this.visitedFaceIndices,
        nextFaceIndex: forkFaceIndex ?? this.nextFaceIndex,
        doneCrawling: this.doneCrawling,
        rawLineGeometry: newRawLineGeometry,
        // rawLineGeometry: new THREE.BufferGeometry().setFromPoints([]),
        localMaximum: this.localMaximum,
      }
    )
  }

  dispose = () => {
    this.line.removeFromParent();
    this.rawLineGeometry.dispose();
  }

  toString = () => {
    return JSON.stringify({
      uuid: this.uuid,
      nextFaceIndex: this.nextFaceIndex,
      lastFork: this.lastFork,
      doneCrawling: this.doneCrawling,
    }, undefined, 2)
  }
}

(window as any).VineCrawler = VineCrawler