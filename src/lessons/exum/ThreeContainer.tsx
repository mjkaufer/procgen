import * as THREE from 'three';
import { useCallback, useEffect, useMemo } from "react";
import { SplashState } from './types';
import { useAsciiRenderer } from './useAsciiRenderer';
import { Boxes } from './Boxes';
import { useAnimationFrameStore } from './useAnimationFrameStore';
import { shallow } from 'zustand/shallow';


// We orchestrate everything from here
interface IThreeContainerProps {
  splashState: SplashState;
  readyForNextState: () => void;
}

const RENDER_WIDTH = window.innerWidth;
const RENDER_HEIGHT = window.innerHeight;

const TARGET_FPS = 60;

export function ThreeContainer({
  splashState,
  readyForNextState,
}: IThreeContainerProps) {

  const [fns] = useAnimationFrameStore(s => [s.fns], shallow);

  const width = useMemo(() => {
    return RENDER_WIDTH;
  }, []);

  const height = useMemo(() => {
    return RENDER_HEIGHT;
  }, []);

  const camera = useMemo(() => {
    const c = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    c.position.set(0, -10, 0);
    c.lookAt(0, 0, 0);
    return c;
  }, []);

  const scene = useMemo(() => {
    // todo: set bg maybe
    return new THREE.Scene();
  }, []);

  const renderer = useMemo(() => {
    return new THREE.WebGLRenderer({
      canvas: document.getElementById('tmp-canvas') ?? undefined
    });
  }, []);

  const asciiRenderer = useAsciiRenderer({
    splashState,
    renderer,
  });

  // todo: window events
  useEffect(() => {
    renderer.setSize( width, height );
    asciiRenderer.setSize( width, height );
  }, [renderer, width, height, asciiRenderer]);

  useEffect(() => {
    let mostRecentNum: number | null = null;
    let lastCall = +new Date();
    const animate = () => {
      mostRecentNum = requestAnimationFrame(animate);

      const delta = +new Date() - lastCall;
      if (delta > 1000 / TARGET_FPS) {
        lastCall = +new Date();
        // pre-animation functions
        fns.forEach(fn => fn());
        asciiRenderer.render(scene, camera);
        // renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      if (mostRecentNum !== null) {
        cancelAnimationFrame(mostRecentNum)
      }
    }
  }, [asciiRenderer, scene, camera, fns]);

  return (
    <Boxes splashState={splashState} readyForNextState={readyForNextState} scene={scene}/>
  );
}