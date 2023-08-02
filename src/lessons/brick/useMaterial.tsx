// @ts-ignore
import glsl from 'glslify';
import * as THREE from 'three';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import _ from 'lodash';

const fragmentShader = glsl`
  // TODO: Validate precision is set correctly
  // BASE DEPS
  precision highp float;

  uniform mat4 viewMatrix;
  uniform vec3 cameraPosition;

  // CUSTOM UNIFORM ARGS
  uniform vec3 color;
  uniform bool hovered;

  // CUSTOM ATTRIBUTES PASSED
  varying vec3 N;
  varying vec3 pos;
  varying vec2 aUV;

  float BRICK_W = 0.2;
  float BRICK_H = 0.075;
  float BRICK_BUFF = 0.05;
  
  void main() {


    // vec4 stripes = vec4(sin(pos.x) + 1.0, 0.0, 0.0, 1.0);
    // gl_FragColor = mix(stripes, vec4(0., 0.5, 0., 1.0), hovered ? 0. : 0.);
    bool isBrick = mod(aUV.x - BRICK_BUFF / 2.0, BRICK_W + BRICK_BUFF) <= BRICK_W && mod(aUV.y - BRICK_BUFF / 2.0, BRICK_H + BRICK_BUFF) <= BRICK_H;
    gl_FragColor = isBrick ? vec4(1., 0., 0., 1.0) : vec4(1., 1., 0.6, 1.);
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

  // CUSTOM UNIFORM ARGS
  uniform vec3 color;

  // CUSTOM ATTRIBUTES PASSED
  varying vec3 N;
  varying vec3 pos;
  varying vec2 aUV;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // like 2D arrangement?
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    N = normal;
    pos = position;
    aUV = uv;
    // pos = vec3(projectedPosition);

    gl_Position = projectedPosition;
  }
`;

interface IMaterialProps {
  color: THREE.Color;
  hovered: boolean;
}

export function useMaterial({
  color,
  hovered,
}: IMaterialProps) {

  const uniformsRaw = useMemo(() => {
    return {
      color,
      hovered,
    }
  }, [color, hovered]);

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

  return {
    material
  }
}