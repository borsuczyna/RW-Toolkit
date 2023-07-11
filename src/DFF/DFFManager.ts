import Effect2DBase from "../2DFX/Effect2DBase";
import DFF from "./DFF";

type ManagerMap<T> = {
    element: T;
    clump?: number;
    geometry?: number;
}[];

class Effects {
    private effects: Effect2DBase[] = [];
    private manager: ManagerMap<Effect2DBase> = [];

    constructor(effects: Effect2DBase[], manager: ManagerMap<Effect2DBase>) {
        this.effects = effects;
        this.manager = manager;
    }

    get length() {
        return this.effects.length;
    }

    map(callback: (effect: Effect2DBase, index?: number, effects?: Effect2DBase[]) => Effect2DBase) {
        return this.effects.map(callback);
    }

    forEach(callback: (effect: Effect2DBase, index?: number, effects?: Effect2DBase[]) => void) {
        return this.effects.forEach(callback);
    }

    getManager(effect: Effect2DBase) {
        return this.manager.find(m => m.element === effect);
    }

    // removing first and last element 
    shift() {
        this.effects.shift();
        this.manager.shift();
    }

    pop() {
        this.effects.pop();
        this.manager.pop();
    }

    push(effect: Effect2DBase, clump?: number, geometry?: number) {
        this.effects.push(effect);
        this.manager.push({
            element: effect,
            clump,
            geometry
        });

        return this;
    }
}

export class DFFManager {
    dff: DFF;

    constructor(fileOrData: string | Buffer) {
        this.dff = new DFF(fileOrData);
    }

    save(filePath: string) {
        this.dff.save(filePath);
    }

    get effects(): Effects {
        let effects: Effect2DBase[] = [];
        let manager: ManagerMap<Effect2DBase> = [];

        let clumpIndex = 0;
        for(let clump of this.dff.clumps) {
            let geometryIndex = 0;
            for(let geometry of clump.geometryList.geometries) {
                if(geometry.extension && geometry.extension.effect2D) {
                    for(let effect of geometry.extension.effect2D.effects) {
                        effects.push(effect);
                        manager.push({
                            element: effect,
                            clump: clumpIndex,
                            geometry: geometryIndex
                        });
                    }
                }
                geometryIndex++;
            }
            clumpIndex++;
        }

        return new Effects(effects, manager);
    }

    set effects(effects: Effects) {
        this.dff.clumps.forEach(clump => {
            clump.geometryList.geometries.forEach(geometry => {
                if(geometry.extension && geometry.extension.effect2D) {
                    geometry.extension.effect2D.effects = [];
                }
            });
        });

        effects.forEach((effect, index) => {
            let manager = effects.getManager(effect);
            if(manager) {
                if(manager.clump !== undefined && manager.geometry !== undefined) {
                    this.dff.clumps[manager.clump].geometryList.geometries[manager.geometry].extension.effect2D.effects.push(effect);
                } else {
                    this.dff.clumps[0].geometryList.geometries[0].extension.effect2D.effects.push(effect);
                }
            }
        });
    }
}