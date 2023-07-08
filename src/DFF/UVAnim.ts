import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";
import Struct from "./Struct";
import { RWVersion } from "./enums";

interface UVAnimData {
    time: number;
    scale: [number, number, number];
    position: [number, number, number];
    previousFrame: number;
}

class UVAnim extends Section {
    static staticTypeID = 0x1B;
    typeID = UVAnim.staticTypeID;

    header: number = 0;
    animType: number = 0;
    frameCount: number = 0;
    flags: number = 0;
    duration: number = 0;
    unused: number = 0;
    name: string = "";
    nodeToUVChannel: number[] = [];
    data: UVAnimData[] = [];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.header = readStream.read(DataType.UInt32);
            this.animType = readStream.read(DataType.UInt32);
            this.frameCount = readStream.read(DataType.UInt32);
            this.flags = readStream.read(DataType.UInt32);
            this.duration = readStream.read(DataType.Float);
            this.unused = readStream.read(DataType.UInt32);
            this.name = readStream.read(DataType.Char, 32);

            this.nodeToUVChannel = [];
            for(let i = 0; i < 8; i++) {
                this.nodeToUVChannel.push(readStream.read(DataType.Float));
            }

            this.data = [];
            for(let i = 0; i < this.frameCount; i++) {
                let nextData: UVAnimData = {
                    time: readStream.read(DataType.Float),
                    scale: readStream.readSome(DataType.Float, 3) as [number, number, number],
                    position: readStream.readSome(DataType.Float, 3) as [number, number, number],
                    previousFrame: readStream.read(DataType.UInt32)
                };

                this.data.push(nextData);
            }
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.header, DataType.UInt32);
            writeStream.write(this.animType, DataType.UInt32);
            writeStream.write(this.frameCount, DataType.UInt32);
            writeStream.write(this.flags, DataType.UInt32);
            writeStream.write(this.duration, DataType.Float);
            writeStream.write(this.unused, DataType.UInt32);
            writeStream.write(this.name, DataType.Char, 32);

            for(let i = 0; i < 8; i++) {
                writeStream.write(this.nodeToUVChannel[i], DataType.Float);
            }

            for(let data of this.data) {
                writeStream.write(data.time, DataType.Float);
                writeStream.writeSome(DataType.Float, ...data.scale);
                writeStream.writeSome(DataType.Float, ...data.position);
                writeStream.write(data.previousFrame, DataType.UInt32);
            }
        },

        getSize: () => {
            this.size = 4*3 + 32 + 4*8 + 4*8*this.frameCount;
            return this.size;
        }
    }
}

class UVAnimDictStruct extends Struct {
    animationCount: number = 0;
    animations: UVAnim[] = [];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.animationCount = readStream.read(DataType.UInt32);
            this.animations = [];

            for(let i = 0; i < this.animationCount; i++) {
                let nextAnimation = new UVAnim();
                nextAnimation.parent = this;
                nextAnimation.read(readStream);
                this.animations.push(nextAnimation);
            }
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.animationCount, DataType.UInt32);

            for(let animation of this.animations) {
                animation.write(writeStream);
            }
        },

        getSize: () => {
            let size = 4;

            for(let animation of this.animations) {
                size += animation.getSize();
            }

            this.size = size;
            return size;
        },

        convert: (version: RWVersion) => {
            for(let animation of this.animations) {
                animation.convert(version);
            }
        }
    }
}

export default class UVAnimDict extends Section {
    static staticTypeID = 0x2B;
    typeID = UVAnimDict.staticTypeID;

    struct: UVAnimDictStruct = new UVAnimDictStruct();

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.struct = new UVAnimDictStruct();
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