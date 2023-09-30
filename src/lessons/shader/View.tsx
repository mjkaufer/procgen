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
  title: 'Postprocessing Shaders',
  description: 'Playing with pixel-space postprocessing',
  createdAt: new Date('2023-09-30'),
};

export default viewInfo;