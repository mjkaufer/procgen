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

  float BRICK_PAD = 0.0125;
  float BRICK_W = 0.225;
  float BRICK_H = 0.1;
  
  void main() {
    float BRICK_PAD_BORDER = BRICK_PAD * 2.;
    float BRICK_W_FULL = BRICK_W + BRICK_PAD;
    float BRICK_H_FULL = BRICK_H + BRICK_PAD;

    float brickAbsX = aUV.x - BRICK_PAD * 2.0;

    bool isOuterBorder = aUV.x < BRICK_PAD_BORDER || (1. - aUV.x) < BRICK_PAD_BORDER || aUV.y < BRICK_PAD_BORDER || (1. - aUV.y) < BRICK_PAD_BORDER;

    float brickHRel = mod(aUV.y, BRICK_H_FULL);
    float brickRow = floor(aUV.y / BRICK_H_FULL) + 1.0;
    float brickWRel = mod(brickAbsX + (mod(brickRow, 2.) * BRICK_W_FULL / 2.), BRICK_W_FULL);

    bool isBorder = isOuterBorder || brickWRel < BRICK_PAD || (BRICK_W_FULL - brickWRel) < BRICK_PAD || brickHRel < BRICK_PAD || (BRICK_H_FULL - brickHRel) < BRICK_PAD;

    gl_FragColor = !isBorder ? vec4(1., 0., 0., 1.) : vec4(1., 1., 0.6, 1.);
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

  float BRICK_PAD = 0.0125;
  float BRICK_W = 0.225;
  float BRICK_H = 0.1;

  void main() {

    aUV = uv;
    N = normal;
    pos = position;

    float BRICK_PAD_BORDER = BRICK_PAD * 2.;
    float BRICK_W_FULL = BRICK_W + BRICK_PAD;
    float BRICK_H_FULL = BRICK_H + BRICK_PAD;

    float brickAbsX = aUV.x - BRICK_PAD * 2.0;

    bool isOuterBorder = aUV.x < BRICK_PAD_BORDER || (1. - aUV.x) < BRICK_PAD_BORDER || aUV.y < BRICK_PAD_BORDER || (1. - aUV.y) < BRICK_PAD_BORDER;

    float brickHRel = mod(aUV.y, BRICK_H_FULL);
    float brickRow = floor(aUV.y / BRICK_H_FULL) + 1.0;
    float brickWRel = mod(brickAbsX + (mod(brickRow, 2.) * BRICK_W_FULL / 2.), BRICK_W_FULL);

    bool isBorder = isOuterBorder || brickWRel < BRICK_PAD || (BRICK_W_FULL - brickWRel) < BRICK_PAD || brickHRel < BRICK_PAD || (BRICK_H_FULL - brickHRel) < BRICK_PAD;

    vec3 pos = isOuterBorder ? position : isBorder ? (position - normal * 0.03) : (position + normal * 0.03);
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition; // like 2D arrangement?
    vec4 projectedPosition = projectionMatrix * viewPosition;

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