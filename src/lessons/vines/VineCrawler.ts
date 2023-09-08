import _ from 'lodash';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { setVectorInArray } from '../../utils/bufferHelpers';
import { getInfoFromFace } from "../../utils/faceHelpers";


const _centerVec = new THREE.Vector3();
const _normalVec = new THREE.Vector3();
const _vertexIndexVec = new THREE.Vector3();

const lineMat = new THREE.LineBasicMaterial({
  color: 0x00ff00,
  linewidth: 5,
  vertexColors: true,
  alphaToCoverage: true,
})

export class VineCrawler {
  // This is the strict point geometry
  private geometry: THREE.BufferGeometry;

  private facePositionInfo: Float32Array;
  private faceNormalInfo: Float32Array;
  private facesByVertexIndex: Record<number, Set<number>> = {};
  // todo: make getter or smthng and revert to private
  private lowestFaceIndex: number;

  private visitedFaceIndices: Set<number>;
  private nextFaceIndex: number;

  private line: THREE.Line;
  private doneCrawling: boolean;

  constructor(geometry: THREE.BufferGeometry, opts?: {
    facePositionInfo: Float32Array;
    faceNormalInfo: Float32Array;
    facesByVertexIndex: Record<number, Set<number>>;
    lowestFaceIndex: number;
    visitedFaceIndices: Set<number>;
    nextFaceIndex: number;
    doneCrawling: boolean;
  }) {
    this.geometry = geometry;

    if (opts) {
      this.facePositionInfo = opts.facePositionInfo;
      this.faceNormalInfo = opts.faceNormalInfo;
      this.facesByVertexIndex = opts.facesByVertexIndex;
      this.lowestFaceIndex = opts.lowestFaceIndex;
      this.visitedFaceIndices = opts.visitedFaceIndices;
      this.nextFaceIndex = opts.nextFaceIndex;
      this.doneCrawling = opts.doneCrawling;
      this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        _centerVec.fromArray(this.facePositionInfo, this.nextFaceIndex)
      ]), lineMat);
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
    this.lowestFaceIndex = _.minBy(_.range(numFaces), faceIndex => this.facePositionInfo[faceIndex * 3 + 2])!;

    this.visitedFaceIndices = new Set();
    this.nextFaceIndex = this.lowestFaceIndex;
    this.doneCrawling = false;
    this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      _centerVec.fromArray(this.facePositionInfo, this.nextFaceIndex)
    ]), lineMat);
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
    const bestFace = _.maxBy([...neighbors].map(
      faceIndex => ({faceIndex, z: this.facePositionInfo[faceIndex * 3 + 2]})
    ).filter(
      f => !visitedFaces.has(f.faceIndex)
    ), v => v.z);

    if (!bestFace) {
      return null;
    }

    const {faceIndex: nextFaceIndex, z: nextFaceZ} = bestFace;

    _vertexIndexVec.fromBufferAttribute(this.geometry.index!, currentFaceIndex * 3);
    const currentVertexIndices = _vertexIndexVec.toArray();
    _vertexIndexVec.fromBufferAttribute(this.geometry.index!, nextFaceIndex * 3);
    const nextVertexIndices = _vertexIndexVec.toArray();

    const sharedVertexIndices = _.intersection(currentVertexIndices, nextVertexIndices);

    const vectors = sharedVertexIndices.map(vertexIndex => new THREE.Vector3().fromBufferAttribute(this.geometry.getAttribute('position'), vertexIndex));

    const midpoint = vectors.reduce((acc, curr) => acc.add(curr)).divideScalar(vectors.length);
    _centerVec.fromArray(this.facePositionInfo, nextFaceIndex * 3);

    return {
      geometryJump: (new THREE.BufferGeometry()).setFromPoints([
        midpoint,
        _centerVec,
      ]),
      nextFaceIndex,
    }
  }

  crawl = () => {
    if (this.doneCrawling) {
      return false;
    }

    // crawl index, update stuff
    const crawlRes = this.crawlHelper(
      this.nextFaceIndex,
      this.visitedFaceIndices,
    );
    this.visitedFaceIndices.add(this.nextFaceIndex);

    if (!crawlRes) {
      this.doneCrawling = true;
      return false;
    }

    const newGeo = BufferGeometryUtils.mergeGeometries([
      this.line.geometry, crawlRes.geometryJump
    ].filter((v): v is THREE.BufferGeometry => !!v));

    this.line.geometry = newGeo;

    this.nextFaceIndex = crawlRes.nextFaceIndex;

    return true;
  }

  getLine = () => {
    return this.line;
  }

  getLowestFaceIndex = () => {
    return this.lowestFaceIndex;
  }

  clone = () => {
    return new VineCrawler(
      this.geometry,
      {
        facePositionInfo: this.facePositionInfo,
        faceNormalInfo: this.faceNormalInfo,
        facesByVertexIndex: this.facesByVertexIndex,
        lowestFaceIndex: this.lowestFaceIndex,
        visitedFaceIndices: this.visitedFaceIndices,
        nextFaceIndex: this.nextFaceIndex,
        doneCrawling: this.doneCrawling,
      }
    )
  }
}

(window as any).VineCrawler = VineCrawler