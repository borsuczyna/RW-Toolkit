import { DataType, ReadStream, WriteStream } from "../stream/stream";

export default class TSurface {
    material: number = 0;
    flags: number = 0;
    brightness: number = 0;
    light: number = 0;

    read(readStream: ReadStream) {
        this.material = readStream.read(DataType.UInt8);
        this.flags = readStream.read(DataType.UInt8);
        this.brightness = readStream.read(DataType.UInt8);
        this.light = readStream.read(DataType.UInt8);
    }

    write(writeStream: WriteStream) {
        writeStream.writeSome(
            DataType.UInt8,
            this.material,
            this.flags,
            this.brightness,
            this.light
        );
    }

    getSize(): number {
        return 4;
    }

    toString(): string {
        return `TSurface {
    material: ${this.material},
    flags: ${this.flags},
    brightness: ${this.brightness},
    light: ${this.light}
}`;
    }
}