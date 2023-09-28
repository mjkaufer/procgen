import React, { useEffect, useState } from 'react';

interface IUseMouseState {
  x: number;
  y: number;
  dx: number;
  dy: number;
  isMouseDown: boolean;
}

interface IUseMouseDragProps {
  onMove?: (s: IUseMouseState) => void;
}

// TODO: Rename
export function useMouseDrag({
  onMove
}: IUseMouseDragProps) {

  const [mouseState, setMouseState] = useState<IUseMouseState>({
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    isMouseDown: false,
  });

  const [mouseTarget, setMouseTarget] = useState<EventTarget | null>();

  useEffect(() => {

    const handleWindowMouseMove = (event: MouseEvent) => {
      
      const isMouseDown = !!event.buttons;
      setMouseTarget(event.target);
      setMouseState(priorState => {
        const x = event.clientX;
        const y = event.clientY;
        const newState: IUseMouseState = {
          x,
          y,
          dx: x - priorState.x,
          dy: y - priorState.y,
          isMouseDown,
        }

        onMove?.(newState);

        return newState;
      });
    }

    window.addEventListener('mousemove', handleWindowMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove)
    }
  }, [onMove])

  return {mouseState, mouseTarget};
}