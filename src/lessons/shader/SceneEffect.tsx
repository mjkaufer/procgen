import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { MagnifyEffect } from "./MagnifyEffect";
import { PixelRevealEffect } from "./PixelRevealEffect";
import { SwirlEffect } from "./SwirlEffect";

export enum SceneEffectChoice {
  // Reveal pixelated scene based on cursor position
  PixelReveal = 'PixelReveal',
  Swirl = 'Swirl',
  Magnify = 'Magnify',
  // TODO: Fractal / recursion style? or "screenshare your zoom" type thing
  // TODO: Glitchy cross-fade w/ vertical lines? Or cross-fade in/out based on any pattern?
  // TODO: Vintage VHS filter
}

interface ISceneEffectProps {
  sceneEffect: SceneEffectChoice;
}

// Not related to useEffect :)
export function SceneEffect({
  sceneEffect,
}: ISceneEffectProps) {

  const {
    mouse: mousePos,
  } = useThree();

  const startTime = useMemo(() => {
    return +new Date();
  }, [sceneEffect]);

  const sceneEffectObject = useMemo(() => {
    if (sceneEffect === SceneEffectChoice.PixelReveal) {
      return new PixelRevealEffect({
        mousePos,
      });
    } else if (sceneEffect === SceneEffectChoice.Swirl) {
      return new SwirlEffect({
        mousePos,
        duration: 0,
      });
    } else if (sceneEffect === SceneEffectChoice.Magnify) {
      return new MagnifyEffect({
        mousePos,
      });
    } else {
      return null;
    }
  }, [sceneEffect]);

  useEffect(() => {
    console.log("Mouse pos is", mousePos)
    if (sceneEffectObject instanceof PixelRevealEffect) {
      sceneEffectObject.updateProps({ mousePos })
    } else if (sceneEffectObject instanceof SwirlEffect) {
      sceneEffectObject.updateProps({ mousePos })
    } else if (sceneEffectObject instanceof MagnifyEffect) {
      sceneEffectObject.updateProps({ mousePos })
    }
  }, [mousePos, sceneEffectObject]);

  useFrame(() => {
    if (sceneEffectObject instanceof SwirlEffect) {
      sceneEffectObject.updateProps({ duration: (+new Date() - startTime) / 1000.0 })
      
    }
  })

  if (!sceneEffectObject) {
  return null;
  }
  return (
    <primitive object={sceneEffectObject} />
  )
}