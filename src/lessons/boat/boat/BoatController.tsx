import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import Boat from "./Boat";


interface IBoatControllerProps {
  boat: Boat;
}
export function BoatController({
  boat
}: IBoatControllerProps) {


  // useFrame((state) => {
  //   boat.position.z = Math.sin(state.clock.elapsedTime) * 10;
  // });
  // TODO
  return (
    <primitive object={boat}/>
  );
}