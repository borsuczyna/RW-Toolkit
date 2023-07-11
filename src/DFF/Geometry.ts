import Effect2D from "../2DFX/2DFX";
import Effect2DBase from "../2DFX/Effect2DBase";
import { bAssemble, bExtract } from "../utils/bit";
import { DataType, ReadStream, WriteStream } from "../utils/stream";
import BinMeshPLG from "./BinMeshPLG";
import Breakable from "./Breakable";
import Extension from "./Extension";
import MaterialList from "./Material";
import MorphPLG from "./MorphPLG";
import NightVertexColor from "./NightVertexColor";
import Section, { recastSection } from "./Section";
import SkinPLG from "./SkinPLG";
import Struct from "./Struct";
import { RWVersion } from "./enums";

class GeometryStruct extends Struct {
    vertexCount: number = 0;
    textureCount: number = 0;
    faceCount: number = 0;
    morphTargetCount: number = 1;

    // version < GTASA
    ambient: number = 0;
    specular: number = 0;
    diffuse: number = 0;

    // data
    vertexColors: [number, number, number, number][] = [];
    texCoords: [number, number][][] = [];
    faces: [number, number, number, number][] = [];
    vertices: [number, number, number][] = [];
    normals: [number, number, number][] = [];
    boundingSphere: [number, number, number, number] = [0, 0, 0, 0];

    hasVertices: boolean = false;
    hasNormals: boolean = false;

    // casted from flags
    bTristrip: boolean = false;
    bPosition: boolean = false;
    bTextured: boolean = false;
    bVertexColor: boolean = false;
    bNormal: boolean = false;
    bLight: boolean = false;
    bModulateMaterialColor: boolean = false;
    bTextured2: boolean = false;
    bNative: boolean = false;

    size: number = 0;

    init(version: RWVersion): this {
        this.faceCount = 0;
        this.vertexCount = 0;
        this.morphTargetCount = 1;
        this.boundingSphere = [0, 0, 0, 0];
        this.hasVertices = false;
        this.hasNormals = false;
        this.size = this.getSize(true);
        this.version = version;
        this.type = GeometryStruct.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            let flags: number = readStream.read(DataType.UInt16);

            // Extract flags
            this.bTristrip = bExtract(flags, 0) === 1;
            this.bPosition = bExtract(flags, 1) === 1;
            this.bTextured = bExtract(flags, 2) === 1;
            this.bVertexColor = bExtract(flags, 3) === 1;
            this.bNormal = bExtract(flags, 4) === 1;
            this.bLight = bExtract(flags, 5) === 1;
            this.bModulateMaterialColor = bExtract(flags, 6) === 1;
            this.bTextured2 = bExtract(flags, 7) === 1;
            this.textureCount = readStream.read(DataType.UInt8);
            this.bNative = (readStream.read<number>(DataType.UInt8)%2) === 1;

            // Read face count
            this.faceCount = readStream.read(DataType.UInt32);
            this.vertexCount = readStream.read(DataType.UInt32);
            this.morphTargetCount = readStream.read(DataType.UInt32);

            if(this.version < RWVersion.GTASA) {
                this.ambient = readStream.read(DataType.Float);
                this.specular = readStream.read(DataType.Float);
                this.diffuse = readStream.read(DataType.Float);
            }

            if(!this.bNative) {
                if(this.bVertexColor) {
                    this.vertexColors = [];
                    for(let i = 0; i < this.vertexCount; i++) {
                        this.vertexColors.push(
                            readStream.readSome(DataType.UInt8, 4) as [number, number, number, number]
                        );
                    }
                }

                this.texCoords = [];
                let textureCount = (this.textureCount != 0 ? this.textureCount : ((this.bTextured ? 1 : 0)+(this.bTextured2 ? 1 : 0)));
                for(let i = 0; i < textureCount; i++) {
                    this.texCoords[i] = [];
                    for(let j = 0; j < this.vertexCount; j++) {
                        this.texCoords[i][j] = readStream.readSome(DataType.Float, 2) as [number, number];
                    }
                }

                this.faces = [];
                for(let i = 0; i < this.faceCount; i++) {
                    this.faces[i] = readStream.readSome(DataType.UInt16, 4) as [number, number, number, number];
                }
            }

            this.boundingSphere = readStream.readSome(DataType.Float, 4) as [number, number, number, number];
            this.hasVertices = readStream.read(DataType.UInt32) !== 0;
            this.hasNormals = readStream.read(DataType.UInt32) !== 0;

            if(this.hasVertices) {
                this.vertices = [];
                for(let i = 0; i < this.vertexCount; i++) {
                    this.vertices[i] = readStream.readSome(DataType.Float, 3) as [number, number, number];
                }
            }

            if(this.hasNormals) {
                this.normals = [];
                for(let i = 0; i < this.vertexCount; i++) {
                    this.normals[i] = readStream.readSome(DataType.Float, 3) as [number, number, number];
                }
            }
        },

        write: (writeStream: WriteStream) => {
            let flags: number = bAssemble(
                this.bTristrip,
                this.bPosition,
                this.bTextured,
                this.bVertexColor,
                this.bNormal,
                this.bLight,
                this.bModulateMaterialColor,
                this.bTextured2
            ) + (this.bNative ? 1 : 0)*2**24 + this.textureCount*2**16;

            writeStream.write(flags, DataType.UInt32);
            writeStream.write(this.faceCount, DataType.UInt32);
            writeStream.write(this.vertexCount, DataType.UInt32);
            writeStream.write(this.morphTargetCount, DataType.UInt32);

            if(this.version < RWVersion.GTASA) {
                writeStream.write(this.ambient, DataType.Float);
                writeStream.write(this.specular, DataType.Float);
                writeStream.write(this.diffuse, DataType.Float);
            }

            if(!this.bNative) {
                if(this.bVertexColor) {
                    for(let i = 0; i < this.vertexCount; i++) {
                        writeStream.writeSome(DataType.UInt8, ...this.vertexColors[i]);
                    }
                }

                let textureCount = (this.textureCount != 0 ? this.textureCount : ((this.bTextured ? 1 : 0)+(this.bTextured2 ? 1 : 0)));
                for(let i = 0; i < textureCount; i++) {
                    for(let j = 0; j < this.vertexCount; j++) {
                        writeStream.writeSome(DataType.Float, ...this.texCoords[i][j]);
                    }
                }

                for(let i = 0; i < this.faceCount; i++) {
                    writeStream.writeSome(DataType.UInt16, ...this.faces[i]);
                }
            }

            for(let i = 0; i < this.morphTargetCount; i++) {
                writeStream.writeSome(DataType.Float, ...this.boundingSphere);
                writeStream.write(this.hasVertices ? 1 : 0, DataType.UInt32);
                writeStream.write(this.hasNormals ? 1 : 0, DataType.UInt32);

                if(this.hasVertices) {
                    for(let i = 0; i < this.vertexCount; i++) {
                        writeStream.writeSome(DataType.Float, ...this.vertices[i]);
                    }
                }

                if(this.hasNormals) {
                    for(let i = 0; i < this.vertexCount; i++) {
                        writeStream.writeSome(DataType.Float, ...this.normals[i]);
                    }
                }
            }
        },

        getSize: () => {
            let size = 4*4;
            if(this.version < RWVersion.GTASA) {
                size += 3*4;
            }

            if(!this.bNative) {
                if(this.bVertexColor) {
                    size += 4*this.vertexCount;
                }
                let textureCount = (this.textureCount != 0 ? this.textureCount : ((this.bTextured ? 1 : 0)+(this.bTextured2 ? 1 : 0)));
                size += this.vertexCount*2*4*textureCount;
            }

            for(let i = 0; i < this.morphTargetCount; i++) {
                size += 4*6;
                if(this.hasVertices) {
                    size += 3*4*this.vertexCount;
                }
                if(this.hasNormals) {
                    size += 3*4*this.vertexCount;
                }
            }

            this.size = size;
            return size;
        }
    }
}

export class GeometryExtension extends Extension {
    binMeshPLG?: BinMeshPLG;
    breakable?: Breakable;
    nightVertexColor?: NightVertexColor;
    effect2D?: Effect2D;
    skinPLG?: SkinPLG;
    morphPLG?: MorphPLG;

    init(version: RWVersion) {
        this.size = this.getSize(true);
        this.version = version;
        this.type = GeometryExtension.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            let nextSection: Section;
            let readSize: number = 0;

            while(true) {
                nextSection = new Section();
                nextSection.parent = this;
                nextSection.read(readStream);

                if(nextSection.type == BinMeshPLG.staticTypeID) {
                    this.binMeshPLG = recastSection(nextSection, new BinMeshPLG());
                    nextSection = this.binMeshPLG;
                } else if(nextSection.type == Breakable.staticTypeID) {
                    this.breakable = recastSection(nextSection, new Breakable());
                    nextSection = this.breakable;
                } else if(nextSection.type == NightVertexColor.staticTypeID) {
                    this.nightVertexColor = recastSection(nextSection, new NightVertexColor());
                    nextSection = this.nightVertexColor;
                } else if(nextSection.type == Effect2D.staticTypeID) {
                    this.effect2D = recastSection(nextSection, new Effect2D());
                    nextSection = this.effect2D;
                } else if(nextSection.type == SkinPLG.staticTypeID) {
                    this.skinPLG = recastSection(nextSection, new SkinPLG());
                    nextSection = this.skinPLG;
                } else if(nextSection.type == MorphPLG.staticTypeID) {
                    this.morphPLG = recastSection(nextSection, new MorphPLG());
                    nextSection = this.morphPLG;
                } else {
                    throw new Error(`Unknown section type ${nextSection.type} in GeometryExtension`);
                }

                nextSection.parent = this;
                nextSection.read(readStream);
                readSize += nextSection.size + 12;

                if(readSize >= this.size) break;
            }
        },

        write: (writeStream: WriteStream) => {
            let a = writeStream.position;
            if(this.binMeshPLG) this.binMeshPLG.write(writeStream);
            if(this.skinPLG) this.skinPLG.write(writeStream);
            if(this.morphPLG) this.morphPLG.write(writeStream);
            if(this.breakable) this.breakable.write(writeStream);
            if(this.nightVertexColor) this.nightVertexColor.write(writeStream);
            if(this.effect2D) this.effect2D.write(writeStream);
        },

        getSize: () => {
            let size = 0;
            if(this.binMeshPLG) size += this.binMeshPLG.getSize();
            if(this.skinPLG) size += this.skinPLG.getSize();
            if(this.morphPLG) size += this.morphPLG.getSize();
            if(this.breakable) size += this.breakable.getSize();
            if(this.nightVertexColor) size += this.nightVertexColor.getSize();
            if(this.effect2D) size += this.effect2D.getSize();
            this.size = size;
            return size;
        },

        convert: (version: RWVersion) => {
            if(this.binMeshPLG) this.binMeshPLG.convert(version);
            if(this.skinPLG) this.skinPLG.convert(version);
            if(this.morphPLG) this.morphPLG.convert(version);
            if(this.breakable) this.breakable.convert(version);
            if(this.nightVertexColor) this.nightVertexColor.convert(version);
            if(this.effect2D) this.effect2D.convert(version);
        }
    }
}

export class Geometry extends Section {
    static staticTypeID = 0x0F;
    typeID = Geometry.staticTypeID;

    struct: GeometryStruct = new GeometryStruct().init(this.version);
    materialList: MaterialList = new MaterialList().init(this.version);
    extension: GeometryExtension = new GeometryExtension().init(this.version);

    init(version: RWVersion) {
        this.struct = new GeometryStruct().init(version);
        this.struct.parent = this;
        this.materialList = new MaterialList().init(version);
        this.materialList.parent = this;
        this.extension = new GeometryExtension().init(version);
        this.extension.parent = this;
        this.size = this.getSize(true);
        this.version = version;
        this.type = Geometry.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.struct = new GeometryStruct();
            this.struct.parent = this;
            this.struct.read(readStream);

            // Read material list
            this.materialList = new MaterialList();
            this.materialList.parent = this;
            this.materialList.read(readStream);
            // Read extension
            this.extension = new GeometryExtension();
            this.extension.parent = this;
            this.extension.read(readStream);
        },

        write: (writeStream: WriteStream) => {
            this.struct.write(writeStream);
            this.materialList.write(writeStream);
            this.extension.write(writeStream);
        },

        getSize: () => {
            this.size = this.struct.getSize() + this.materialList.getSize() + this.extension.getSize();
            return this.size;
        },

        convert: (version: RWVersion) => {
            this.version = version;
            this.struct.convert(version);
            this.materialList.convert(version);
            this.extension.convert(version);
        }
    }

    mergeGemotry(target: Geometry, clone: boolean = false) {
        if(
            this.struct.bTristrip != target.struct.bTristrip ||
            this.struct.bPosition != target.struct.bPosition ||
            this.struct.bTextured != target.struct.bTextured ||
            this.struct.bVertexColor != target.struct.bVertexColor ||
            this.struct.bNormal != target.struct.bNormal ||
            this.struct.bLight != target.struct.bLight ||
            this.struct.bModulateMaterialColor != target.struct.bModulateMaterialColor ||
            this.struct.bTextured2 != target.struct.bTextured2 ||
            this.struct.bNative != target.struct.bNative ||
            this.struct.hasNormals != target.struct.hasNormals
        ) throw new Error("Can't merge geometry with different flags");

        let targetElement = clone ? new Geometry().init(this.version) : target;

        // Merge struct
        if(!this.struct.bNative) {
            if(this.struct.bVertexColor) {
                targetElement.struct.vertexColors = [...this.struct.vertexColors, ...target.struct.vertexColors];
            }

            let textureCount = (this.struct.textureCount != 0 ? this.struct.textureCount : ((this.struct.bTextured ? 1 : 0) + (this.struct.bTextured2 ? 1 : 0)));
            for(let i = 0; i < textureCount; i++) {
                targetElement.struct.texCoords[i] = [...this.struct.texCoords[i], ...target.struct.texCoords[i]];
            }

            targetElement.struct.faces = [...this.struct.faces, ...target.struct.faces];
        }

        targetElement.struct.hasVertices = this.struct.hasVertices || target.struct.hasVertices;

        if(this.struct.hasVertices) {
            targetElement.struct.vertices = [...this.struct.vertices, ...target.struct.vertices];
        }

        if(this.struct.hasNormals) {
            targetElement.struct.normals = [...this.struct.normals, ...target.struct.normals];
        }

        targetElement.struct.faceCount = this.struct.faces.length;
        targetElement.struct.vertexCount = this.struct.vertices.length;

        // Merge material
        targetElement.materialList.struct.materialIndices = [...this.materialList.struct.materialIndices, ...target.materialList.struct.materialIndices];
        targetElement.materialList.materials = [...this.materialList.materials, ...target.materialList.materials];
        targetElement.materialList.struct.materialCount = targetElement.materialList.struct.materialIndices.length;

        // Merge extension
        if(this.extension.binMeshPLG && target.extension.binMeshPLG) {
            if(this.extension.binMeshPLG.faceType == target.extension.binMeshPLG.faceType) {
                for(let i = 0; i < this.extension.binMeshPLG.materialSplitCount; i++) {
                    let matIndex = this.extension.binMeshPLG.materialSplitCount + i;
                    targetElement.extension.binMeshPLG.materialSplits[matIndex] = [...this.extension.binMeshPLG.materialSplits[i]];

                    for(let faceIndex = 0; faceIndex < target.extension.binMeshPLG.materialSplits[i][0]; i++) {
                        targetElement.extension.binMeshPLG.materialSplits[matIndex][2][faceIndex] = target.extension.binMeshPLG.materialSplits[i][2][faceIndex] + this.struct.faces.length;
                    }
                }

                targetElement.extension.binMeshPLG.materialSplitCount = this.extension.binMeshPLG.materialSplitCount + target.extension.binMeshPLG.materialSplitCount;
                targetElement.extension.binMeshPLG.vertexCount = this.extension.binMeshPLG.vertexCount + target.extension.binMeshPLG.vertexCount;
            }
        } else {
            targetElement.extension.binMeshPLG.materialSplits = [...this.extension.binMeshPLG?.materialSplits, ...target.extension.binMeshPLG?.materialSplits];
            targetElement.extension.binMeshPLG.materialSplitCount = this.extension.binMeshPLG?.materialSplitCount + target.extension.binMeshPLG?.materialSplitCount;
            targetElement.extension.binMeshPLG.vertexCount = this.extension.binMeshPLG?.vertexCount + target.extension.binMeshPLG?.vertexCount;
        }

        if(this.extension.nightVertexColor && target.extension.nightVertexColor) {
            if(this.extension.nightVertexColor.hasColor == target.extension.nightVertexColor.hasColor) {
                targetElement.extension.nightVertexColor.colors = [...this.extension.nightVertexColor.colors, ...target.extension.nightVertexColor.colors];
            }
        } else {
            targetElement.extension.nightVertexColor.colors = [...this.extension.nightVertexColor?.colors, ...target.extension.nightVertexColor?.colors];
        }

        return targetElement;
    }
}

class GeometryListStruct extends Struct {
    geometryCount: number = 0;

    init(version: RWVersion): this {
        this.geometryCount = 0;
        this.size = this.getSize(true);
        this.version = version;
        this.type = GeometryListStruct.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.geometryCount = readStream.read(DataType.UInt32);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.geometryCount, DataType.UInt32);
        },

        getSize: () => {
            this.size = 4;
            return this.size;
        }
    }
}

export default class GeometryList extends Section {
    static staticTypeID = 0x1A;
    typeID = GeometryList.staticTypeID;
    struct: GeometryListStruct = new GeometryListStruct().init(this.version);
    geometries: Geometry[] = [];

    init(version: RWVersion) {
        this.struct = new GeometryListStruct().init(version);
        this.struct.parent = this;
        this.geometries = [];
        this.size = this.getSize(true);
        this.version = version;
        this.type = GeometryList.staticTypeID;
        return this;
    }

    createGeometry() {
        let geometry = new Geometry().init(this.version);
        geometry.parent = this;
        this.struct.geometryCount++;
        this.geometries.push(geometry);
        this.size = this.getSize(true);
        return geometry;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.struct = new GeometryListStruct();
            this.struct.parent = this;
            this.struct.read(readStream);

            this.geometries = [];
            for(let i = 0; i < this.struct.geometryCount; i++) {
                let geometry = new Geometry();
                geometry.parent = this;
                geometry.read(readStream);
                this.geometries.push(geometry);
            }
        },

        write: (writeStream: WriteStream) => {
            this.struct.geometryCount = this.geometries.length;
            this.struct.write(writeStream);
            
            for(let geometry of this.geometries) {
                geometry.write(writeStream);
            }
        },

        getSize: () => {
            let size = this.struct.getSize();
            for(let geometry of this.geometries) {
                size += geometry.getSize();
            }
            this.size = size;
            return size;
        },

        convert: (version: RWVersion) => {
            this.struct.convert(version);
            for(let geometry of this.geometries) {
                geometry.convert(version);
            }
        }
    }
}