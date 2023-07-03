import { DataType, ReadStream, WriteStream } from "../stream/stream";
import { COLVersion } from "./COL";
import TSurface from "./TSurface";

export default class TFace {
    a: number = 0;
    b: number = 0;
    c: number = 0;
    material: number = 0;
    light: number = 0;
    surface: TSurface = new TSurface();

    read(readStream: ReadStream, version: COLVersion = 'COL3') {
        if(version == 'COLL') {
            this.a = readStream.read(DataType.UInt32);
            this.b = readStream.read(DataType.UInt32);
            this.c = readStream.read(DataType.UInt32);
        } else {
            this.a = readStream.read(DataType.UInt16);
            this.b = readStream.read(DataType.UInt16);
            this.c = readStream.read(DataType.UInt16);
            this.material = readStream.read(DataType.UInt8);
            this.light = readStream.read(DataType.UInt8);
        }

        this.surface = new TSurface();
        this.surface.read(readStream);
    }

    write(writeStream: WriteStream, version: COLVersion = 'COL3') {
        if(version == 'COLL') {
            writeStream.writeSome(DataType.UInt32, this.a, this.b, this.c);
        } else {
            writeStream.writeSome(DataType.UInt16, this.a, this.b, this.c);
            writeStream.writeSome(DataType.UInt8, this.material, this.light); // idk?
        }

        this.surface.write(writeStream);
    }

    getSize(version: COLVersion = 'COL3') {
        if(version == 'COLL') {
            return 4 * 3 + this.surface.getSize();
        } else {
            return  2 * 3 + 2;
        }
    }

    toString(): string {
        return `TFace {
    a: ${this.a},
    b: ${this.b},
    c: ${this.c},
    material: ${this.material},
    light: ${this.light},
    surface: ${this.surface.toString()}
}`;
    }
}