import Effect2DLight from "../../2DFX/Effect2DLight";
import { DFFManager } from "../../DFF/DFFManager";

let dff = new DFFManager(__dirname + '/lamppost2.dff')
let effects = dff.effects;

let light = new Effect2DLight();
light.color = [255, 0, 0, 255];
light.position = [0, 0, 8];
effects.push(light);

dff.effects = effects;
dff.save(__dirname + '/output.dff')