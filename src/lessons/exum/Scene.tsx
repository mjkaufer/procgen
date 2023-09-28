import React, { ReactPropTypes, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber'
import styled from 'styled-components';

import { SplashState } from './types';
import { EffectComposer } from '@react-three/postprocessing';
import { TickerText } from './TickerText';
import { useStateSynchronizer } from '../../hooks/useStateSynchronizer';
import { Boxes } from './Boxes';
import { ASCIIEffect, IASCIIEffectProps } from './lib/ASCII';

const PageContentWrapper = styled.div`
  position: absolute;
  z-index: 100;
  top: 50%;
  transform: translate(0, -50%);
  width: 100%;
  text-align: center;
`

const STATE_PROGRESSION_DELAY_MS = 1500;

export function Scene() {

  const [splashState, setSplashState] = useState<SplashState>(SplashState.Init);

  // Want to wait ~ 1 second
  const progressSplashState = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setSplashState(currSplashState => {

        if (currSplashState === SplashState.Init) {
          return SplashState.IncreasingCubes;
        }

        if (currSplashState === SplashState.IncreasingCubes) {
          return SplashState.DecreasingCubes;
        }

        if (currSplashState === SplashState.DecreasingCubes) {
          return SplashState.Finish;
        }

        // The end!
        if (currSplashState === SplashState.Finish) {
          return SplashState.Finish;
        }

        throw new Error(`Invalid state ${currSplashState} - no transition found`)
      })
    }, STATE_PROGRESSION_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, []);

  const asciiEffect = useRef<any>(null);

  // Kind of strange, default threejs orientation is pain in butt for this idea, but don't
  // want to break everything else
  // TODO: Consolidate later
  // useEffect(() => {

  //   THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0,0,1);

  //   return () => {
  //     THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 1, 0);
  //   }
    
  // }, [])


  // const { mouseState } = useMouseDrag({});

  // const [controlRotation, setControlRotation] = useState<[number, number]>([0, 0]);

  // useEffect(() => {
  //   if (!mouseState.isMouseDown) {
  //     return;
  //   }
  //   setControlRotation(([oldX, oldY]) => [
  //     oldX + mouseState.dx / MOUSE_SCALING,
  //     oldY + mouseState.dy / MOUSE_SCALING,
  //   ])
  // }, [mouseState, mouseState.dx, mouseState.dy])

  const {syncFns: [
    textSync,
    graphicsSync,
  ]} = useStateSynchronizer({
    numSynchronizers: 2,
    currentState: splashState,
    nextState: progressSplashState,
  });

  // Get weird rerender issue on page load with useStateSynchronizer, so have to do this semi-hacky effect to init here
  useEffect(() => {
    if (splashState === SplashState.Init) {
      textSync();
    }
  }, [textSync, splashState]);
  

  const pageContent = useMemo(() => {
    if (splashState === SplashState.Init) {
      return null;
    }

    if (splashState === SplashState.IncreasingCubes) {
      return <TickerText text="In an age where there's a new black box LLM every day" onComplete={textSync}/>
    }

    if (splashState === SplashState.DecreasingCubes) {
      return <TickerText text="Experts use Exum to find the best models at the best price points" onComplete={textSync}/>
    }

    if (splashState === SplashState.Finish) {
      return (
        <div className="sales-cta">
          {/* TODO: Fade-in CSS */}
          <h2>Exum.AI</h2>
          <br/>
          <p>
            <a href="mailto:sales@exum.ai" className="chill-link">Contact</a>
          </p>
        </div>
      )
    }
  }, [splashState, textSync]);


  const baseAscii = useMemo(() => {
    return new ASCIIEffect({});
  }, []);

  useEffect(() => {
    const asciiProps: Partial<IASCIIEffectProps> = {
      characters: 'MXEU',
      clearBackground: true,
      color: "#000",
      fontSize: 70,
      cellSize: 30,
    };

    if (splashState === SplashState.Init || splashState === SplashState.IncreasingCubes) {
      Object.assign(asciiProps, {
        characters: '?¿#'
      })
    } else if (splashState === SplashState.DecreasingCubes) {
      Object.assign(asciiProps, {
        characters: 'EXUM',
      })
    } else if (splashState === SplashState.Finish) {
      Object.assign(asciiProps, {
        characters: '¢$€%',
        color: '#32612D',
        invert: false,
      })
    }

    baseAscii.updateProps(asciiProps);
  }, [baseAscii, splashState]);
  // TODO: Override somehow

  (window as any).asciiEffect = asciiEffect;

  return (
    <>
    <PageContentWrapper>
      {pageContent}
    </PageContentWrapper>
    <Canvas style={{ width: '100%', height: '100%', background: '#ddd' }} camera={{ fov: 75, position: [0, -10, 0]}}>
      <EffectComposer>
        <primitive object={baseAscii} key={splashState}/>
        
      </EffectComposer>
      <Boxes splashState={splashState} readyForNextState={graphicsSync}/>
    </Canvas>
    </>
  )

}