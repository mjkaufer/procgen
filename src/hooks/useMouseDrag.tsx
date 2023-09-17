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
        const newState: IUseMouseState = {
          x: event.clientX,
          y: event.clientY,
          dx: event.clientX - priorState.x,
          dy: event.clientY - priorState.y,
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