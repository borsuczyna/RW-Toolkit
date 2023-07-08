import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Effect2DBase from "./Effect2DBase";

export default class Effect2DTriggerPoint extends Effect2DBase {
    index: number = 0;
    position: [number, number, number] = [0, 0, 0];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.index = readStream.read(DataType.UInt32);
            this.position = readStream.readSome(DataType.Float, 3) as [number, number, number];
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.index, DataType.UInt32);
            writeStream.writeSome(DataType.Float, ...this.position);
        },

        getSize: () => {
            return 16;
        }
    }

    getEffect2DSize() {
        return 4;
    }
}