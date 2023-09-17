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
  title: 'Comic Book Shading',
  description: 'Vintage comic-book style shading',
  createdAt: new Date('Sept 16, 2023'),
};

export default viewInfo;