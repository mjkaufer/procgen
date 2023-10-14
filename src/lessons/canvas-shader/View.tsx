import { IView } from "../../common";
import { Scene } from "./Scene";

export function View() {
  return (
      <div>
      <Scene/>
      </div>
  )
}

const viewInfo: IView = {
  component: View,
  title: 'Canvas Textures',
  description: 'Experimenting w/ canvas generated textures',
  createdAt: new Date('Oct 13, 2023'),
};

export default viewInfo;