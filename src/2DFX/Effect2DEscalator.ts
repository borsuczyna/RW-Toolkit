import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Effect2DBase from "./Effect2DBase";

export default class Effect2DEscalator extends Effect2DBase {
    positionBottom: [number, number, number] = [0, 0, 0];
    positionTop: [number, number, number] = [0, 0, 0];
    positionEnd: [number, number, number] = [0, 0, 0];
    direction: number = 0;

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.positionBottom = readStream.readSome(DataType.Float, 3) as [number, number, number];
            this.positionTop = readStream.readSome(DataType.Float, 3) as [number, number, number];
            this.positionEnd = readStream.readSome(DataType.Float, 3) as [number, number, number];
            this.direction = readStream.read(DataType.UInt32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.writeSome(DataType.Float, ...this.positionBottom);
            writeStream.writeSome(DataType.Float, ...this.positionTop);
            writeStream.writeSome(DataType.Float, ...this.positionEnd);
            writeStream.write(this.direction, DataType.UInt32);
        },

        getSize: () => {
            return 40;
        }
    }

    getEffect2DSize() {
        return 40;
    }
}