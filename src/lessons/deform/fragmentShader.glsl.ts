// @ts-ignore
import glsl from 'glslify';

export default glsl`
  // TODO: Validate precision is set correctly
  // BASE DEPS
  precision highp float;

  uniform mat4 viewMatrix;
  uniform vec3 cameraPosition;

  // CUSTOM UNIFORM ARGS
  uniform float time;
  uniform vec3 bboxMin;
  uniform vec3 bboxMax;
  uniform vec3 slant;

  // CUSTOM ATTRIBUTES PASSED
  varying vec3 N;
  varying vec3 pos;
  varying vec3 projPos;
  varying vec2 uvCopy;
  varying vec3 relN;
  varying vec3 updatedPosition;
  varying vec3 originalPosition;

  

  void main() {

    float START = 0.2;

    float baseVal = (
      dot(
        (normalize(
          projPos - vec3(viewMatrix * vec4(vec3(cameraPosition), 1.0))
        )),
        relN
      )
    );

    float exp = (sin(time * 3.) + 1.) / 2. * 0.5 + 0.5;

    baseVal = pow(max(baseVal, 0.), exp);

    vec4 lightingColor = vec4(vec3(baseVal), 1.0);
    // 1. = at start, 0. = done
    float fallenRatio = (updatedPosition.z - bboxMin.z) / (originalPosition.z - bboxMin.z);

    fallenRatio = fallenRatio > START ? 1. : fallenRatio / START;

      
    gl_FragColor = mix(vec4(1., 0., 0., 1.), lightingColor, fallenRatio);
  }`