import { IView } from "../../common";
import { Scene } from "./Scene";

export function View() {
  return (
      <Scene/>
  )
}

const viewInfo: IView = {
  component: View,
  title: 'Brick #1',
  description: 'Simple brick texture, applicable to different shapes. Drag around!',
  createdAt: new Date('Aug 1 2023'),
};

export default viewInfo;