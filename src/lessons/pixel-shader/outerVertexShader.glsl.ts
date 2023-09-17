// @ts-ignore
import glsl from 'glslify';

export default glsl`
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
  uniform float pixelOffset;

  uniform float time;

  void main() {
    N = normal;
    // normal relative to the camera
    relN = normalize(normalMatrix * normal);
    vec3 rawPos = position;
    rawPos += pixelOffset * N;
    
    uvCopy = uv;
    vec4 modelPosition = modelMatrix * vec4(rawPos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    pos = vec3(projectionMatrix * modelViewMatrix * vec4(rawPos, 1.0));
    vec4 projectedPosition = projectionMatrix * viewPosition;

    posToCros = vec3(projectedPosition) / projectedPosition.w;
    projPos = vec3(projectedPosition);

    gl_Position = projectedPosition;
  }
`