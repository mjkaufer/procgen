import React, { useMemo } from "react";

interface IUseJoinProps {
  components: React.ReactNode[];
  delimiter: React.ReactNode;
}

export function useJoin({ components, delimiter }: IUseJoinProps) {
  return useMemo(() => {
    return components
      .reduce((prev, curr) => [prev, delimiter, curr])
  }, [components, delimiter]);
}