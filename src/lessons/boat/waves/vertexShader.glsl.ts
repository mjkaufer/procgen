// @ts-ignore
import glsl from 'glslify';

export default glsl`
  // // BASE DEPS
  // uniform mat4 modelMatrix;
  // uniform mat4 modelViewMatrix;
  // uniform mat4 projectionMatrix;
  // uniform mat4 viewMatrix;
  // uniform mat3 normalMatrix;
  // uniform vec3 cameraPosition;
  // attribute vec3 position;
  // attribute vec3 normal;
  // attribute vec2 uv;

  // // CUSTOM UNIFORM ARGS
  uniform vec3 color;

  // CUSTOM ATTRIBUTES PASSED
  varying vec3 N;
  varying vec3 relN;
  varying vec3 pos;
  varying vec3 projPos;
  varying vec2 uvCopy;
  varying float waveZDeltaNormalized;

  uniform float time;

  void main() {

    const float WAVE_POS_SCALE = 1.;
    const float WAVE_TIME_SCALE = 0.25;
    const float WAVE_MAGNITUDE = 0.25;
    // TODO: Move to fragment shader?
    const float WAVE_OFFSET_Z = -0.5;
    
    N = normal;
    // normal relative to the camera
    relN = normalize(normalMatrix * normal);
    
    uvCopy = uv;


    vec3 offsetPosition = position;

    // sum of two sins, worst case, goes from [-2, 2]
    float waveZDeltaRaw = (
      sin(offsetPosition.x / WAVE_POS_SCALE + time / WAVE_TIME_SCALE) +
      sin(offsetPosition.y / WAVE_POS_SCALE + time / WAVE_TIME_SCALE)
    );

    waveZDeltaNormalized = (waveZDeltaRaw + 2.) / 4.;
    
    offsetPosition.z += WAVE_MAGNITUDE * waveZDeltaRaw + WAVE_OFFSET_Z;

    vec4 modelPosition = modelMatrix * vec4(offsetPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    // pos = vec3(modelPosition);
    vec4 projectedPosition = projectionMatrix * viewPosition;

    projPos = vec3(projectedPosition);

    gl_Position = projectedPosition;
  }
`