import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Effect2DBase from "./Effect2DBase";

export default class Effect2DEnterExit extends Effect2DBase {
    enterAngle: number = 0;
    radiusX: number = 0;
    radiusY: number = 0;
    exitPosition: [number, number, number] = [0, 0, 0];
    exitAngle: number = 0;
    interior: number = 0;
    flags: number = 0;
    interiorName: string = "";
    skyColor: [number, number, number, number] = [0, 0, 0, 0];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.enterAngle = readStream.read(DataType.Float);
            this.radiusX = readStream.read(DataType.Float);
            this.radiusY = readStream.read(DataType.Float);
            this.exitPosition = readStream.readSome(DataType.Float, 3) as [number, number, number];
            this.exitAngle = readStream.read(DataType.Float);
            this.interior = readStream.read(DataType.Int32);
            this.flags = readStream.read(DataType.UInt32);
            this.interiorName = readStream.read(DataType.Char, 8);
            this.skyColor = readStream.readSome(DataType.UInt8, 4) as [number, number, number, number];
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.enterAngle, DataType.Float);
            writeStream.write(this.radiusX, DataType.Float);
            writeStream.write(this.radiusY, DataType.Float);
            writeStream.writeSome(DataType.Float, ...this.exitPosition);
            writeStream.write(this.exitAngle, DataType.Float);
            writeStream.write(this.interior, DataType.Int32);
            writeStream.write(this.flags, DataType.UInt32);
            writeStream.write(this.interiorName, DataType.Char, 8);
            writeStream.writeSome(DataType.UInt8, ...this.skyColor);
        },

        getSize: () => {
            return 48;
        }
    }

    getEffect2DSize() {
        return 48;
    }
}