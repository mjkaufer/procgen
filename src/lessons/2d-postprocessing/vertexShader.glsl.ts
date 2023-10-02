// @ts-ignore
import glsl from 'glslify';

export default glsl`
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
  varying vec3 relN;
  varying vec3 pos;
  varying vec3 projPos;
  varying vec2 uvCopy;

  uniform float time;

  void main() {
    N = normal;
    // normal relative to the camera
    relN = normalize(normalMatrix * normal);
    
    uvCopy = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    // pos = vec3(modelPosition);
    vec4 projectedPosition = projectionMatrix * viewPosition;

    projPos = vec3(projectedPosition);

    // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectedPosition;
  }
`