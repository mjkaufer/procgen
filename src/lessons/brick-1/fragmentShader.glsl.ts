// @ts-ignore
import glsl from 'glslify';

export default glsl`
  // TODO: Validate precision is set correctly
  // BASE DEPS
  precision highp float;

  uniform mat4 viewMatrix;
  uniform vec3 cameraPosition;

  // CUSTOM UNIFORM ARGS
  uniform vec3 color;
  uniform bool hovered;
  uniform bool temporalPan;
  uniform float time;
  uniform float brickScale;

  // CUSTOM ATTRIBUTES PASSED
  varying vec3 N;
  varying vec3 pos;
  varying vec2 aUV;
  varying vec2 oUV;


  float BRICK_PAD_BASE = 0.0125;
  float BRICK_W_BASE = 0.225;
  float BRICK_H_BASE = 0.1;
  
  void main() {

    float BRICK_PAD = BRICK_PAD_BASE * brickScale;
    float BRICK_W = BRICK_W_BASE * brickScale;
    float BRICK_H = BRICK_H_BASE * brickScale;

    float BRICK_PAD_BORDER = BRICK_PAD * 2.;
    float BRICK_W_FULL = BRICK_W + BRICK_PAD;
    float BRICK_H_FULL = BRICK_H + BRICK_PAD;

    bool isOuterBorder = oUV.x < BRICK_PAD_BORDER || (1. - oUV.x) < BRICK_PAD_BORDER || oUV.y < BRICK_PAD_BORDER || (1. - oUV.y) < BRICK_PAD_BORDER;

    float brickAbsX = aUV.x - BRICK_PAD * 2.0;

    float brickHRel = mod(aUV.y, BRICK_H_FULL);
    float brickRow = floor(aUV.y / BRICK_H_FULL) + 1.0;
    float brickWRel = mod(brickAbsX + (mod(brickRow, 2.) * BRICK_W_FULL / 2.), BRICK_W_FULL);

    bool isBorder = isOuterBorder || brickWRel < BRICK_PAD || (BRICK_W_FULL - brickWRel) < BRICK_PAD || brickHRel < BRICK_PAD || (BRICK_H_FULL - brickHRel) < BRICK_PAD;

    gl_FragColor = !isBorder ? vec4(1., 0., 0., 1.) : vec4(1., 1., 0.6, 1.);
  }`