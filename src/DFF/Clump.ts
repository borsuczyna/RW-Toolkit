import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Atomic from "./Atomic";
import COLSection from "./COLSection";
import Extension from "./Extension";
import { FrameList } from "./Frame";
import GeometryList from "./Geometry";
import IndexStruct from "./IndexStruct";
import Light from "./Light";
import Section, { recastSection } from "./Section";
import Struct from "./Struct";
import { RWVersion } from "./enums";

class ClumpStruct extends Struct {
    atomicCount: number = 0;
    lightCount: number = 0;
    cameraCount: number = 0;

    init(version: RWVersion): this {
        this.atomicCount = 0;
        this.lightCount = 0;
        this.cameraCount = 0;
        this.size = this.getSize(true);
        this.version = version;
        this.type = ClumpStruct.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.atomicCount = readStream.read(DataType.UInt32);
            this.lightCount = readStream.read(DataType.UInt32);
            this.cameraCount = readStream.read(DataType.UInt32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.atomicCount, DataType.UInt32);
            writeStream.write(this.lightCount, DataType.UInt32);
            writeStream.write(this.cameraCount, DataType.UInt32);
        },

        getSize: () => {
            this.size = 12;
            return this.size;
        }
    };
}

class ClumpExtension extends Extension {
    collisionSection?: COLSection;

    init(version: RWVersion) {
        this.size = this.getSize();
        this.version = version;
        this.type = ClumpExtension.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            if(this.size > 0) {
                this.collisionSection = new COLSection();
                this.collisionSection.parent = this;
                this.collisionSection.read(readStream);
            }
        },

        write: (writeStream: WriteStream) => {
            if(this.collisionSection) this.collisionSection.write(writeStream);
        },

        getSize: () => {
            this.size = (this.collisionSection ? this.collisionSection.getSize() : 0);
            return this.size;
        },

        convert: (version: RWVersion) => {
            if(this.collisionSection) this.collisionSection.convert(version);
        }
    }
}

export default class Clump extends Section {
    static staticTypeID: number = 0x10;
    typeID: number = 0x10;

    struct: ClumpStruct = new ClumpStruct().init(this.version);
    frameList: FrameList = new FrameList().init(this.version);
    geometryList: GeometryList = new GeometryList().init(this.version);
    atomics: Atomic[] = [];
    indexStructs: IndexStruct[] = [];
    lights: Light[] = [];
    extension: ClumpExtension = new ClumpExtension().init(this.version);

    init(version: RWVersion) {
        this.struct = new ClumpStruct().init(version);
        this.struct.parent = this;
        this.frameList = new FrameList().init(version);
        this.frameList.parent = this;
        this.geometryList = new GeometryList().init(version);
        this.geometryList.parent = this;
        this.extension = new ClumpExtension().init(version);
        this.extension.parent = this;
        this.atomics = [];
        this.indexStructs = [];
        this.lights = [];
        this.version = version;
        this.type = Clump.staticTypeID;
        return this;
    }

    createAtomic() {
        let atomic = new Atomic().init(this.version);
        atomic.parent = this;
        this.atomics.push(atomic);
        this.struct.atomicCount = this.atomics.length;
        this.size = this.getSize();
        return atomic;
    }
    
    addComponent() {
        this.createAtomic();
        this.frameList.createFrame();
        this.geometryList.createGeometry();
        this.size = this.getSize();
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.struct = new ClumpStruct();
            this.struct.parent = this;
            this.struct.read(readStream);

            // Read frame list
            this.frameList = new FrameList();
            this.frameList.parent = this;
            this.frameList.read(readStream);
            
            // Read geometry list
            this.geometryList = new GeometryList();
            this.geometryList.parent = this;
            this.geometryList.read(readStream);
            
            // Read atomics
            this.atomics = [];
            for(let i = 0; i < this.struct.atomicCount; i++) {
                let atomic = new Atomic();
                atomic.parent = this;
                atomic.read(readStream);
                this.atomics.push(atomic);
            }

            let nextSection: Section;
            while(true) {
                nextSection = new Section();
                nextSection.parent = this;
                nextSection.read(readStream);

                if(nextSection.type == Struct.staticTypeID) {
                    let indexStruct = recastSection(nextSection, new IndexStruct());
                    indexStruct.read(readStream);
                    this.indexStructs.push(indexStruct);
                } else if(nextSection.type == Light.staticTypeID) {
                    let light = recastSection(nextSection, new Light());
                    light.read(readStream);
                    this.lights.push(light);
                }

                if(nextSection.type == ClumpExtension.staticTypeID) break;
            }

            // Read extension
            this.extension = recastSection(nextSection, new ClumpExtension());
            this.extension.read(readStream);
        },

        write: (writeStream: WriteStream) => {
            this.struct.atomicCount = this.atomics.length;
            this.struct.write(writeStream);
            
            // Write frame list
            this.frameList.write(writeStream);
            
            // Write geometry list
            this.geometryList.write(writeStream);

            // Write atomics
            for(let atomic of this.atomics) atomic.write(writeStream);

            // Write lights
            for(let i = 0; i < this.indexStructs.length; i++) {
                if(this.lights[i]) {
                    this.indexStructs[i].write(writeStream);
                    this.lights[i].write(writeStream);
                }
            }

            // Write extension
            this.extension.write(writeStream);
        },

        getSize: () => {
            this.size = 0;
            this.size += this.struct.getSize();
            this.size += this.frameList.getSize();
            this.size += this.geometryList.getSize();
            for(let atomic of this.atomics) this.size += atomic.getSize();
            for(let indexStruct of this.indexStructs) this.size += indexStruct.getSize();
            for(let light of this.lights) this.size += light.getSize();
            this.size += this.extension.getSize();
            return this.size;
        },

        convert: (version: RWVersion) => {
            this.version = version;
            this.struct.convert(version);
            this.frameList.convert(version);
            this.geometryList.convert(version);
            for(let atomic of this.atomics) atomic.convert(version);
            
            for(let i = 0; i < this.indexStructs.length; i++) {
                if(this.lights[i]) {
                    this.indexStructs[i].convert(version);
                    this.lights[i].convert(version);
                }
            }

            this.extension.convert(version);
            this.getSize();
        }
    }
}