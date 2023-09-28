import { useEffect } from "react";

export function useMountMany(objects: THREE.Object3D[], parent: THREE.Object3D) {

  useEffect(() => {
    objects.map(object => {
      parent.add(object)
    });

    return () => {
      objects.map(object => {
        parent.remove(object)
      });
    }
  }, [objects, parent]);

}