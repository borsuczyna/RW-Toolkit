import { DataType, ReadStream, WriteStream } from "../utils/stream";
import DFF from "./DFF";
import Extension from "./Extension";
import Struct from "./Struct";
import { RWVersion } from "./enums";

export default class Section {
    static staticTypeID?: number;
    typeID?: number;
    type: number = 0;
    size: number = 0;
    sizeVersion: number = 0;

    // @ts-ignore
    version: RWVersion;
    parent?: Section | Extension | Struct | DFF;

    methodContinue?: {
        read?: (readStream: ReadStream) => void;
        write?: (writeStream: WriteStream) => void;
        getSize?: () => number;
        convert?: (version: RWVersion) => void;
    };

    read(readStream: ReadStream) {
        if(!this.version) {
            this.type = readStream.read(DataType.UInt32);
            this.size = readStream.read(DataType.UInt32);
            this.version = readStream.read(DataType.UInt32);
            this.sizeVersion = 0;

            if(this.typeID && this.typeID !== this.type) throw new Error(`Expected section type ${this.typeID.toString(16)}, got ${this.type.toString(16)}`);
        }

        if(this.methodContinue && this.methodContinue.read) this.methodContinue.read(readStream);
    }

    write(writeStream: WriteStream) {
        writeStream.write(this.type, DataType.UInt32);
        writeStream.write(this.size, DataType.UInt32);
        writeStream.write(this.version || 0, DataType.UInt32);

        if(this.methodContinue && this.methodContinue.write) this.methodContinue.write(writeStream);
    }

    getSize(excludeSection: boolean = false): number {
        let size = excludeSection ? 0 : 12;
        if(this.methodContinue && this.methodContinue.getSize) size += this.methodContinue.getSize();
        return size;
    }

    convert(version: RWVersion) {
        this.version = version;

        if(this.methodContinue && this.methodContinue.convert) this.methodContinue.convert(version);
    }
}

export function recastSection<T extends Section>(section: Section, target: T): T {
    target.type = section.type;
    target.size = section.size;
    target.version = section.version;
    target.sizeVersion = section.sizeVersion;
    target.parent = section.parent;
    return target;
}