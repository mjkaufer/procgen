// @ts-ignore
import glsl from 'glslify';

export default glsl`
  // BASE DEPS
  // uniform mat4 modelMatrix;
  // uniform mat4 modelViewMatrix;
  // uniform mat4 projectionMatrix;
  // uniform mat4 viewMatrix;
  // uniform mat3 normalMatrix;
  // uniform vec3 cameraPosition;
  // attribute vec3 position;
  // attribute vec3 normal;
  // attribute vec2 uv;

  // CUSTOM UNIFORM ARGS
  uniform vec3 color;

  // CUSTOM ATTRIBUTES PASSED
  flat varying vec3 N;
  flat varying vec3 relN;
  varying vec3 pos;
  varying vec3 projPos;
  varying vec2 uvCopy;
  varying vec3 vViewPosition;
  varying vec3 posToCros;
  varying mat4 projMat;

  uniform float time;

  void main() {
    N = normal;
    // normal relative to the camera
    relN = normalize(normalMatrix * normal);
    
    
    uvCopy = uv;
    projMat = modelViewMatrix;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    pos = vec3(projectionMatrix * modelViewMatrix * vec4(position, 1.0));
    vec4 projectedPosition = projectionMatrix * viewPosition;

    posToCros = vec3(projectedPosition) / projectedPosition.w;
    projPos = vec3(projectedPosition);

    // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectedPosition;
  }
`