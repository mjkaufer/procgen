// @ts-ignore
import glsl from 'glslify';

export default glsl`

  precision highp float;
  uniform float time;
  uniform bool lightingAtCamera;


  // CUSTOM ATTRIBUTES PASSED
  flat varying vec3 N;
  flat varying vec3 relN;
  varying vec3 pos;
  varying vec3 projPos;
  varying vec3 posToCros;
  varying vec2 uvCopy;

  void main() {
    float BUCKETS = 5.;
    float MIN_AMB = 0.;

    float baseVal = max(pow(dot(
      // normal of face
      normalize(cross(dFdx(projPos), dFdy(projPos))),
      // delta of face and point on face - would be cool to get center of face, but idk how
      normalize(cameraPosition - projPos)
    ), 0.5), MIN_AMB);

    baseVal = min(ceil((baseVal - MIN_AMB) * BUCKETS) / BUCKETS + MIN_AMB, 1.);

    gl_FragColor = vec4(vec3(baseVal), 1.0);
  }
  `