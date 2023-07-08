import { eulerToRotationMatrix, rotationMatrixToEuler } from '../utils/euler';
import { DataType, ReadStream, WriteStream } from '../utils/stream';
import Extension from './Extension';
import HAnimPLG from './HAnimPLG';
import Section, { recastSection } from './Section';
import Struct from './Struct';
import { RWVersion } from './enums';

interface FrameInfo {
    rotationMatrix: [
        [number, number, number],
        [number, number, number],
        [number, number, number]
    ],
    position: [number, number, number],
    parentFrame: number,
    matrixFlags: number
}

class Frame extends Section {
    static staticTypeID = 0x253F2FE;
    typeID = Frame.staticTypeID;
    name: string = '';

    init(version: RWVersion) {
        this.name = '';
        this.size = this.getSize(true);
        this.version = version;
        this.type = Frame.staticTypeID;
        return this;
    }

    setName(name: string) {
        this.name = name;
        this.size = this.getSize(true);
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.name = readStream.read(DataType.Char, this.size);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.name, DataType.Char, this.size);
        },

        getSize: () => {
            let size = this.name.length;
            this.size = size;
            return size;
        }
    }
}

class FrameListStruct extends Struct {
    frameCount: number = 0;
    frameInfo: FrameInfo[] = [];
    parent?: FrameList;

    init(version: number): this {
        this.frameCount = 0;
        this.frameInfo = [];
        this.size = this.getSize(true);
        this.version = version;
        this.type = FrameListStruct.staticTypeID;
        return this;
    }

    createFrameInfo() {
        let frameInfo: FrameInfo = {
            rotationMatrix: [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ],
            position: [0, 0, 0],
            parentFrame: 0,
            matrixFlags: 0x00020003
        };

        this.frameInfo.push(frameInfo);
        this.size = this.getSize(true);
        return this.frameInfo.length - 1;
    }

    setFrameInfoParentFrame(frameIndex: number, parentFrameIndex: number) {
        this.frameInfo[frameIndex].parentFrame = parentFrameIndex;
        return this;
    }

    getFrameInfoParentFrame(frameIndex: number) {
        return this.frameInfo[frameIndex].parentFrame;
    }

    setFrameInfoPosition(frameIndex: number, position: [number, number, number]) {
        this.frameInfo[frameIndex].position = position;
        return this;
    }

    getFrameInfoPosition(frameIndex: number) {
        return this.frameInfo[frameIndex].position;
    }

    setFrameInfoRotation(frameIndex: number, rotation: [number, number, number]) {
        this.frameInfo[frameIndex].rotationMatrix = eulerToRotationMatrix(rotation[0], rotation[1], rotation[2]);
    }

    getFrameInfoRotation(frameIndex: number) {
        return rotationMatrixToEuler(this.frameInfo[frameIndex].rotationMatrix);
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.frameCount = readStream.read(DataType.UInt32);

            for(let i = 0; i < this.frameCount; i++) {
                let frameInfo: FrameInfo = {
                    rotationMatrix: [
                        readStream.readSome(DataType.Float, 3) as [number, number, number],
                        readStream.readSome(DataType.Float, 3) as [number, number, number],
                        readStream.readSome(DataType.Float, 3) as [number, number, number]
                    ],
                    position: readStream.readSome(DataType.Float, 3) as [number, number, number],
                    parentFrame: readStream.read(DataType.UInt32),
                    matrixFlags: readStream.read(DataType.UInt32)
                };

                this.frameInfo.push(frameInfo);
            }
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.frameCount, DataType.UInt32);

            for(let frameInfo of this.frameInfo) {
                writeStream.writeSome(DataType.Float, ...frameInfo.rotationMatrix[0]);
                writeStream.writeSome(DataType.Float, ...frameInfo.rotationMatrix[1]);
                writeStream.writeSome(DataType.Float, ...frameInfo.rotationMatrix[2]);
                writeStream.writeSome(DataType.Float, ...frameInfo.position);
                writeStream.write(frameInfo.parentFrame, DataType.UInt32);
                writeStream.write(frameInfo.matrixFlags, DataType.UInt32);
            }
        },

        getSize: () => {
            let size = 4 + (9*4 + 3*4 + 4 + 4) * this.frameCount;
            this.size = size;
            return size;
        }
    }
}

class FrameListExtension extends Extension {
    parent?: FrameList;
    frame?: Frame;
    HAnimPLG?: HAnimPLG;

    init(version: RWVersion) {
        this.frame = new Frame().init(version);
        this.frame.parent = this;
        this.size = this.getSize(true);
        this.version = version;
        this.type = FrameListExtension.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            if(this.size != 0) {
                let section = new Section();
                section.parent = this;
                section.read(readStream);

                if(section.type == HAnimPLG.staticTypeID) {
                    section = recastSection<HAnimPLG>(section, new HAnimPLG());
                    this.HAnimPLG = section as HAnimPLG;
                    this.HAnimPLG.read(readStream);
                    
                    section = new Section();
                    section.parent = this;
                }

                section = recastSection<Frame>(section, new Frame());
                this.frame = section as Frame;
                this.frame.read(readStream);
            }
        },

        write: (writeStream: WriteStream) => {
            if(this.HAnimPLG) this.HAnimPLG.write(writeStream);
            if(this.frame) this.frame.write(writeStream);
        },

        getSize: () => {
            let size = 0 + (this.HAnimPLG ? this.HAnimPLG.getSize() : 0) + (this.frame ? this.frame.getSize() : 0);
            this.size = size;
            return size;
        },

        convert: (version: RWVersion) => {
            if(this.HAnimPLG) this.HAnimPLG.convert(version);
            if(this.frame) this.frame.convert(version);
        }
    }
}

export class FrameList extends Section {
    static staticTypeID: number = 0x0E;
    typeID: number = 0x0E;
    struct: FrameListStruct = new FrameListStruct().init(this.version);
    frames: FrameListExtension[] = [];

    init(version: number): this {
        this.struct = new FrameListStruct().init(version);
        this.struct.parent = this;
        this.frames = [];
        this.size = this.getSize(true);
        this.version = version;
        this.type = FrameList.staticTypeID;
        return this;
    }

    createFrame(name: string = 'unnamed'): FrameListExtension {
        let frame = new FrameListExtension().init(this.version);
        frame.parent = this;
        frame.frame!.setName(name);
        frame.update();

        this.struct.createFrameInfo();
        this.struct.frameCount++;
        this.frames.push(frame);
        this.size = this.getSize(true);
        return frame;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            // Read struct
            this.struct = new FrameListStruct();
            this.struct.parent = this;
            this.struct.read(readStream);
            
            // Read frames
            this.frames = [];
            for(let i = 0; i < this.struct.frameCount; i++) {
                let frame = new FrameListExtension();
                frame.parent = this;
                frame.read(readStream);
                this.frames.push(frame);
            }
        },

        write: (writeStream: WriteStream) => {
            this.struct.frameCount = this.frames.length;
            this.struct.write(writeStream);

            for(let frame of this.frames) frame.write(writeStream);
        },

        getSize: () => {
            let size = this.struct.getSize();
            for(let frame of this.frames) size += frame.getSize();
            this.size = size;
            return size;
        },

        convert: (version: RWVersion) => {
            this.struct.convert(version);
            for(let frame of this.frames) frame.convert(version);
        }
    }
}