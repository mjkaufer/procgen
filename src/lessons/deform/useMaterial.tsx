import * as THREE from 'three';
import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';


interface IMaterialProps {
  bbox: THREE.Box3 | null;
}

const v3 = new THREE.Vector3();
const vC = new THREE.Vector3();

export function useMaterial({
  bbox
}: IMaterialProps) {

  const initTime = 0;

  const slant = useMemo(() => {
    return bbox ? bbox.getCenter(vC).sub(bbox.max).negate() : v3;
  }, [bbox]);
  const uniformsRaw = useMemo(() => {
    return {
      time: initTime,
      bboxMin: bbox?.min ?? v3,
      bboxMax: bbox?.max ?? v3,
      slant,
    }
  }, [bbox]);

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
  
  return {
    material
  }
}