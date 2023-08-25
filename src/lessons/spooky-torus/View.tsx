import { IView } from "../../common";
import { Scene } from "./Scene";

export function View() {
  return (
      <Scene/>
  )
}


const viewInfo: IView = {
  component: View,
  title: 'Spooky Torus',
  description: 'Basic lighting experiment, the ability to view lighting relative to camera or not, borderlands-y lighting shading, & light that can move sporadically. Drag around!',
  createdAt: new Date('Aug 25 2023'),
};

export default viewInfo;