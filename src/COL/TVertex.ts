import { DataType, ReadStream, WriteStream } from "../stream/stream";

export default class TVertex {
    read(readStream: ReadStream) {
        this[0] = readStream.read(DataType.Float);
        this[1] = readStream.read(DataType.Float);
        this[2] = readStream.read(DataType.Float);
    }

    write(writeStream: WriteStream) {
        writeStream.writeSome(DataType.Float, this[0], this[1], this[2]);
    }

    toString(): string {
        return `[${this[0]}, ${this[1]}, ${this[2]}]`;
    }
}