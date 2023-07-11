import { RWVersion } from "../DFF/enums";
import {  } from "../test/adding light";
import { DataType, ReadStream, WriteStream } from "../utils/stream";

export default class Effect2DBase {
    position: [number, number, number] = [0, 0, 0];
    entryType?: number;
    size: number = 0;

    methodContinue?: {
        read?: (readStream: ReadStream) => void;
        write?: (writeStream: WriteStream) => void;
        getSize?: () => number;
        convert?: (version: RWVersion) => void;
    };

    read(readStream: ReadStream) {
        if(!this.entryType && this.entryType != 0) {
            this.position = readStream.readSome(DataType.Float, 3) as [number, number, number];
            this.entryType = readStream.read(DataType.UInt32);
            this.size = readStream.read(DataType.UInt32);
        }

        if(this.methodContinue && this.methodContinue.read) this.methodContinue.read(readStream);
    }

    write(writeStream: WriteStream) {
        writeStream.writeSome(DataType.Float, ...this.position);
        writeStream.write(this.entryType, DataType.UInt32);
        writeStream.write(this.size, DataType.UInt32);

        if(this.methodContinue && this.methodContinue.write) this.methodContinue.write(writeStream);
    }

    getSize() {
        let size = 20;
        if(this.methodContinue && this.methodContinue.getSize) size += this.methodContinue.getSize();
        return size;
    }

    convert(version: RWVersion) {
        if(this.methodContinue && this.methodContinue.convert) this.methodContinue.convert(version);
    }
}

export function recastEffect<T extends Effect2DBase>(section: Effect2DBase, target: T): T {
    target.position = [...section.position];
    target.entryType = section.entryType;
    target.size = section.size;
    return target;
}