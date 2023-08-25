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
  description: 'Basic lighting, with the ability to view lighting relative to the viewport or not, and the ability to have the lighting move sporadically. Drag around!',
  createdAt: new Date('Aug 25 2023'),
};

export default viewInfo;