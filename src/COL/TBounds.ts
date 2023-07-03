import { DataType, ReadStream, WriteStream } from "../utils/stream";
import { COLVersion } from "./COL";

export default class TBounds {
    radius: number = 0;
    center: [number, number, number] = [0, 0, 0];
    min: [number, number, number] = [0, 0, 0];
    max: [number, number, number] = [0, 0, 0];

    read(readStream: ReadStream, version: COLVersion = 'COL3') {
        if(version == 'COLL') {
            this.radius = readStream.read(DataType.Float);
            this.center = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
            this.min = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
            this.max = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
        } else {
            this.min = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
            this.max = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
            this.center = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
            this.radius = readStream.read(DataType.Float);
        }
    }

    write(writeStream: WriteStream, version: COLVersion = 'COL3') {
        if(version == 'COLL') {
            writeStream.write(this.radius, DataType.Float);
            writeStream.writeSome(DataType.Float, this.center[0], this.center[1], this.center[2]);
            writeStream.writeSome(DataType.Float, this.min[0], this.min[1], this.min[2]);
            writeStream.writeSome(DataType.Float, this.max[0], this.max[1], this.max[2]);
        } else {
            writeStream.writeSome(DataType.Float, this.min[0], this.min[1], this.min[2]);
            writeStream.writeSome(DataType.Float, this.max[0], this.max[1], this.max[2]);
            writeStream.writeSome(DataType.Float, this.center[0], this.center[1], this.center[2]);
            writeStream.write(this.radius, DataType.Float);
        }
    }

    getSize(): number {
        return 4 * 10;
    }

    toString(): string {
        return `TBounds {
    radius: ${this.radius},
    center: [${this.center[0]}, ${this.center[1]}, ${this.center[2]}],
    min: [${this.min[0]}, ${this.min[1]}, ${this.min[2]}],
    max: [${this.max[0]}, ${this.max[1]}, ${this.max[2]}]
}`;
    }
}