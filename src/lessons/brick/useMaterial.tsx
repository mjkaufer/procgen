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

  // CUSTOM DEPS

  // varying vec4 gl_Position;
  uniform vec3 color;
  uniform bool hovered;

  vec2 uv_out;
  varying vec3 N;
  varying vec4 vPos;
  
  void main() {
    // gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(mod(cameraPosition.x, 2.0) > 1.0 ? 1.0 : 0.0, 0.0, 0.0, 1.0);
    gl_FragColor = vec4(sin(gl_FragCoord.x * 10.0) + 1.0, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(sin(gl_PointCoord.x * 10.0) + 1.0, 1.0, 0.0, 1.0);
    // gl_FragColor = vec4(sin(gl_SamplePosition.x * 10.0) + 1.0, 0.0, 0.0, 1.0);
    

    // // vec3 pos = cameraPosition * vec3(gl_FragCoord.x, gl_FragCoord.y, gl_FragCoord.z);
    // // vec4 pos = modelMatrix * viewMatrix * gl_FragCoord;
    // vec4 pos = viewMatrix * vec4(cameraPosition, 1.0) * gl_FragCoord;

    // // gl_FragColor = vec4((sin(gl_FragCoord.x) + 1.0) / 2.0, (cos(gl_FragCoord.y) + 1.0) / 2.0, 0.0, 1.0);
    // // gl_FragColor = vec4((sin(pos.x * 10.0) + 1.0) / 2.0, (cos(pos.y * 10.0) + 1.0) / 2.0, 0.0, 1.0);
    // // gl_FragColor = vec4(mod(pos.w, 1.0), 1.0, 1.0, 1.0);
    // gl_FragColor = vec4(abs(N.x), abs(N.y), abs(N.z), 1.0);

    // vec2 vCoords = vPos.xy;
		// vCoords /= vPos.w;
		// vCoords = vCoords * 0.5 + 0.5;
  
  	// vec2 uv = fract( vCoords * 10.0 );
    // gl_FragColor = vec4( uv, 0.0, 1.0 );
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

  varying vec3 N;
  varying vec4 vPos;
  varying vec3 posClone;

  void main() {
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // vec4 viewPosition = viewMatrix * modelPosition;
    // vec4 projectedPosition = projectionMatrix * viewPosition;

    // gl_Position = projectedPosition;
    // projPos = vec3(projectedPosition.x, projectedPosition.y, projectedPosition.z);
    // N = normal;

    N = normal;
    // N = normalMatrix * normalize(normal);

    posClone = position;    
    // if (mod(floor(posClone.x), 2.0) < 0.01) {
    //   posClone.x += 100.0;
    //   posClone.y += 100.0;
    //   posClone.z += 100.0;
    // }

    vPos = projectionMatrix * modelViewMatrix * vec4( posClone, 1.0 );

    gl_Position = vPos;
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