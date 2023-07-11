import Effect2DLight from "../../2DFX/Effect2DLight";
import { DFFManager } from "../../DFF/DFFManager";

let dff = new DFFManager(__dirname + '/lamppost2.dff')
// console.log(dff.effects);
let effects = dff.effects;

let light = new Effect2DLight();
light.color = [0, 0, 255, 255];
light.position = [0, 0, 6];
effects.push(light);

console.log(effects)

// effects.map(e => {
//     if(e instanceof Effect2DLight) {
//         e.color = [0, 255, 0, 255];
//     }

//     return e;
// });

// dff.effects = effects;

// dff.dff.clumps[0].geometryList.geometries[0].extension.effect2D.effects.map(e => (<Effect2DLight>e).color = [255, 0, 0, 255]);

// clone object dff.dff.clumps[0].geometryList.geometries[0].extension.effect2D.effects[0]
// let light = new Effect2DLight();
// light.position = [2, 0, 8];

// dff.dff.clumps[0].geometryList.geometries[0].extension.effect2D.effects.push(light);

dff.save(__dirname + '/output.dff')