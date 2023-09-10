import _ from 'lodash';
import * as THREE from 'three';
interface IFaceObjLoaderOpts {
  flatShading: boolean;
}
export class FaceObjLoader {
  load = async (
    fileName: string,
    onLoadFinish: (g: THREE.BufferGeometry) => void,
    onLoadProgress: () => void, // TODO: Support eventually
    onError: (e: Error) => void,
    {
      flatShading = true,
    }: Partial<IFaceObjLoaderOpts> = {},
  ) => {
    const geo = new THREE.BufferGeometry();

    try {

      const file = await fetch(fileName);
  
      const lines = (await file.text()).split('\n');
      const numPoints = _.sumBy(lines, l => l.startsWith('v ') ? 1 : 0);
      const numNormals = _.sumBy(lines, l => l.startsWith('vn ') ? 1 : 0);
      const numFaces = _.sumBy(lines, l => l.startsWith('f ') ? 1 : 0);
  
      const pointBuffer = new Float32Array(numPoints * 3);
      const normalBuffer = new Float32Array(numNormals * 3);
      const faceBuffer = new Uint32Array(numFaces * 3);
  
      let pointIndex = 0;
      let normalIndex = 0;
      let faceIndex = 0;
  
      lines.forEach(line => {
        if (line.startsWith('v ')) {
          insertLineToArr(line, pointIndex, pointBuffer, 3);
          pointIndex++;
        } else if (line.startsWith('vn ')) {
          insertLineToArr(line, normalIndex, normalBuffer, 3);
          normalIndex++;
        } else if (line.startsWith('f ')) {
          // The faces are 1-indexed, so for post-processing, need to remove a value
          // Maybe better to batch-do this at the end? Not sure
          insertLineToArr(line, faceIndex, faceBuffer, 3, v => v - 1);
          faceIndex++;
        }
      })
  
      
  

      geo.setIndex(new THREE.BufferAttribute(faceBuffer, 1));
      geo.setAttribute('position', new THREE.BufferAttribute(pointBuffer, 3));

      geo.setAttribute('normal', new THREE.BufferAttribute(normalBuffer, 3));
      geo.computeVertexNormals();
  
      onLoadFinish(geo);
      return geo;
    } catch (e) {
      onError(e as any);
      return null;
    }
  }
}

function insertLineToArr(line: string, index: number, arr: Float32Array | Uint32Array, itemSize: number, postProcessFn: (v: number) => number = _.identity) {
  arr.set(
    line.split(' ').slice(1).map(v => parseFloat(v.split('\\')[0].trim())).map(postProcessFn),
    index * itemSize
  );
}