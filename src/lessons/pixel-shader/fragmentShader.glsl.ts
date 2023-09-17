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

  float BUCKETS = 20.;
  float MIN_AMB = 0.;
  float PIXEL_SCALE = 0.2;
  float PIXEL_SIZE = 1.;
  float DOUBLE_PIXEL_W = PIXEL_SIZE * 2.;
  float PIXEL_THRESH = 0.8;
  float EXTRA_DARK_PIXEL_THRESH = 0.6;
  float JITTER_STRENGTH = 5.;
  float JITTER_SPEED = 1.;
  float FACE_JITTER_OFFSET = 5.;

  // kind of looks cool inverting normal lighting/shading
  // vec3 baseCol = vec3(0., 0.4, 1.0);
  // vec3 bgCol = vec3(0.1, 0.1, 0.2);

  // These are for debugging
  vec3 baseCol = vec3(0.85, 0.9, 1.0);
  vec3 bgCol = vec3(0.4, 0.4, 0.5);
  vec3 pixelCol = vec3(0., 0., 0.);
  

  // vec3 bgCol = vec3(0.2, 0.2, 1.0);
  // vec3 baseCol = vec3(0.1, 0.1, 0.2);

  vec3 faceNormal = normalize(cross(dFdx(projPos), dFdy(projPos)));
  float baseVal = max(pow(dot(
    // normal of face
    faceNormal,
    // delta of face and point on face - would be cool to get center of face, but idk how
    normalize(cameraPosition - projPos)
  ), 0.5), MIN_AMB);

  baseVal = min(ceil((baseVal - MIN_AMB) * BUCKETS) / BUCKETS + MIN_AMB, 1.);

  vec4 pixelPos = vec4(gl_FragCoord) * PIXEL_SCALE;
  float jitterT = time * JITTER_SPEED + (baseVal * FACE_JITTER_OFFSET);
  pixelPos += vec4(JITTER_STRENGTH * vec2(cos(jitterT), -sin(jitterT)), 1., 1.);

  bool isOn = mod(pixelPos.x, DOUBLE_PIXEL_W) < PIXEL_SIZE == mod(pixelPos.y, DOUBLE_PIXEL_W) < PIXEL_SIZE;

  bool usePixel = baseVal < PIXEL_THRESH && isOn;

  // vec3 rawCol = mix(bgCol, baseCol, baseVal);
  vec3 rawCol = baseVal < EXTRA_DARK_PIXEL_THRESH ? bgCol : baseCol;

  vec3 col = usePixel ? mix(rawCol, pixelCol, (PIXEL_THRESH - baseVal) / PIXEL_THRESH) : rawCol;
  

  gl_FragColor = vec4(col, 1.0);
  // gl_FragColor = isOn ? vec4(1.) : vec4(vec3(0.), 1.);
}`