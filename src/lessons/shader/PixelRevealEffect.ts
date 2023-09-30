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

        const float REVEAL_SIZE = 60.;
        const float GRID_SIZE = 32.;
        const float BORDER_WIDTH = 2.;

        vec2 mouse = (uMousePos + 1.) / 2.;

        float deltaPx = distance(mouse * resolution, uv * resolution);

        if (deltaPx > REVEAL_SIZE) {

            vec2 pixelPos = resolution * uv;
            pixelPos.x = floor(pixelPos.x / GRID_SIZE + 0.5) * GRID_SIZE;
            pixelPos.y = floor(pixelPos.y / GRID_SIZE + 0.5) * GRID_SIZE;
    
            vec2 chunkedUV = pixelPos / resolution;
    
            vec4 pixelized = texture2D(inputBuffer, chunkedUV);
    
            outputColor = pixelized;
        } else if (deltaPx + BORDER_WIDTH > REVEAL_SIZE) {
            outputColor = vec4(1., 0., 0., 1.);
        } else {
            outputColor = inputColor;
        }
    }
`;

export interface IPixelRevealEffectProps {
    mousePos: THREE.Vector2;
}

export class PixelRevealEffect extends Effect {
    
    constructor({mousePos}: IPixelRevealEffectProps) {
        const uniforms = new Map<string, Uniform>([
            ['uMousePos', new Uniform(mousePos)],
        ]);

        
        super('PixelRevealEffect', fragment, { uniforms });
    }
    public updateProps(newProps: Partial<IPixelRevealEffectProps>) {
        (Object.keys(newProps) as (keyof IPixelRevealEffectProps)[]).map((k) => {
            const uniformKey = 'u' + _.upperFirst(k);
            const uniform = this.uniforms.get(uniformKey);
            if (uniform) {
                uniform.value = newProps[k];
            }
        })
    }
}