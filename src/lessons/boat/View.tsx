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
  title: 'Boat / Waves',
  description: 'Experimenting w/ user input impacting waves! TODO: Controls',
  createdAt: new Date('Oct 1 2023'),
};

export default viewInfo;