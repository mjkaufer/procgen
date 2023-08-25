import * as THREE from 'three';
import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';


interface IMaterialProps {
  color: THREE.Color;
  hovered: boolean; // todo use for something
  temporalPan: boolean;
}

export function useMaterial({
  color,
  hovered,
  temporalPan,
}: IMaterialProps) {

  const initTime = 0;

  const uniformsRaw = useMemo(() => {
    return {
      color,
      hovered,
      temporalPan,
      time: initTime,
    }
  }, [color, hovered, temporalPan]);

  const uniforms = useMemo(() => {
    return _.mapValues(uniformsRaw, v => new THREE.Uniform(v));
  }, []);

  const texture = useMemo(() => {
    return new THREE.Texture();
  }, [])


  const material = useMemo(() => {
    return new THREE.RawShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms,
    })
  }, []);

  // Whenever uniforms changes, manually update everything in main material
  useEffect(() => {
    _.forEach(uniformsRaw, (v, k) => {
      material.uniforms[k].value = v;
    });
    material.uniformsNeedUpdate = true;
  }, [uniformsRaw]);

  useEffect(() => {
    const initialDate = +Date.now();
    // let shouldUpdate = false;
    // todo: maybe migrate to animation frame?
    const interval = setInterval(() => {
      material.uniforms.time.value = (+Date.now() - initialDate) / 1000;
      material.uniformsNeedUpdate = true;
    }, 5)

    return () => {
      clearInterval(interval)
    };
  }, [uniforms, material]);

  (window as any).material = material;
  return {
    material
  }
}