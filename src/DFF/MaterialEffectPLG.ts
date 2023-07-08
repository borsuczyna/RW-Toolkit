import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";
import Texture from "./Texture";
import { RWVersion } from "./enums";

export default class MaterialEffectPLG extends Section {
    static staticTypeID = 0x120;
    typeID = MaterialEffectPLG.staticTypeID;

    effectType: number = 0x00;

    // 0x02
    texture?: Texture;
    unused: number = 0;
    reflectionCoefficient: number = 0;
    useFrameBufferAlphaChannel: boolean = false;
    useEnvMap: boolean = false;
    endPadding: number = 0;

    // 0x05
    // unused: number;
    // endPadding: number;

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.effectType = readStream.read(DataType.UInt32);
            if(this.effectType == 0x00 || this.effectType == 0x01) {
                // Nothing to do
            } else if(this.effectType == 0x02) {
                this.unused = readStream.read(DataType.UInt32);
                this.reflectionCoefficient = readStream.read(DataType.Float);
                this.useFrameBufferAlphaChannel = readStream.read(DataType.UInt32) == 1;
                this.useEnvMap = readStream.read(DataType.UInt32) == 1;

                if(this.useEnvMap) {
                    this.texture = new Texture();
                    this.texture.parent = this;
                    this.texture.read(readStream);
                }

                this.endPadding = readStream.read(DataType.UInt32);
            } else if(this.effectType == 0x05) {
                this.unused = readStream.read(DataType.UInt32);
                this.endPadding = readStream.read(DataType.UInt32);
            } else {
                throw new Error(`Unknown effect type: ${this.effectType}`);
            }
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.effectType, DataType.UInt32);
            if(this.effectType == 0x00 || this.effectType == 0x01) {
                // Nothing to do
            } else if(this.effectType == 0x02) {
                writeStream.write(this.unused, DataType.UInt32);
                writeStream.write(this.reflectionCoefficient, DataType.Float);
                writeStream.write(this.useFrameBufferAlphaChannel ? 1 : 0, DataType.UInt32);
                writeStream.write(this.useEnvMap ? 1 : 0, DataType.UInt32);

                if(this.useEnvMap) {
                    this.texture!.write(writeStream);
                }

                writeStream.write(this.endPadding, DataType.UInt32);
            }
        },

        getSize: () => {
            let size = 4;
            if(this.effectType == 0x00 || this.effectType == 0x01) {
                // Nothing to do
            } else if(this.effectType == 0x02) {
                size += 4*5 + (this.useEnvMap ? this.texture!.getSize() : 0) + 4;
            } else if(this.effectType == 0x05) {
                size += 8+4;
            }
            this.size = size;
            return size;
        },

        convert: (version: RWVersion) => {
            if(this.useEnvMap) this.texture!.convert(version);
        }
    }
}