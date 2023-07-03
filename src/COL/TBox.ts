import { DataType, ReadStream, WriteStream } from "../stream/stream";
import TSurface from "./TSurface";

export default class TBox {
    min: [number, number, number] = [0, 0, 0];
    max: [number, number, number] = [0, 0, 0];
    surface: TSurface = new TSurface();

    read(readStream: ReadStream) {
        this.min = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
        this.max = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
        this.surface = new TSurface();
        this.surface.read(readStream);
    }

    write(writeStream: WriteStream) {
        writeStream.writeSome(DataType.Float, this.min[0], this.min[1], this.min[2]);
        writeStream.writeSome(DataType.Float, this.max[0], this.max[1], this.max[2]);
        this.surface.write(writeStream);
    }

    getSize(): number {
        return 4 * 6 + this.surface.getSize();
    }
}