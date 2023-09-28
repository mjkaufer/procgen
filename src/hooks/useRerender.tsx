import { useCallback, useState } from "react";

export function useRerender() {
  const [val, setVal] = useState(true);

  const rerender = useCallback(() => {
    return setVal(v => !v);
  }, [setVal]);

  // Use rerenderToken if you need to trigger an event
  return {rerender, rerenderToken: val};
}