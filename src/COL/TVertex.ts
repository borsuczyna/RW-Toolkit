import { DataType, ReadStream, WriteStream } from "../utils/stream";

export default class TVertex {
    x: number = 0;
    y: number = 0;
    z: number = 0;

    read(readStream: ReadStream) {
        this.x = readStream.read(DataType.Float);
        this.y = readStream.read(DataType.Float);
        this.z = readStream.read(DataType.Float);
    }

    write(writeStream: WriteStream) {
        writeStream.writeSome(DataType.Float, this.x, this.y, this.z);
    }

    toString(): string {
        return `[${this.x}, ${this.y}, ${this.z}]`;
    }
}