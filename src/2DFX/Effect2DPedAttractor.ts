import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Effect2DBase from "./Effect2DBase";

enum EnumEffect2DPedAttractor {
	ATM = 0,			// Ped uses ATM (at day time only)
	Seat = 1,			// Ped sits (at day time only)
	Stop = 2,			// Ped stands (at day time only)
	Pizza = 3,			// Ped stands for few seconds
	Shelter = 4,		// Ped goes away after spawning, but stands if weather is rainy
	ScriptTrigger = 5,	// Launches an external script
	LooksAt = 6,		// Ped looks at object, then goes away
	Scripted = 7,		// This type is not valid
	Park = 8,			// Ped lays (at day time only, ped goes away after 6 PM)
	Sit = 9,			// Ped sits on steps
}

export default class Effect2DPedAttractor extends Effect2DBase {
    attractorType: EnumEffect2DPedAttractor = EnumEffect2DPedAttractor.ATM;
    rotationMatrix: [
        [number, number, number],
        [number, number, number],
        [number, number, number]
    ] = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
    externalScriptName: string = "";
    pedExistingProbability: number = 0;
    unsused: number = 0;

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.attractorType = readStream.read(DataType.UInt32);
            this.rotationMatrix = [
                readStream.readSome(DataType.Float, 3) as [number, number, number],
                readStream.readSome(DataType.Float, 3) as [number, number, number],
                readStream.readSome(DataType.Float, 3) as [number, number, number]
            ];
            this.externalScriptName = readStream.read(DataType.Char, 8);
            this.pedExistingProbability = readStream.read(DataType.Int32);
            this.unsused = readStream.read(DataType.UInt32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.attractorType, DataType.UInt32);
            writeStream.writeSome(DataType.Float, ...this.rotationMatrix[0]);
            writeStream.writeSome(DataType.Float, ...this.rotationMatrix[1]);
            writeStream.writeSome(DataType.Float, ...this.rotationMatrix[2]);
            writeStream.write(this.externalScriptName, DataType.Char, 8);
            writeStream.write(this.pedExistingProbability, DataType.Int32);
            writeStream.write(this.unsused, DataType.UInt32);
        },

        getSize: () => {
            return 56;
        }
    }

    getEffect2DSize() {
        return 56;
    }
}