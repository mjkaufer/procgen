// @ts-ignore
import glsl from 'glslify';

export default glsl`
  // // TODO: Validate precision is set correctly
  // // BASE DEPS
  // precision highp float;

  // uniform mat4 viewMatrix;
  // uniform vec3 cameraPosition;

  // // CUSTOM UNIFORM ARGS
  // uniform float time;
  // uniform bool lightingAtCamera;

  // CUSTOM ATTRIBUTES PASSED
  varying vec3 N;
  varying vec3 pos;
  varying vec3 projPos;
  varying vec2 uvCopy;
  varying vec3 relN;

  uniform float time;

  varying float waveZDeltaNormalized;

  // From https://stackoverflow.com/a/4275343
  float seededRand(vec2 co, float offset){
    return fract(sin(dot(co, vec2(12.9898, 78.233)) + offset) * 43758.5453);
  }


  void main() {

    const vec4 HIGH_COLOR = vec4(0.8, 0.9, 1., 0.9);
    const vec4 LOW_COLOR = vec4(0., 0.6, 1., 0.8);
    const float HIGH_THRESH = 0.9;
    const float LOW_THRESH = 0.6;
    // TODO: Normalize
    //    Other option is to compute whether it's pixel or not in fragment shader? But probs not high res enough
    //    So probably need to apply similar stuff
    // TODO: Rotate w/ viewport
    const float PIXEL_SIZE = 20.;
    const float HALF_PIXEL_SIZE = PIXEL_SIZE / 2.;

    
    /* Chunk for somewhat offset pixel pos
      float cameraDist = distance(cameraPosition, projPos);

      // TODO: Clapm
      float pixelSize = PIXEL_SIZE / cameraDist * 30.;
      float halfPixelSize = pixelSize / 2.;

      bool isPixel =
        (mod(gl_FragCoord.x, pixelSize) < halfPixelSize) == (mod(gl_FragCoord.y, pixelSize) < halfPixelSize);

    */

    // Chunk for absolute pixel size
   bool isPixel =
     (mod(gl_FragCoord.x, PIXEL_SIZE) < HALF_PIXEL_SIZE) == (mod(gl_FragCoord.y, PIXEL_SIZE) < HALF_PIXEL_SIZE);


    // TODO: Refactor off of this, and use boat position / velocity
    // Might need to use a buffer or something tho
    // Other option to just do it in CPU so we can use prior values / iterate on stuff?
    // With some noise for the color 8)
    float waveZDelta = clamp(
      waveZDeltaNormalized
        + seededRand(gl_FragCoord.xy, 0.) * 0.05,
      0.,
      1.
    );


    if (waveZDelta > HIGH_THRESH) {
      gl_FragColor = HIGH_COLOR;
    } else if (waveZDelta > LOW_THRESH) {
      // interpolate
      gl_FragColor = mix(LOW_COLOR, HIGH_COLOR, (
        (waveZDelta - LOW_THRESH) / 
        (HIGH_THRESH - LOW_THRESH)
      ));
      if (isPixel) {
        gl_FragColor.r -= 0.1;
      }
    } else {
      gl_FragColor = LOW_COLOR;
    }

    
      
    
  }`