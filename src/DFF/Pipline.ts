import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";

export default class Pipline extends Section {
    static staticTypeID = 0x1F;
    typeID = Pipline.staticTypeID;
    
    pluginIdentifier: number = 0;
    extraData: number = 0;

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.pluginIdentifier = readStream.read(DataType.UInt32);
            this.extraData = readStream.read(DataType.UInt32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.pluginIdentifier, DataType.UInt32);
            writeStream.write(this.extraData, DataType.UInt32);
        },

        getSize: () => {
            this.size = 8;
            return this.size;
        }
    }
}