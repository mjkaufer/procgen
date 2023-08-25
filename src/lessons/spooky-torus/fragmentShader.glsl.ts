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
  uniform bool moveLight;

  // CUSTOM ATTRIBUTES PASSED
  varying vec3 N;
  varying vec3 pos;
  varying vec3 projPos;
  varying vec2 uvCopy;
  varying vec3 relN;

  vec3 getPos(int phase) {
    if (phase == 0) {
      return vec3(5.0, 0., 0.);
    }

    if (phase == 1) {
      return vec3(0., -5.0, 0.);
    }

    if (phase == 2) {
      return vec3(-3.0, 4.0, 0.);
    }

    return vec3(1.0);
  }

  void main() {

    // camera keyframes
    // 3 positions, stay at for two ticks, move to next for one tick
    float period = 81.0;
    float stageCt = 3.0;
    float speedupFactor = 4.;
    float adjTime = time * speedupFactor; // use to speed up animation
    float stageLength = period / stageCt;

    // 0 1 2 3 4 5 6 7 8
    int camStage = int(floor(mod(adjTime, period) / stageLength)); // 0, 1, 2
    int nextCamStage = int(mod(float(camStage + 1), stageCt));
    float moveMix = int(mod(adjTime, stageLength)) == 0 ? mod(adjTime, 1.0) : 1.;




    vec3 newCamPos = cameraPosition + mix(getPos(camStage), getPos(nextCamStage), moveMix);

    vec3 camPos = moveLight ?
      newCamPos :
      cameraPosition;

    float baseVal = lightingAtCamera ? (
      dot(
        (normalize(
          projPos - vec3(viewMatrix * vec4(vec3(camPos), 1.0))
        )),
        relN
      )
    ) : (
      dot(
        (normalize(camPos - pos)),
        N
      )
    );

    float exp = (sin(time * 3.) + 1.) / 2. * 0.5 + 0.5;

    // baseVal = pow(max(baseVal, 0.), exp);
    baseVal = pow(max(baseVal, 0.), 1.);

      
    gl_FragColor = vec4(vec3(baseVal), 1.0);
  }`