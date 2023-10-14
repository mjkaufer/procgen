// @ts-ignore
import glsl from 'glslify';

export default glsl`
precision highp float;
uniform float time;
uniform bool lightingAtCamera;
uniform sampler2D characters;
uniform float charactersSize;


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
  const float TEXTURE_SCALE = 15.;

  // kind of looks cool inverting normal lighting/shading
  vec3 baseCol = vec3(0.5, 0.8, 1.0);
  // vec3 bgCol = vec3(0.2, 0.3, 0.2);
  vec3 bgCol = vec3(
    102. / 255.,
    65. / 255.,
    138. / 255.);
  vec3 pixelCol = vec3(0., 0., 0.);
  

  // vec3 bgCol = vec3(0.2, 0.2, 1.0);
  // vec3 baseCol = vec3(0.1, 0.1, 0.2);

  vec3 faceNormal = normalize(cross(dFdx(projPos), dFdy(projPos)));

  float dotProd = dot(
    // normal of face
    faceNormal,
    // delta of face and point on face - would be cool to get center of face, but idk how
    normalize(cameraPosition - projPos)
    // vec3(0.,-0.,1.)
  );
  float baseVal = max(pow(dot(
    // normal of face
    faceNormal,
    // delta of face and point on face - would be cool to get center of face, but idk how
    normalize(cameraPosition - projPos)
    // vec3(0.,0.,-1.)
  ), 0.5), MIN_AMB);

  baseVal = min(ceil((baseVal - MIN_AMB) * BUCKETS) / BUCKETS + MIN_AMB, 1.);
  baseVal = pow(baseVal, 2.);

  // vec2 texUV = (vec2(gl_FragCoord) / charactersSize * TEXTURE_SCALE * baseVal) + time / 3.;
  vec2 texUV = (vec2(gl_FragCoord) / charactersSize * TEXTURE_SCALE) + time / 3.;

  float c = -dotProd;
  float s = sqrt(1. - (dotProd * dotProd));
  texUV = mat2(c, s, -s, c) * texUV;

  gl_FragColor = texture2D(characters, texUV);
  gl_FragColor = mix(vec4(1.) - gl_FragColor, gl_FragColor, pow(dotProd, 2.));
}`