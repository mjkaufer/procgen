import * as THREE from 'three';
import { useEffect, useMemo, useState } from "react";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

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
    if (fileName.endsWith('.stl')) {
      return new STLLoader();
    }
    return new OBJLoader();
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
      (object: THREE.Object3D | THREE.Mesh | THREE.BufferGeometry) => {
        console.log("RAW OBJ IS", object)
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

        setGeometry(geometry);
      },
      // called when loading is in progresses
      () => {
        console.log("WHAT HAPPEN")
      },
      // called when loading has errors
      (error) => {
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