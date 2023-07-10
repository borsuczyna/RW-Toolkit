import Section from "../DFF/Section";
import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Effect2DBase, { recastEffect } from "./Effect2DBase";
import Effect2DCoverPoint from "./Effect2DCoverPoint";
import Effect2DEnterExit from "./Effect2DEnterExit";
import Effect2DEscalator from "./Effect2DEscalator";
import Effect2DLight from "./Effect2DLight";
import Effect2DParticleEffect from "./Effect2DParticleEffect";
import Effect2DPedAttractor from "./Effect2DPedAttractor";
import Effect2DStreetSign from "./Effect2DStreetSign";
import Effect2DSunGlare from "./Effect2DSunGlare";
import Effect2DTriggerPoint from "./Effect2DTriggerPoint";

enum EnumEffect2D {
    Light = 0x00,
	ParticleEffect = 0x01,
	PedAttractor = 0x03,
	SunGlare = 0x04,
	EnterExit = 0x06,
	StreetSign = 0x07,
	TriggerPoint = 0x08,
	CovePoint = 0x09,
	Escalator = 0x0A
}

enum Effect2DLightShowMode {
	Default = 0,
	RandomFlashing = 1,
	RandomFlashingAtWetWeather = 2,
	AnimSpeed4X = 3,
	AnimSpeed2X = 4,
	AnimSpeed1X = 5,
	Unused = 6,
	TrafficLight = 7,
	TrainCrossLight = 8,
	Disabled = 9,
	AtRainOnly = 10,
	On5S_Off5S = 11,
	On6S_Off4S = 11,
	On4S_Off6S = 12,
}

const effect2DTypes = [
    Effect2DLight,
    Effect2DParticleEffect,
    Effect2DPedAttractor,
    Effect2DSunGlare,
    Effect2DEnterExit,
    Effect2DStreetSign,
    Effect2DTriggerPoint,
    Effect2DCoverPoint,
    Effect2DEscalator
];

export default class Effect2D extends Section {
    static staticTypeID = 0x0253F2F8;
    typeID = Effect2D.staticTypeID;

    count: number = 0;
    effects: Effect2DBase[] = [];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.count = readStream.read(DataType.UInt32);
            let readSize = 4;
            this.effects = [];
            let nextEffect2D: Effect2DBase;

            while(true) {
                nextEffect2D = new Effect2DBase();
                nextEffect2D.read(readStream);
                if(!effect2DTypes[nextEffect2D.entryType]) throw new Error(`Unknown Effect2D type: ${nextEffect2D.entryType}`);
                let effect = recastEffect(nextEffect2D, new effect2DTypes[nextEffect2D.entryType]());
                effect.read(readStream);
                this.effects.push(effect);

                readSize += effect.getSize();
                if(readSize >= this.size) break;
            }
        },

        write: (writeStream: WriteStream) => {
            this.count = this.effects.length;
            writeStream.write(this.count, DataType.UInt32);

            for(let effect of this.effects) {
                effect.write(writeStream);
            }
        },

        getSize: () => {
            let size = 4;
            for(let effect of this.effects) {
                size += effect.getSize();
            }
            this.size = size;
            return size;
        }
    }
}