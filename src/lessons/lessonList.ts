
import { IView } from "../common";

import BrickView from "./brick-1/View";
import SpookyTorusView from "./spooky-torus/View";
import VinesView from "./vines/View";
import DeformView from "./deform/View";
import PixelView from "./pixel-shader/View";
import ExumView from "./exum/View";
import TwoDPostProcessingView from './2d-postprocessing/View';
import BoatView from './boat/View';
import CanvasShaderView from './canvas-shader/View';

export const lessons: IView[] = [
  BrickView,
  SpookyTorusView,
  VinesView,
  DeformView,
  PixelView,
  ExumView,
  TwoDPostProcessingView,
  BoatView,
  CanvasShaderView,
].reverse();