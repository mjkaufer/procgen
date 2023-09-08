import { useCallback, useMemo, useState } from "react";
import * as THREE from 'three';
import { VineCrawler } from "./VineCrawler";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';


interface IUseVineCrawlerProps {
  geometry: THREE.BufferGeometry | null;
}
export function useVineCrawler({
  geometry,
}: IUseVineCrawlerProps) {
  const vineCrawler = useMemo(() => {
    if (!geometry) {
      return null;
    }

    return new VineCrawler(geometry)
  }, [geometry]);

  const [isDone, setIsDone] = useState(false);

  // TODO: Support multiple forks in the tree / some recursive structure
  // won't work well in a hook afaict
  const stepVine = useCallback(() => {
    for (let i = 0; i < 10; i++) {
      if (isDone || !vineCrawler) {
        return;
      }
      const success = vineCrawler.crawl();
      if (!success) {
        setIsDone(true);
      }
    }
  }, [vineCrawler, isDone]);

  return {
    // change to getLines (plural)
    line: vineCrawler?.getLine() ?? null,
    stepVine,
    vineCrawler,
  }
}