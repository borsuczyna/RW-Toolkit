import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";

export default class COLSection extends Section {
    static staticTypeID = 0x253F2FA;
    typeID = COLSection.staticTypeID;
    
    collisionRaw: Buffer = Buffer.alloc(0);

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.collisionRaw = readStream.read(DataType.Bytes, this.size);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.collisionRaw, DataType.Bytes, this.collisionRaw.length);
        },

        getSize: () => {
            this.size = this.collisionRaw.length;
            return this.size;
        }
    };
}