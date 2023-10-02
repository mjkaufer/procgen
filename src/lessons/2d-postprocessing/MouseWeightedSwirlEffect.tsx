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
        const bool USE_SPOOKY_BLEND = false;
        float TIME = uDuration + 25.; // Stuff gets more interesting a few secs in
        
        // const float theta = PI / 2.;


        const float REVEAL_SIZE = 400.;
        const float BORDER_WIDTH = 2.;

        vec2 mouseUv = ((uMousePos + 1.) / 2.);
        vec2 mousePx = mouseUv * resolution;

        vec2 rotationCenterPx = mousePx;
        float rotationCenterDeltaPx = distance(rotationCenterPx, uv * resolution);
        float rotationCenterDeltaUv = distance(rotationCenterPx / resolution, uv);
        float tDelta = (rotationCenterDeltaPx / REVEAL_SIZE) * SWIRL_OFFSET_VARIANCE;

        // Should probably disable if you don't want crazy trippiness
        float periodDelta = 1.;

        float blendRatio = 0.;
        if (!USE_SPOOKY_BLEND) {
          blendRatio = pow(rotationCenterDeltaUv, 2.);
          blendRatio = max(1. - blendRatio, 0.);
        } else {
          blendRatio = pow(rotationCenterDeltaPx / sqrt(resolution.x * resolution.x + resolution.y * resolution.y), 1.5);
        }
        
        if (USE_SWIRL_FRACTALNESS_AGGRESSIVE) {
          periodDelta = (rotationCenterDeltaPx / REVEAL_SIZE) * SWIRL_PERIOD_VARIANCE;
          // rescale to [0.9, 1.1]
          // periodDelta = (rotationCenterDeltaPx / REVEAL_SIZE) * cos((TIME + tDelta) / PERIOD_LENGTH) / 10. + 1.;

        } else {
          
          
        }


        float theta = cos(PI * (TIME + tDelta) / (PERIOD_LENGTH * periodDelta)) * SWIRL_DISTANCE;
        if (!USE_SPOOKY_BLEND) {
          theta *= blendRatio;
        }
        vec2 pixelPos = resolution * uv;

        pixelPos -= rotationCenterPx;
        
        pixelPos = rotate2d(theta) * pixelPos + rotationCenterPx;

        vec4 pixelized = texture2D(inputBuffer, pixelPos / resolution);

        if (USE_SPOOKY_BLEND) {
          outputColor = mix(inputColor, pixelized, blendRatio);
        } else {
          outputColor = pixelized;
        }

    }
`;

export interface IMouseWeightedSwirlEffectProps {
    mousePos: THREE.Vector2;
    duration: number;
}

export class MouseWeightedSwirlEffect extends Effect {
    
    constructor({mousePos, duration}: IMouseWeightedSwirlEffectProps) {
        const uniforms = new Map<string, Uniform>([
            ['uMousePos', new Uniform(mousePos)],
            ['uDuration', new Uniform(duration)],
        ]);

        
        super('MouseWeightedSwirlEffect', fragment, { uniforms });
    }
    public updateProps(newProps: Partial<IMouseWeightedSwirlEffectProps>) {
        (Object.keys(newProps) as (keyof IMouseWeightedSwirlEffectProps)[]).map((k) => {
            const uniformKey = 'u' + _.upperFirst(k);
            const uniform = this.uniforms.get(uniformKey);
            if (uniform) {
                uniform.value = newProps[k];
            }
        })
    }
}