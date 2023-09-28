import { useEffect, useMemo } from "react";
import { AsciiEffect, AsciiEffectOptions } from "three/examples/jsm/effects/AsciiEffect";
import { SplashState } from "./types";

interface IUseAsciiRendererProps {
  splashState: SplashState;
  renderer: THREE.WebGLRenderer;
}
// horrible name tbh
export function useAsciiRenderer({
  splashState,
  renderer,
}: IUseAsciiRendererProps) {

  const asciiEffect = useMemo(() => {

    const baseProps: Partial<AsciiEffectOptions> & { characters: string } = {
      characters: 'EXUM ',
      // fontSize: 54,
      // cellSize: 16,
      color: true,
      invert: false,
    };

    const stateProps: Partial<AsciiEffectOptions> & { characters?: string } =
      (splashState === SplashState.Init || SplashState.IncreasingCubes) ? {
        characters: '?¿# '
      } : splashState === SplashState.DecreasingCubes ? {
        characters: 'EXUM ',
      } : splashState === SplashState.Finish ? {
        characters: '$ ',
      } : {};

    const fullProps = {
      ...baseProps,
      ...stateProps,
    };

    const effect = new AsciiEffect(renderer, fullProps.characters, fullProps);

    return effect;

  }, [splashState, renderer]);

  useEffect(() => {
    const parent = document.getElementById('exum-parent');
    if (!parent) {
      return;
    }
    parent.appendChild(asciiEffect.domElement);
    return () => {
      parent.removeChild(asciiEffect.domElement);
    }
  }, [asciiEffect]);
  
  return asciiEffect;
}