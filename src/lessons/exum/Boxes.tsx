import * as THREE from 'three';
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import _ from 'lodash';
import { SplashState } from "./types";
import { useMountSingle } from '../../hooks/useMountSingle';
import { useMountMany } from '../../hooks/useMountMany';
import { useRerender } from '../../hooks/useRerender';
import { useRaycaster } from '../../hooks/useRaycaster';

interface IBoxesProps {
  splashState: SplashState;
  readyForNextState: () => void;
}

const INIT_BOXES = 3;
const MAX_BOXES = 18;
const BOX_ADD_SPEED_MS = 600;

const MAX_HOVER_SCALE = 1.5;
const HOVER_SCALE_RATE = 1.04;

const BOX_REMOVE_SPEED_MS = 400;
const STATE_TRANSITION_TIME_MS = 1000;

const BASE_BOX_LENGTH = 1.5;
const FINAL_BOX_LENGTH = 3;

const NUM_BOX_SEGMENTS = 8;

const BASE_PHONG_PROPS: Partial<THREE.MeshPhongMaterialParameters> = {
  specular: 0xffffff,
  shininess: 100,
  flatShading: true,
}
const BASE_LAMBERT_PROPS: Partial<THREE.MeshLambertMaterialParameters> = {
  // shininess: 100,
  flatShading: true,
  reflectivity: 100,
}

export function Boxes({
  splashState,
  readyForNextState,
}: IBoxesProps) {

  const { scene } = useThree();
  

  const [numBoxes, setNumBoxes] = useState(INIT_BOXES);
  const lastStateAt = useMemo(() => +new Date(), [splashState]);

  const circleRadius = useMemo(() => {
    return Math.pow(numBoxes, 0.5) * BASE_BOX_LENGTH;
  }, [numBoxes]);

  const baseBoxGeometry = useMemo(() => {
    return new THREE.BoxGeometry(BASE_BOX_LENGTH, BASE_BOX_LENGTH, BASE_BOX_LENGTH, NUM_BOX_SEGMENTS, NUM_BOX_SEGMENTS, NUM_BOX_SEGMENTS);
  }, []);

  const boxMaterial = useMemo(() => {
    // return new THREE.MeshLambertMaterial({
    //   ...BASE_LAMBERT_PROPS,
    //   // color: 0x330000,
    //   // Use lighter color for grater depth in ASCII
    //   color: 0xeeeeee,
    // });
    return new THREE.MeshPhongMaterial({
      ...BASE_PHONG_PROPS,
      // color: 0x330000,
      // Use lighter color for grater depth in ASCII
      color: 0xeeeeee,
    });
  }, []);

  const finishMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({ color: 0x00ff00, ...BASE_LAMBERT_PROPS, });
  }, []);

  // TODO: Try to reuse boxes
  const allBoxes = useMemo(() => {
    return _.range(numBoxes).map(i => {

      const box: THREE.Mesh = new THREE.Mesh(baseBoxGeometry, boxMaterial);

      if (numBoxes > 1) {
        const rad = i * Math.PI * 2 / numBoxes;
        box.position.x = Math.cos(rad) * circleRadius;
        box.position.z = Math.sin(rad) * circleRadius;
      }

      return box;
    });
  }, [numBoxes, baseBoxGeometry, boxMaterial, circleRadius]);

  const parentGroup = useMemo(() => {
    return new THREE.Group();
  }, []);

  const ambientLight = useMemo(() => {
    return new THREE.AmbientLight(0xaaaaaa, 0.35);
  }, []);

  const pointLightsGroup = useMemo(() => {

    const plg = new THREE.Group();
    // const baseLight = new THREE.PointLight(0xffffff, 50, 100);
    const baseLight = new THREE.PointLight(0xffffff, 60, 80);
    baseLight.position.set(0, -BASE_BOX_LENGTH * 10, 0);
    plg.add(baseLight);

    const baseLight2 = new THREE.PointLight(0xffffff, 60, 80);
    baseLight2.position.set(BASE_BOX_LENGTH * 5, -BASE_BOX_LENGTH * 10, BASE_BOX_LENGTH * -5);
    plg.add(baseLight2);

    const baseLight3 = new THREE.PointLight(0xffffff, 60, 80);
    baseLight3.position.set(BASE_BOX_LENGTH * -5, -BASE_BOX_LENGTH * 10, BASE_BOX_LENGTH * 5);
    plg.add(baseLight3);


    const spotlight = new THREE.SpotLight(0xffffff, 150);
    spotlight.position.set(0, -BASE_BOX_LENGTH * 30, 0);
    
    plg.add(spotlight);
    return plg;
  }, []);
  useMountSingle(ambientLight, scene);
  useMountSingle(pointLightsGroup, scene);

  // const { getIntersection } = useRaycaster()

  useFrame(
    (state, delta) => {
      const time = state.clock.getElapsedTime();
      
      // const intersections = getIntersection(allBoxes);
      // Not same units as time
      const timeSinceLastState = (+new Date()) - lastStateAt;

      allBoxes.forEach((box, boxIndex) => {
        const fixedOffset = boxIndex * Math.PI * 2 / numBoxes;
        box.rotation.x = fixedOffset + time / 10;
        box.rotation.y = fixedOffset + time / 10 + Math.PI / 4;

        // Hover effect for box
        // TODO: Persist on box? Or track as box index?
        // if (intersections[0]?.object === box && allBoxes.length > 1) {
        //   const length = Math.max(...box.scale.toArray());
        //   if (length < MAX_HOVER_SCALE) {
        //     const INCREASE_BY = Math.min(HOVER_SCALE_RATE, MAX_HOVER_SCALE / length);

        //     box.scale.multiplyScalar(INCREASE_BY);
        //   }
        //   box.material = hoverMaterial;
        // } else {
        //   box.material = boxMaterial;
        //   box.scale.set(BASE_BOX_LENGTH, BASE_BOX_LENGTH, BASE_BOX_LENGTH);
        // }


        if (allBoxes.length === 1) {
          // TODO: Make green
          box.material = finishMaterial;
          box.scale.set(FINAL_BOX_LENGTH, FINAL_BOX_LENGTH, FINAL_BOX_LENGTH);
        }
      });


      // console.log("Mouse state is", state.mouse)
      parentGroup.rotation.x = Math.PI / 6 * -state.mouse.y;
      parentGroup.rotation.y = time / 10;
      parentGroup.rotation.z = Math.PI / 3 * state.mouse.x;
      // parentGroup.rotation.z = Math.PI * 2 / 3 * (state.mouse.y - 0.5);

    }
  );

  const { rerender, rerenderToken } = useRerender();




  // TODO: useEffect which evaluates state

  useEffect(() => {
    window.addEventListener('focus', rerender);

    return () => window.removeEventListener('focus', rerender);
  }, []);

  // Handles state transitions
  useEffect(() => {



    if (splashState === SplashState.Init) {
      readyForNextState();
    }

    if (numBoxes === MAX_BOXES && splashState === SplashState.IncreasingCubes) {
      const intervalId = setTimeout(() => {
        readyForNextState();
      }, STATE_TRANSITION_TIME_MS);

      return () => clearTimeout(intervalId);
    }


    if (numBoxes === 1 && splashState === SplashState.DecreasingCubes) {
      const intervalId = setTimeout(() => {
        readyForNextState();
      }, STATE_TRANSITION_TIME_MS);

      return () => clearTimeout(intervalId);
    }

  }, [numBoxes, splashState, readyForNextState]);

  // TODO: Revert to add boxes
  useEffect(() => {

    if (splashState !== SplashState.IncreasingCubes) {
      return;
    }
    const intervalId = setInterval(() => {
      setNumBoxes(nb => Math.min(nb + 1, MAX_BOXES));
    }, BOX_ADD_SPEED_MS);

    const cancel = () => clearInterval(intervalId);

    window.addEventListener('blur', cancel);

    return () => {
      cancel();
      window.removeEventListener('blur', cancel);
    };
  }, [rerenderToken, splashState]);

  useEffect(() => {
    if (splashState !== SplashState.DecreasingCubes) {
      return;
    }

    const intervalId = setInterval(() => {
      setNumBoxes(nb => Math.max(nb - 1, 1));
    }, BOX_REMOVE_SPEED_MS);

    const cancel = () => clearInterval(intervalId);

    window.addEventListener('blur', cancel);

    return () => {
      cancel();
      window.removeEventListener('blur', cancel);
    };
  }, [rerenderToken, splashState]);


  useMountMany(allBoxes, parentGroup);
  useMountSingle(parentGroup, scene);

  return (
    null
  )
}