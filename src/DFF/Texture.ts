import { bExtract } from "../utils/bit";
import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Extension from "./Extension";
import RWString from "./RWString";
import Section from "./Section";
import Struct from "./Struct";
import { RWVersion } from "./enums";

class TextureStruct extends Struct {
    flags: number = 0;

    // Casted from flags
    filter: number = 0;
    UAddressing: number = 0;
    VAddressing: number = 0;
    hasMipMaps: boolean = false;

    init(version: RWVersion): this {
        this.flags = 0
        this.size = this.getSize(true);
        this.version = version;
        this.type = TextureStruct.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.flags = readStream.read(DataType.UInt32);

            // Cast flags
            this.filter = bExtract(this.flags, 24, 8);
            this.UAddressing = bExtract(this.flags, 24, 4);
            this.VAddressing = bExtract(this.flags, 20, 4);
            this.hasMipMaps = bExtract(this.flags, 19) === 1;
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.flags, DataType.UInt32);
        },

        getSize: () => {
            this.size = 4;
            return this.size;
        }
    }
}

export default class Texture extends Section {
    static staticTypeID = 0x06;
    typeID = 0x06;

    struct: TextureStruct = new TextureStruct().init(this.version);
    textureName: RWString = new RWString().init(this.version);
    maskName: RWString = new RWString().init(this.version);
    extension: Extension = new Extension().init(this.version);

    init(version: RWVersion): this {
        this.struct = new TextureStruct().init(version);
        this.struct.parent = this;
        this.textureName = new RWString().init(version);
        this.textureName.parent = this;
        this.maskName = new RWString().init(version);
        this.maskName.parent = this;
        this.extension = new Extension().init(version);
        this.extension.parent = this;
        this.size = this.getSize(true);
        this.version = version;
        this.type = Texture.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            // Read texture struct
            this.struct = new TextureStruct();
            this.struct.parent = this;
            this.struct.read(readStream);

            // Read texture name
            this.textureName = new RWString();
            this.textureName.parent = this;
            this.textureName.read(readStream);

            // Read mask name
            this.maskName = new RWString();
            this.maskName.parent = this;
            this.maskName.read(readStream);

            // Read extension
            this.extension = new Extension();
            this.extension.parent = this;
            this.extension.read(readStream);

        },

        write: (writeStream: WriteStream) => {
            this.struct.write(writeStream);
            this.textureName.write(writeStream);
            this.maskName.write(writeStream);
            this.extension.write(writeStream);
        },

        getSize: () => {
            this.size = this.struct.getSize() + this.textureName.getSize() + this.maskName.getSize() + this.extension.getSize();
            return this.size;
        },

        convert: (version: RWVersion) => {
            this.struct.convert(version);
        }
    }
}