import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Effect2DBase from "./Effect2DBase";

export default class Effect2DCoverPoint extends Effect2DBase {
    direction: [number, number] = [0, 0];
    coverType: number = 0;

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.direction = readStream.readSome(DataType.Float, 2) as [number, number];
            this.coverType = readStream.read(DataType.UInt32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.writeSome(DataType.Float, ...this.direction);
            writeStream.write(this.coverType, DataType.UInt32);
        },

        getSize: () => {
            return 12;
        }
    }

    getEffect2DSize() {
        return 12;
    }
}