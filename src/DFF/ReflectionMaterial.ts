import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";

export default class ReflectionMaterial extends Section {
    static staticTypeID = 0x0253F2FC;
    typeID = ReflectionMaterial.staticTypeID;

    envMapScaleX: number = 0;
    envMapScaleY: number = 0;
    envMapOffsetX: number = 0;
    envMapOffsetY: number = 0;
    reflectionIntensity: number = 0;
    envTexturePtr: number = 0;

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.envMapScaleX = readStream.read(DataType.Float);
            this.envMapScaleY = readStream.read(DataType.Float);
            this.envMapOffsetX = readStream.read(DataType.Float);
            this.envMapOffsetY = readStream.read(DataType.Float);
            this.reflectionIntensity = readStream.read(DataType.Float);
            this.envTexturePtr = readStream.read(DataType.UInt32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.envMapScaleX, DataType.Float);
            writeStream.write(this.envMapScaleY, DataType.Float);
            writeStream.write(this.envMapOffsetX, DataType.Float);
            writeStream.write(this.envMapOffsetY, DataType.Float);
            writeStream.write(this.reflectionIntensity, DataType.Float);
            writeStream.write(this.envTexturePtr, DataType.UInt32);
        },

        getLength: () => {
            this.size = 24;
            return this.size;
        }
    }
}