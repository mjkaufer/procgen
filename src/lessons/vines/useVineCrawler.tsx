import { useCallback, useEffect, useMemo, useState } from "react";
import * as THREE from 'three';
import { VineCrawler } from "./VineCrawler";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';


interface IUseVineCrawlerProps {
  geometry: THREE.BufferGeometry | null;
}
export function useVineCrawler({
  geometry,
}: IUseVineCrawlerProps) {
  const rootVineCrawler = useMemo(() => {
    if (!geometry) {
      return null;
    }

    return new VineCrawler(geometry, 0.5)
  }, [geometry]);

  const [vineCrawlers, setVineCrawlers] = useState<VineCrawler[]>([]);
  const vineCrawlerGroup = useMemo(() => {
    return new THREE.Group();
  }, []);

  const addVineCrawler = useCallback((vineCrawler: VineCrawler) => {
    setVineCrawlers(oldVineCrawlers => [...oldVineCrawlers, vineCrawler]);
    vineCrawlerGroup.add(vineCrawler.getLine());
  }, [vineCrawlerGroup]);

  // when we recreate vine crawler, delete all old vine crawlers
  useEffect(() => {
    if (rootVineCrawler !== null) {
      setVineCrawlers([]);
      addVineCrawler(rootVineCrawler);

    }

    return () => {
      setVineCrawlers(currentCrawlers => {
        currentCrawlers.forEach(c => c.dispose());
        return [];
      })
    };
  }, [rootVineCrawler]);

  const [isDone, setIsDone] = useState(false);

  // TODO: Support multiple forks in the tree / some recursive structure
  // won't work well in a hook afaict
  const stepVines = useCallback(() => {
    if (isDone || !vineCrawlers.length) {
      // console.log("IS DONE, GIVE UP")
      return;
    }

    const crawlersToAdd: VineCrawler[] = [];
    setIsDone(vineCrawlers.every(v => {
      const {
        done, fork,
      } = v.crawl();
      console.log("Crawled for", v, "with res", {
        done, fork,
      })

      return done && !fork;
    }))
    
  }, [vineCrawlers, isDone]);

  return {
    // change to group or something
    line: vineCrawlerGroup,
    stepVines,
    isDone,
  }
}