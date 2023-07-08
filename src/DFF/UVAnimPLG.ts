import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";
import Struct from "./Struct";
import { RWVersion } from "./enums";

class UVAnimPLGStruct extends Struct {
    unused: number = 0;
    name: string = "";

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.unused = readStream.read(DataType.UInt32);
            this.name = readStream.read(DataType.Char, 32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.unused, DataType.UInt32);
            writeStream.write(this.name, DataType.Char, 32);
        },

        getSize: () => {
            this.size = 36;
            return this.size;
        }
    }
}

export default class UVAnimPLG extends Section {
    static staticTypeID = 0x135;
    typeID = UVAnimPLG.staticTypeID;

    struct: UVAnimPLGStruct = new UVAnimPLGStruct();

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.struct = new UVAnimPLGStruct();
            this.struct.parent = this;
            this.struct.read(readStream);
        },

        write: (writeStream: WriteStream) => {
            this.struct.write(writeStream);
        },

        getSize: () => {
            this.size = this.struct.getSize();
            return this.size;
        },

        convert: (version: RWVersion) => {
            this.struct.convert(version);
        }
    }
}