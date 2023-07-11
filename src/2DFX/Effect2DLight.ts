import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Effect2DBase from "./Effect2DBase";

export default class Effect2DLight extends Effect2DBase {
    size: number = 80;
    color: [number, number, number, number] = [255, 255, 255, 255];
    coronaFarClip: number = 300;
    pointLightRange: number = 0;
    coronaSize: number = 4;
    shadowSize: number = 0;
    coronaShowMode: number = 0;
    coronaEnableReflection: number = 1;
    coronaFlareType: number = 0;
    shadowColorMultiplier: number = 40;
    coronaTexName: string = "coronastar";
    shadowTexName: string = "shad_exp";
    
    flags1: number = 66;
    // Casted From flags1
    coronaCheckObstacles: boolean = false;
    fogType1: boolean = false;
    fogType2: boolean = false;
    noCorona: boolean = false;
    onlyShowCoronaFar: boolean = false;
    atDay: boolean = false;
    atNight: boolean = false;
    blinkingType1: boolean = false;
    
    flags2: number = 4;
    // Casted From flags2
    coronaOnlyFromBelow: boolean = false;
    blinkingType2: boolean = false;
    updateHeightAboveGround: boolean = false;
    checkDirection: boolean = false;
    blinkingType3: boolean = false;

    shadowZDistance: number = 0;
    lookDirectionX: number = 0;
    lookDirectionY: number = 0;
    lookDirectionZ: number = 100;

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.color = readStream.readSome(DataType.UInt8, 4) as [number, number, number, number];
            this.coronaFarClip = readStream.read(DataType.Float);
            this.pointLightRange = readStream.read(DataType.Float);
            this.coronaSize = readStream.read(DataType.Float);
            this.shadowSize = readStream.read(DataType.Float);
            this.coronaShowMode = readStream.read(DataType.UInt8);
            this.coronaEnableReflection = readStream.read(DataType.UInt8);
            this.coronaFlareType = readStream.read(DataType.UInt8);
            this.shadowColorMultiplier = readStream.read(DataType.UInt8);
            this.flags1 = readStream.read(DataType.UInt8);
            this.coronaTexName = readStream.read(DataType.Char, 24);
            this.shadowTexName = readStream.read(DataType.Char, 24);
            this.shadowZDistance = readStream.read(DataType.UInt8);
            this.flags2 = readStream.read(DataType.UInt8);

            if(this.size == 80) {
                this.lookDirectionX = readStream.read(DataType.UInt8);
                this.lookDirectionY = readStream.read(DataType.UInt8);
                this.lookDirectionZ = readStream.read(DataType.UInt8);
                readStream.read(DataType.UInt8);
            }

            readStream.read(DataType.UInt8);
        },

        write: (writeStream: WriteStream) => {
            writeStream.writeSome(DataType.UInt8, ...this.color);
            writeStream.write(this.coronaFarClip, DataType.Float);
            writeStream.write(this.pointLightRange, DataType.Float);
            writeStream.write(this.coronaSize, DataType.Float);
            writeStream.write(this.shadowSize, DataType.Float);
            writeStream.write(this.coronaShowMode, DataType.UInt8);
            writeStream.write(this.coronaEnableReflection, DataType.UInt8);
            writeStream.write(this.coronaFlareType, DataType.UInt8);
            writeStream.write(this.shadowColorMultiplier, DataType.UInt8);
            writeStream.write(this.flags1, DataType.UInt8);
            writeStream.write(this.coronaTexName, DataType.Char, 24);
            writeStream.write(this.shadowTexName, DataType.Char, 24);
            writeStream.write(this.shadowZDistance, DataType.UInt8);
            writeStream.write(this.flags2, DataType.UInt8);

            if(this.lookDirectionX != null) {
                writeStream.write(this.lookDirectionX, DataType.UInt8);
                writeStream.write(this.lookDirectionY, DataType.UInt8);
                writeStream.write(this.lookDirectionZ, DataType.UInt8);
                writeStream.write(0, DataType.UInt8);
            }

            writeStream.write(0, DataType.UInt8);
        },

        getSize: () => {
            if(this.lookDirectionX != null) return 80;
            else return 76;
        }
    }

    getEffect2DSize() {
        if(this.lookDirectionX != null) return 80;
        else return 76;
    }
}