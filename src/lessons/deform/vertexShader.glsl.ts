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
  varying vec3 updatedPosition;
  varying vec3 originalPosition;
  varying vec2 uvCopy;

  uniform float time;
  uniform vec3 bboxMin;
  uniform vec3 bboxMax;
  uniform vec3 slant;

  void main() {
    originalPosition = position;
    float SLANT_N = 0.5;
    updatedPosition = position;
    float dt = max(time - 1.5, 0.);
    float dz = pow(dt, 2.);
    
    updatedPosition.z = max(
      bboxMin.z,
      originalPosition.z - dz
    );

    float distanceRatio = min(dz / (originalPosition.z - bboxMin.z), 1.);

    updatedPosition.x -= distanceRatio * slant.x * SLANT_N * (originalPosition.z - bboxMin.z);
    // if (isFalling) {
    // }
    N = normal;
    // normal relative to the camera
    relN = normalize(normalMatrix * normal);
    
    uvCopy = uv;
    vec4 modelPosition = modelMatrix * vec4(updatedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    // pos = vec3(modelPosition);
    vec4 projectedPosition = projectionMatrix * viewPosition;

    projPos = vec3(projectedPosition);

    
    gl_Position = projectedPosition;
  }
`