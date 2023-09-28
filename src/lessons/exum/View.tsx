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
  title: 'Melting Statue',
  description: 'Melting statue!',
  createdAt: new Date('Sept 10 2023'),
};

export default viewInfo;