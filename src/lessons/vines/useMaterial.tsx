import * as THREE from 'three';
import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';


interface IMaterialProps {
  lightingAtCamera?: boolean;
}

export function useMaterial({
  lightingAtCamera = true,
}: IMaterialProps) {

  const initTime = 0;

  const uniformsRaw = useMemo(() => {
    return {
      time: initTime,
      lightingAtCamera,
    }
  }, [lightingAtCamera]);

  const uniforms = useMemo(() => {
    return _.mapValues(uniformsRaw, v => new THREE.Uniform(v));
  }, []);

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
    
    const update = () => {
      material.uniforms.time.value = (+Date.now() - initialDate) / 1000;
      material.uniformsNeedUpdate = true;
      shouldUpdate && window.requestAnimationFrame(update);
    };
    update();
    
    return () => {
      shouldUpdate = false;
    };
  }, [uniforms, material]);
  
  // TODO: Figure out how to make flat shading work in our materials w/ custom face thing
  const m = new THREE.MeshNormalMaterial({
    flatShading: true,
  });
  
  return {
    material: m
  }

  return {
    material,
  }
}