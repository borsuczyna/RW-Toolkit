import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";
import { RWVersion } from "./enums";

export default class MorphPLG extends Section {
    static staticTypeID = 0x105;
    typeID = MorphPLG.staticTypeID;

    unused: number = 0;

    init(version: RWVersion) {
        this.unused = 0;
        this.size = this.getSize(true);
        this.version = version;
        this.type = MorphPLG.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.unused = readStream.read(DataType.UInt32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.unused, DataType.UInt32);
        },

        getSize: () => {
            this.size = 4;
            return this.size;
        }
    }
}