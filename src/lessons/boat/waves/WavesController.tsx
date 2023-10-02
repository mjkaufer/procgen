import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import Waves from "./Waves";


interface IWavesControllerProps {
  waves: Waves;
}
export function WavesController({
  waves
}: IWavesControllerProps) {


  useFrame((state) => {
    waves.setTime(state.clock.elapsedTime / 5.);
  });
  // TODO
  return (
    <primitive object={waves}/>
  );
}