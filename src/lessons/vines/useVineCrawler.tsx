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

  const addVineCrawlers = useCallback((vineCrawlers: VineCrawler[]) => {
    setVineCrawlers(oldVineCrawlers => [...oldVineCrawlers, ...vineCrawlers]);
    vineCrawlers.forEach(v => vineCrawlerGroup.add(v.getLine()));
    
  }, [vineCrawlerGroup]);

  // when we recreate vine crawler, delete all old vine crawlers
  useEffect(() => {
    if (rootVineCrawler !== null) {
      setVineCrawlers([]);
      addVineCrawlers([rootVineCrawler]);
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
      return;
    }

    const crawlersToAdd: VineCrawler[] = [];
    let allCrawlersDone = true;
    vineCrawlers.forEach(v => {
      const {
        done, childrenToAdd,
      } = v.crawl();
      
      if (childrenToAdd.length) {
        crawlersToAdd.push(...childrenToAdd)
      }

      allCrawlersDone = done && !childrenToAdd.length;
    });
    
    if (crawlersToAdd.length) {
      addVineCrawlers(crawlersToAdd);
    }
    setIsDone(allCrawlersDone);
    
  }, [vineCrawlers, isDone]);

  return {
    // change to group or something
    line: vineCrawlerGroup,
    stepVines,
    isDone,
  }
}