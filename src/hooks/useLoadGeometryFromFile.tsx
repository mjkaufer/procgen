import * as THREE from 'three';
import { useEffect, useMemo, useState } from "react";
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
// doesn't respect faces :(
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FaceObjLoader } from '../utils/FaceObjLoader';
import { OBJLoaderImproved } from '../utils/ObjLoaderImproved';
interface IuseLoadGeometryFromFileProps {
  fileName: string;
  centerAndRotate?: boolean;
}

// TODO: Make this robust if filename changes, so we avoid memory leaks, etc.
// For now not important, since we shouldn't be changing that :P
export function useLoadGeometryFromFile({
  fileName,
}: IuseLoadGeometryFromFileProps) {
  const loader = useMemo(() => {
    // if (fileName.endsWith('.stl')) {
    //   return new STLLoader();
    // }
    // return new OBJLoader();
    return new FaceObjLoader();
    // return new OBJLoaderImproved();

  }, [fileName]);

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!fileName) {
      return;
    }

    setIsLoading(true);
    loader.load(
      // resource URL
      fileName,
      // called when resource is loaded
      (object: THREE.BufferGeometry | THREE.Mesh | THREE.Object3D) => {

        setIsLoading(false);
        let geometry: THREE.BufferGeometry | null = null;
        if ('geometry' in object) {
          geometry = object.geometry;
        } else if ('children' in object && object.children.length) {
          geometry = (object.children[0] as THREE.Mesh).geometry;
        } else if ('isBufferGeometry' in object) {
          geometry = object;
        } else {
          console.error(`Something went wrong when getting geometry`)
          setIsError(true);
          return;
        }
        (window as any).loadedGeo = geometry;

        setGeometry(geometry);
      },
      // called when loading is in progresses
      () => {
        console.log("WHAT HAPPEN")
      },
      // called when loading has errors
      (error: Error) => {
        console.log("ERROR?", error.toString())
        if (error) {
          setIsError(true);
          setIsLoading(false);
        }
      }
    );

  }, [fileName, loader])

  return {
    geometry,
    isError,
    isLoading,
  }
}