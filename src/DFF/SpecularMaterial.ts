import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";

export default class SpecularMaterial extends Section {
    static staticTypeID = 0x0253F2F6;
    typeID = SpecularMaterial.staticTypeID;
    
    specularLevel: number = 0;
    textureName: string = "";

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.specularLevel = readStream.read(DataType.Float);
            this.textureName = readStream.read(DataType.Char, 24);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.specularLevel, DataType.Float);
            writeStream.write(this.textureName, DataType.Char, 24);
        },

        getSize: () => {
            this.size = 28;
            return this.size;
        }
    }
}