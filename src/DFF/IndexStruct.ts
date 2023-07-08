import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Struct from "./Struct";

export default class IndexStruct extends Struct {
    index: number = 0;

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.index = readStream.read(DataType.UInt32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.index, DataType.UInt32);
        },

        getSize: () => {
            this.size = 4;
            return this.size;
        }
    }
}