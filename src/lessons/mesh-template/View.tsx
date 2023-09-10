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
  title: 'Template',
  description: 'Write something here! When you finish, add to lessons/index.tsx',
  createdAt: new Date(''),
};

export default viewInfo;