// Taken from https://raw.githubusercontent.com/emilwidlund/ASCII/main/src/index.ts
// slightly modified

import { CanvasTexture, Color, NearestFilter, RepeatWrapping, Texture, Uniform } from 'three';
import { Effect } from 'postprocessing';

const fragment = `
uniform sampler2D uCharacters;
uniform float uCharactersCount;
uniform float uCellSize;
uniform bool uInvert;
uniform bool uClearBackground;
uniform vec3 uColor;

const vec2 SIZE = vec2(16.);

vec3 greyscale(vec3 color, float strength) {
    float g = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(g), strength);
}

vec3 greyscale(vec3 color) {
    return greyscale(color, 1.0);
}

// From https://stackoverflow.com/a/4275343
float seededRand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 cell = resolution / uCellSize;
    vec2 grid = 1.0 / cell;
    vec2 pixelizedUV = grid * (0.5 + floor(uv / grid));

    vec4 pixelized = texture2D(inputBuffer, pixelizedUV);
    float greyscaled = clamp(
        // Add some noise :)
        // TODO: Make it better / noisier / more noticeable
        greyscale(pixelized.rgb).r + (seededRand(pixelizedUV * 100.) * 0.45),
        0.,
        1.);

    if (uInvert) {
        greyscaled = 1.0 - greyscaled;
    }

    float characterIndex = floor((uCharactersCount - 1.0) * greyscaled);
    vec2 characterPosition = vec2(mod(characterIndex, SIZE.x), floor(characterIndex / SIZE.y));
    vec2 offset = vec2(characterPosition.x, -characterPosition.y) / SIZE;
    vec2 charUV = mod(uv * (cell / SIZE), 1.0 / SIZE) - vec2(0., 1.0 / SIZE) + offset;
    vec4 asciiCharacter = texture2D(uCharacters, charUV);


    // If we do this, gets cool blockiness on border
    // asciiCharacter.rgb = inputColor.rgb;

    asciiCharacter.rgb = uColor * asciiCharacter.r;
    asciiCharacter.a = uClearBackground ? min(pixelized.a, asciiCharacter.a) : pixelized.a;
    outputColor = asciiCharacter;
}
`;

export interface IASCIIEffectProps {
    characters?: string;
    fontSize?: number;
    cellSize?: number;
    color?: string;
    invert?: boolean;
    clearBackground?: boolean;
}

export class ASCIIEffect extends Effect {

    private characters: string;
    private fontSize: number;
    private cellSize: number;
    private color: string;
    private invert: boolean;
    private clearBackground: boolean;

    constructor({
        characters = ` .:,'-^=*+?!|0#X%WM@`,
        fontSize = 54,
        cellSize = 16,
        color = '#ffffff',
        invert = false,
        clearBackground = false,
    }: IASCIIEffectProps = {}) {
        console.log("CLEAR BG IS", clearBackground)
        const uniforms = new Map<string, Uniform>([
            ['uCharacters', new Uniform(new Texture())],
            ['uCellSize', new Uniform(cellSize)],
            ['uCharactersCount', new Uniform(characters.length)],
            ['uColor', new Uniform(new Color(color))],
            ['uInvert', new Uniform(invert)],
            ['uClearBackground', new Uniform(clearBackground)],
        ]);


        super('ASCIIEffect', fragment, { uniforms });

        this.characters = characters;
        this.fontSize = fontSize;
        this.cellSize = cellSize;
        this.color = color;
        this.invert = invert;
        this.clearBackground = clearBackground;

        this.updateCharacters(characters);
        const charactersTextureUniform = this.uniforms.get('uCharacters');

        if (charactersTextureUniform) {
            charactersTextureUniform.value = this.createCharactersTexture(characters, fontSize);
        }
    }

    public updateProps(newProps: Partial<IASCIIEffectProps>) {
        console.log("UPDATING PROPS!...", newProps);

        // Update the "this." vars in first pass for consistency
        (Object.keys(newProps) as (keyof IASCIIEffectProps)[]).forEach((newPropKey) => {
            if (newProps[newPropKey] !== undefined) {
                // Unsure why TS yelling here :(
                (this as any)[newPropKey] = newProps[newPropKey];
            }
        });

        (Object.keys(newProps) as (keyof IASCIIEffectProps)[]).forEach((newPropKey) => {
            // Takes care of fontSize too
            if (newPropKey === 'clearBackground') {
                const uniform = this.uniforms.get('uClearBackground');
                if (uniform) {
                    uniform.value = this.clearBackground;
                }
            } else if (newPropKey === 'cellSize') {
                const uniform = this.uniforms.get('uCellSize');
                if (uniform) {
                    uniform.value = this.cellSize;
                }
            } else if (newPropKey === 'color') {
                const uniform = this.uniforms.get('uColor');
                if (uniform) {
                    uniform.value = new Color(this.color);
                }
            } else if (newPropKey === 'invert') {
                const uniform = this.uniforms.get('uInvert');
                if (uniform) {
                    uniform.value = this.invert;
                }
            } else if (newPropKey === 'characters' || newPropKey === 'fontSize' || newPropKey === 'clearBackground') {
                this.updateCharacters();
            } 
        });

        

        console.log("NOW THIS IS", this)
    }

    public updateCharacters(newCharacters: string = this.characters) {
        const charactersTextureUniform = this.uniforms.get('uCharacters');
        if (charactersTextureUniform) {
            charactersTextureUniform.value = this.createCharactersTexture(newCharacters, this.fontSize);
        }

        const charactersCountUniform = this.uniforms.get('uCharactersCount');
        if (charactersCountUniform) {
            charactersCountUniform.value = newCharacters.length;
        }


    }

    /** Draws the characters on a Canvas and returns a texture */
    public createCharactersTexture(characters: string, fontSize: number): THREE.Texture {
        const canvas = document.createElement('canvas');

        const SIZE = 1024;
        const MAX_PER_ROW = 16;
        const CELL = SIZE / MAX_PER_ROW;

        canvas.width = canvas.height = SIZE;

        const texture = new CanvasTexture(
            canvas,
            undefined,
            RepeatWrapping,
            RepeatWrapping,
            NearestFilter,
            NearestFilter
        );

        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Context not available');
        }

        context.clearRect(0, 0, SIZE, SIZE);
        // TODO: Parameterize?
        context.font = `bold ${fontSize}px monospace`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#fff';

        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            const x = i % MAX_PER_ROW;
            const y = Math.floor(i / MAX_PER_ROW);

            context.fillText(char, x * CELL + CELL / 2, y * CELL + CELL / 2);
        }

        texture.needsUpdate = true;

        return texture;
    }
}