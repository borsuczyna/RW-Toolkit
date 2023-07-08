import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Extension from "./Extension";
import Section from "./Section";
import Struct from "./Struct";
import { RWVersion } from "./enums";

class LightStruct extends Struct {
    radius: number = 0;
    color: [number, number, number] = [0, 0, 0];
    direction: number = 0;
    flags: number = 0;
    lightType: number = 0;

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.radius = readStream.read(DataType.Float);
            this.color = readStream.readSome(DataType.Float, 3) as [number, number, number];
            this.direction = readStream.read(DataType.Float);
            this.flags = readStream.read(DataType.UInt16);
            this.lightType = readStream.read(DataType.UInt16);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.radius, DataType.Float);
            writeStream.writeSome(DataType.Float, ...this.color);
            writeStream.write(this.direction, DataType.Float);
            writeStream.write(this.flags, DataType.UInt16);
            writeStream.write(this.lightType, DataType.UInt16);
        },

        getSize: () => {
            this.size = 24;
            return this.size;
        }
    }
}

export default class Light extends Section {
    static staticTypeID = 0x12;
    typeID = Light.staticTypeID;

    struct: LightStruct = new LightStruct();
    extension: Extension = new Extension();

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.struct = new LightStruct();
            this.struct.parent = this;
            this.struct.read(readStream);
            this.extension = new Extension();
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