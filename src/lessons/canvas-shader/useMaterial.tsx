import * as THREE from 'three';
import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';


interface IMaterialProps {
}

function createCharactersTexture(characters: string, fontSize: number) {
  const canvas = document.createElement('canvas');

  const SIZE = characters.length * fontSize;
  const MAX_PER_ROW = characters.length;
  const CELL = SIZE / MAX_PER_ROW;

  canvas.width = canvas.height = SIZE;

  const texture = new THREE.CanvasTexture(
      canvas,
      undefined,
      THREE.RepeatWrapping,
      THREE.RepeatWrapping,
      THREE.NearestFilter,
      THREE.NearestFilter
  );

  const context = canvas.getContext('2d');

  if (!context) {
      throw new Error('Context not available');
  }

  context.clearRect(0, 0, SIZE, SIZE);
  // context.fillStyle = '#f00';
  // context.fillRect(0, 0, SIZE, SIZE);
  // TODO: Parameterize?
  context.font = `bold ${fontSize}px monospace`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#fff';

  for (let i = 0; i < characters.length; i++) {
    for (let j = 0; j < characters.length; j++) {
      const char = characters[(i + j) % characters.length];
      const x = i % MAX_PER_ROW;
      // const y = Math.floor(i / MAX_PER_ROW);
      const y = j % MAX_PER_ROW;

      context.fillText(char, x * CELL + CELL / 2, y * CELL + CELL / 2);
    }
  }

  // const link = document.createElement('a');
  // link.download = 'filename.png';
  // link.href = canvas.toDataURL();
  // link.click();

  texture.needsUpdate = true;

  return {
    characters: texture,
    charactersSize: SIZE,
  };
}

export function useMaterial({
}: IMaterialProps) {

  const initTime = 0;

  const uniformsRaw = useMemo(() => {
    return {
      time: initTime,
      ...createCharactersTexture('LOREM', 216),
    }
  }, []);

  const uniforms = useMemo(() => {
    const baseUniforms = _.mapValues(uniformsRaw, v => new THREE.Uniform(v));
    return baseUniforms;
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms,
      transparent: true,
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