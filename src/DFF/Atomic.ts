import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Extension from "./Extension";
import MaterialEffectPLG from "./MaterialEffectPLG";
import Pipline from "./Pipline";
import Section, { recastSection } from "./Section";
import Struct from "./Struct";
import { RWVersion } from "./enums";

class AtomicStruct extends Struct {
    frameIndex: number = 0;
    geometryIndex: number = 0;
    flags: number = 5;
    unused: number = 0;

    // Casted from flags
    atomicCollisionTest: boolean = false;
    atomicRender: boolean = false;

    init(version: RWVersion): this {
        this.frameIndex = 0;
        this.geometryIndex = 0;
        this.flags = 5;
        this.unused = 0;
        this.size = this.getSize(true);
        this.version = version;
        this.type = AtomicStruct.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.frameIndex = readStream.read(DataType.UInt32);
            this.geometryIndex = readStream.read(DataType.UInt32);
            this.flags = readStream.read(DataType.UInt32);
            this.unused = readStream.read(DataType.UInt32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.frameIndex, DataType.UInt32);
            writeStream.write(this.geometryIndex, DataType.UInt32);
            writeStream.write(this.flags, DataType.UInt32);
            writeStream.write(this.unused, DataType.UInt32);
        },

        getSize: () => {
            this.size = 16;
            return this.size;
        }
    }
}

class AtomicExtension extends Extension {
    pipline?: Pipline;
    materialEffect?: MaterialEffectPLG;

    init(version: RWVersion): this {
        this.size = this.getSize(true);
        this.version = version;
        this.type = AtomicExtension.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            let nextSection: Section;
            let readSize = 0;

            if(this.size != 0) {
                while(true) {
                    nextSection = new Section();
                    nextSection.parent = this;
                    nextSection.read(readStream);

                    if(nextSection.type == Pipline.staticTypeID) {
                        this.pipline = recastSection(nextSection, new Pipline());
                    } else if(nextSection.type == MaterialEffectPLG.staticTypeID) {
                        this.materialEffect = recastSection(nextSection, new MaterialEffectPLG());
                    } else throw new Error(`Unknown atomic plugin: ${nextSection.type.toString(16)}`);

                    nextSection.parent = this;
                    nextSection.read(readStream);
                    readSize += nextSection.size + 12;

                    if(readSize >= this.size) break;
                }
            }
        },

        write: (writeStream: WriteStream) => {
            if(this.pipline) this.pipline.write(writeStream);
            if(this.materialEffect) this.materialEffect.write(writeStream);
        },

        getSize: () => {
            let size = (this.pipline ? this.pipline.getSize() : 0) + (this.materialEffect ? this.materialEffect.getSize() : 0);
            this.size = size;
            return size;
        },

        convert: (version: RWVersion) => {
            if(this.pipline) this.pipline.convert(version);
            if(this.materialEffect) this.materialEffect.convert(version);
        }
    }
}

export default class Atomic extends Section {
    static staticTypeID = 0x14;
    typeID = 0x14;

    struct: AtomicStruct = new AtomicStruct().init(this.version);
    extension: AtomicExtension = new AtomicExtension().init(this.version);

    init(version: RWVersion): this {
        this.struct = new AtomicStruct().init(version);
        this.struct.parent = this;
        this.extension = new AtomicExtension().init(version);
        this.extension.parent = this;
        this.size = this.getSize(true);
        this.version = version;
        this.type = Atomic.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.struct = new AtomicStruct();
            this.struct.parent = this;
            this.struct.read(readStream);
            this.extension = new AtomicExtension();
            this.extension.parent = this;
            this.extension.read(readStream);
        },

        write: (writeStream: WriteStream) => {
            this.struct.write(writeStream);
            this.extension.write(writeStream);
        },

        getSize: () => {
            this.size = this.struct.getSize() + this.extension.getSize();
            return this.size;
        },

        convert: (version: RWVersion) => {
            this.struct.convert(version);
            this.extension.convert(version);
        }
    }
}