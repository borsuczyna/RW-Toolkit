import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";

export default class NightVertexColor extends Section {
    static staticTypeID = 0x253F2F9;
    typeID = NightVertexColor.staticTypeID;

    hasColor: number = 0;
    colors: [number, number, number, number][] = [];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.hasColor = readStream.read(DataType.UInt32);
            this.colors = [];

            for (let i = 0; i < (this.size-4)/4; i++) {
                this.colors.push(readStream.readSome(DataType.UInt8, 4) as [number, number, number, number]);
            }
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.hasColor, DataType.UInt32);

            for (let i = 0; i < this.colors.length; i++) {
                writeStream.writeSome(DataType.UInt8, ...this.colors[i]);
            }
        },

        getSize: (): number => {
            let size = 4*this.colors.length + 4;
            this.size = size;
            return size;
        }
    }
}