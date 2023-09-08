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
  title: 'Vines',
  description: 'Watch some vines grow on the mesh! Inspired by a picture I took, TODO: Upload later',
  createdAt: new Date('Sept 8 2023'),
};

export default viewInfo;