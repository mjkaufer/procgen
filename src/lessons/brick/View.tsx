import { Scene } from "./Scene";

export function View() {
  return (
    <div style={{position: 'relative', height: '100%', width: '100%'}}>
      TODO: Brick contorls?
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'}}>
      <Scene/>
      </div>
    </div>
  )
}