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
uniform vec2 uMousePos;

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

        const float REVEAL_SIZE = 90.;
        const float BORDER_WIDTH = 2.;
        // const float MAGNIFY_AMT = 1. / 1.5;
        const float MAGNIFY_AMT = 2.;

        vec2 mousePx = ((uMousePos + 1.) / 2.) * resolution;

        float deltaPx = distance(mousePx, uv * resolution);

        if (deltaPx < REVEAL_SIZE) {

          vec2 pixelPos = resolution * uv;

          pixelPos -= mousePx;

          pixelPos *= MAGNIFY_AMT;
          
          pixelPos += mousePx;
  
          vec4 pixelized = texture2D(inputBuffer, pixelPos / resolution);
  
          outputColor = pixelized;
      } else if (deltaPx < REVEAL_SIZE + BORDER_WIDTH) {
          outputColor = vec4(0., .5, 1., 1.);
      } else {
          outputColor = inputColor;
      }
    }
`;

export interface IMagnifyEffectProps {
    mousePos: THREE.Vector2;
}

export class MagnifyEffect extends Effect {
    
    constructor({mousePos}: IMagnifyEffectProps) {
        const uniforms = new Map<string, Uniform>([
            ['uMousePos', new Uniform(mousePos)],
        ]);

        
        super('MagnifyEffect', fragment, { uniforms });
    }
    public updateProps(newProps: Partial<IMagnifyEffectProps>) {
        (Object.keys(newProps) as (keyof IMagnifyEffectProps)[]).map((k) => {
            const uniformKey = 'u' + _.upperFirst(k);
            const uniform = this.uniforms.get(uniformKey);
            if (uniform) {
                uniform.value = newProps[k];
            }
        })
    }
}