import _ from 'lodash';
import { useEffect, useMemo, useState } from "react";

interface IUseStateSynchronizerProps {
  numSynchronizers: number;
  currentState: string | Record<string, any>;
  nextState: () => void;
}

export function useStateSynchronizer({
  numSynchronizers,
  nextState,
  currentState,
}: IUseStateSynchronizerProps) {

  // useEffect(() => {
  //   console.log("--- EVERYTHING STARTS NOW!!!!!")
  // }, []);

  const [syncStatuses, setSyncStatuses] = useState(_.range(numSynchronizers).map(v => false));
  // console.log("Statuses are", {
  //   syncStatuses, currentState
  // })

    // When we change sync ct or state, clear all values
    useEffect(() => {
      // console.log("Clearing statuses...", numSynchronizers, currentState)
      setSyncStatuses(_.range(numSynchronizers).map(v => false));
    }, [numSynchronizers, currentState]);

  const syncFns = useMemo(() => {
    return _.range(numSynchronizers).map(idx => () => {
      console.log("FN FOR", idx, "BEING RUN FOR ID")
      setSyncStatuses(arr => {
        // If already set, don't return new arr
        if (arr[idx]) {
          return arr;
        }
        const arrClone = [...arr];
        arrClone[idx] = true;
        return arrClone;
      })
    });
  }, [numSynchronizers]);

  useEffect(() => {
    if (syncStatuses.length && syncStatuses.every(_.identity)) {
      console.log("IN AGREEMENT, SWITCHING TO NEXT STATE!")
      nextState();
    }
  }, [syncStatuses, nextState]);


  return {
    syncFns
  }
}