import { DataType, ReadStream, WriteStream } from "../stream/stream";
import { COLVersion } from "./COL";
import TSurface from "./TSurface";

export default class TSphere {
    radius: number = 0;
    center: [number, number, number] = [0, 0, 0];
    surface: TSurface = new TSurface();

    read(readStream: ReadStream, version: COLVersion = 'COL3') {
        if(version == 'COLL') {
            this.radius = readStream.read(DataType.Float);
            this.center = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
            this.surface = new TSurface();
            this.surface.read(readStream);
        } else {
            this.center = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
            this.radius = readStream.read(DataType.Float);
            this.surface = new TSurface();
            this.surface.read(readStream);
        }
    }

    write(writeStream: WriteStream, version: COLVersion = 'COL3') {
        if(version == 'COLL') {
            writeStream.write(this.radius, DataType.Float);
            writeStream.writeSome(DataType.Float, this.center[0], this.center[1], this.center[2]);
            this.surface.write(writeStream);
        } else {
            writeStream.writeSome(DataType.Float, this.center[0], this.center[1], this.center[2]);
            writeStream.write(this.radius, DataType.Float);
            this.surface.write(writeStream);
        }
    }

    getSize(): number {
        return 4 * 10 + this.surface.getSize();
    }

    toString(): string {
        return `TSphere {
    radius: ${this.radius},
    center: [${this.center[0]}, ${this.center[1]}, ${this.center[2]}],
    surface: ${this.surface.toString()}
}`;
    }
}