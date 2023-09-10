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
  uniform bool lightingAtCamera;

  // CUSTOM ATTRIBUTES PASSED
  varying vec3 N;
  varying vec3 pos;
  varying vec3 projPos;
  varying vec2 uvCopy;
  varying vec3 relN;

  void main() {

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

      
    gl_FragColor = vec4(vec3(baseVal), 1.0);
  }`