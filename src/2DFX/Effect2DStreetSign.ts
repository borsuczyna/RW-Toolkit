import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Effect2DBase from "./Effect2DBase";

export default class Effect2DStreetSign extends Effect2DBase {
    effectSize: [number, number] = [0, 0];
    rotation: [number, number, number] = [0, 0, 0];
    flags: number = 0;
    text: [string, string, string, string] = ["", "", "", ""];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.effectSize = readStream.readSome(DataType.Float, 2) as [number, number];
            this.rotation = readStream.readSome(DataType.Float, 3) as [number, number, number];
            this.flags = readStream.read(DataType.UInt16);
            this.text = readStream.readSome(DataType.Char, 16) as [string, string, string, string];
        },

        write: (writeStream: WriteStream) => {
            writeStream.writeSome(DataType.Float, ...this.effectSize);
            writeStream.writeSome(DataType.Float, ...this.rotation);
            writeStream.write(this.flags, DataType.UInt16);
            writeStream.writeSome(DataType.Char, ...this.text);
        },

        getSize: () => {
            return 88;
        }
    }

    getEffect2DSize() {
        return 88;
    }
}