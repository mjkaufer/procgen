// @ts-ignore
import glsl from 'glslify';
import * as THREE from 'three';
import { useEffect, useMemo, useState } from 'react';
import {v4 as uuidV4} from 'uuid';

const fragmentShader = glsl`
  // TODO: Validate precision is set correctly
  // BASE DEPS
  precision mediump float;
  uniform mat4 viewMatrix;
  uniform vec3 cameraPosition;

  // CUSTOM DEPS

  uniform vec3 color;
  
  void main() {
    gl_FragColor = vec4(color.x, color.y, color.z, 1.0);
  }
`;

// see https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// define the constants to make glslify happy
const vertexShader = glsl`
  // BASE DEPS
  uniform mat4 modelMatrix;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat4 viewMatrix;
  uniform mat3 normalMatrix;
  uniform vec3 cameraPosition;
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  // CUSTOM DEPS
  uniform vec3 color;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
  }
`;

interface IMaterialProps {
  color: THREE.Color;
}

export function Material({
  color: colorRaw,
}: IMaterialProps) {
  const [needsUpdate, setNeedsUpdate] = useState(false);

  const color = useMemo(() => {
    return new THREE.Uniform(colorRaw);
  }, [colorRaw]);

  const uniforms = useMemo(() => {
    return {
      color,
    }
  }, [color]);

  // this is kind of hacky - need a way of propagating uniform updates
  const key = useMemo(() => {
    return uuidV4();
  }, [uniforms])

  console.log("Uniforms is", uniforms.color.value)

  // return <rawShaderMaterial
  return <rawShaderMaterial
    fragmentShader={fragmentShader}
    vertexShader={vertexShader}
    uniforms={uniforms}
    key={key}
  />
}