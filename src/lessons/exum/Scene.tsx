import React, { ReactPropTypes, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components';

import { SplashState } from './types';
import { TickerText } from './TickerText';
import { useStateSynchronizer } from '../../hooks/useStateSynchronizer';
import { Boxes } from './Boxes';

import { ThreeContainer } from './ThreeContainer';

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

  const asciiEffectRef = useRef<any>(null);

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

  const { syncFns: [
    textSync,
    graphicsSync,
  ] } = useStateSynchronizer({
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
      return <TickerText text="When there's a new foundation model black box daily" onComplete={textSync} />
    }

    if (splashState === SplashState.DecreasingCubes) {
      return <TickerText text="Experts use Exum to find the best models for the best value" onComplete={textSync} />
    }

    if (splashState === SplashState.Finish) {
      return (
        <div>
          {/* TODO: Fade-in CSS */}
          <h2>Exum.AI</h2>
          {/* TODO: Hyperlink */}
          <p>
            <a href="mailto:sales@exum.ai" className="chill-link">Talk to Sales</a>
          </p>
        </div>
      )
    }
  }, [splashState, textSync]);


  return (
    <>
      <PageContentWrapper>
        {pageContent}
      </PageContentWrapper>
      <div id="exum-parent">
      {/* <canvas width="1000" height="1000" id="tmp-canvas"/> */}
        <ThreeContainer splashState={splashState} readyForNextState={graphicsSync}  />
      
      </div>
    </>
  )

}