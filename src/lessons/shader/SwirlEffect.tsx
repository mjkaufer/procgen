// @ts-ignore
import glsl from 'glslify';
import { Uniform } from 'three';
import { Effect } from 'postprocessing';
import _ from 'lodash';

const fragment = `
// uniform vec2 resolution;
// uniform vec2 texelSize;
// uniform float cameraNear;
// uniform float cameraFar;
// uniform float aspect;
// uniform float time;

// this is [-1, 1] but we want to change to [0, 1]

mat2 rotate2d(float _angle){
  return mat2(cos(_angle),-sin(_angle),
              sin(_angle),cos(_angle));
}

float wave(float x, float period, float max) { // todo: use eventually
  float val = mod(x, period);
  if (mod(x / period, 2.) > 1.) {
    val = max - val;
  }

  return val;
}


uniform vec2 uMousePos;
uniform float uDuration;

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

        const float PERIOD_LENGTH = 3.;
        const float SWIRL_DISTANCE = PI / 4.; // how far object swirls net
        const float SWIRL_OFFSET_VARIANCE = PI / 4.; // how much the swirl changes based on distance to center
        const float SWIRL_PERIOD_VARIANCE = 1.125; // fraction of period to accellerate; gets super trippy / fractally
        const bool USE_SWIRL_FRACTALNESS_AGGRESSIVE = false;
        float TIME = uDuration + 25.; // Stuff gets more interesting a few secs in
        
        // const float theta = PI / 2.;


        const float REVEAL_SIZE = 400.;
        const float BORDER_WIDTH = 2.;

        vec2 mousePx = ((uMousePos + 1.) / 2.) * resolution;

        float mouseCenterDeltaPx = distance(mousePx, uv * resolution);

        // vec2 rotationCenter = mousePx;
        vec2 rotationCenterPx = vec2(0.5, 0.5) * resolution;
        float rotationCenterDeltaPx = distance(rotationCenterPx, uv * resolution);
        float tDelta = (rotationCenterDeltaPx / REVEAL_SIZE) * SWIRL_OFFSET_VARIANCE;

        // Should probably disable if you don't want crazy trippiness
        float periodDelta = 1.;
        
        if (USE_SWIRL_FRACTALNESS_AGGRESSIVE) {
          periodDelta = (rotationCenterDeltaPx / REVEAL_SIZE) * SWIRL_PERIOD_VARIANCE;


        } else {
          // rescale to [0.9, 1.1]
          periodDelta = (rotationCenterDeltaPx / REVEAL_SIZE) * cos((TIME + tDelta) / PERIOD_LENGTH) / 10. + 1.;
        }


        float theta = cos(PI * (TIME + tDelta) / (PERIOD_LENGTH * periodDelta)) * SWIRL_DISTANCE;
        vec2 pixelPos = resolution * uv;

        pixelPos -= rotationCenterPx;
        
        pixelPos = rotate2d(theta) * pixelPos + rotationCenterPx;

        vec4 pixelized = texture2D(inputBuffer, pixelPos / resolution);

        outputColor = pixelized;









        // // if (mouseCenterDeltaPx > REVEAL_SIZE + BORDER_WIDTH) {
        //   if (mouseCenterDeltaPx < REVEAL_SIZE) {
        //     float theta = sin(PI * (uDuration + tDelta) / PERIOD_LENGTH) * SWIRL_DISTANCE;
        //     vec2 pixelPos = resolution * uv;

        //     pixelPos -= rotationCenterPx;
            
        //     pixelPos = rotate2d(theta) * pixelPos + rotationCenterPx;
    
        //     vec4 pixelized = texture2D(inputBuffer, pixelPos / resolution);
    
        //     outputColor = pixelized;
        // // } else if (mouseCenterDeltaPx > REVEAL_SIZE) {
        // } else if (mouseCenterDeltaPx < REVEAL_SIZE + BORDER_WIDTH) {
        //     outputColor = vec4(1., 1., 0., 1.);
        // } else {
        //     outputColor = inputColor;
        // }
    }
`;

export interface ISwirlEffectProps {
    mousePos: THREE.Vector2;
    duration: number;
}

export class SwirlEffect extends Effect {
    
    constructor({mousePos, duration}: ISwirlEffectProps) {
        const uniforms = new Map<string, Uniform>([
            ['uMousePos', new Uniform(mousePos)],
            ['uDuration', new Uniform(duration)],
        ]);

        
        super('SwirlEffect', fragment, { uniforms });
    }
    public updateProps(newProps: Partial<ISwirlEffectProps>) {
        (Object.keys(newProps) as (keyof ISwirlEffectProps)[]).map((k) => {
            const uniformKey = 'u' + _.upperFirst(k);
            const uniform = this.uniforms.get(uniformKey);
            if (uniform) {
                uniform.value = newProps[k];
            }
        })
    }
}