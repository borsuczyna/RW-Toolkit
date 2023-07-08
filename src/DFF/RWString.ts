import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";
import { RWVersion } from "./enums";

export default class RWString extends Section {
    static staticTypeID = 0x02;
    typeID = RWString.staticTypeID;
    
    string: string = '';

    init(version: RWVersion): this {
        this.string = '';
        this.size = this.getSize(true);
        this.version = version;
        this.typeID = RWString.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.string = readStream.read(DataType.Char, this.size);
        },

        write: (writeStream: WriteStream) => {
            let diff = this.size - this.string.length;
            writeStream.write(this.string, DataType.Bytes, this.string.length);
            if (diff > 0) {
                for (let i = 0; i < diff; i++) writeStream.write(0, DataType.Bytes, 1);
            }
        },

        getSize: () => {
            this.size = this.string.length;
            return this.size;
        }
    }
}