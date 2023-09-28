import { IView } from "../../common";
import { Scene } from "./Scene";

export function View() {
  return (
      <div key="exum-view-div" className="exum">
      <Scene key="exum-view"/>
      </div>
  )
}

const viewInfo: IView = {
  component: View,
  title: 'Exum.AI Landing Concept',
  description: 'Did some tweaking on some ASCII useEffects, and some more animation driven state management',
  createdAt: new Date('Sept 28 2023'),
  sidebarProperties: {
    color: 'black',
  }
};

export default viewInfo;