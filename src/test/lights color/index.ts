import DFF from "../../DFF/DFF";

let dff = new DFF(__dirname + '/lamppost2.dff')
console.log(dff.clumps[0].geometryList.geometries[0].extension.effect2D.effects)