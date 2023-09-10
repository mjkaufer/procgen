import * as THREE from 'three';
import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';


interface IMaterialProps {
  color: THREE.Color;
  hovered: boolean; // todo use for something
  temporalPan: boolean;
  brickScale: number;
}

export function useMaterial({
  color,
  hovered,
  temporalPan,
  brickScale,
}: IMaterialProps) {

  const initTime = 0;

  const uniformsRaw = useMemo(() => {
    return {
      color,
      hovered,
      temporalPan,
      time: initTime,
      brickScale,
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
    let shouldUpdate = true;
    if (!temporalPan) {
      return;
    }
    const update = () => {
      material.uniforms.time.value = (+Date.now() - initialDate) / 1000;
      material.uniformsNeedUpdate = true;
      shouldUpdate && window.requestAnimationFrame(update);
    };
    update();
    
    return () => {
      shouldUpdate = false;
    };
  }, [uniforms, material, temporalPan]);

  (window as any).material = material;
  return {
    material
  }
}