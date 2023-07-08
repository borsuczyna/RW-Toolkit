import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";

export default class Breakable extends Section {
    static staticTypeID = 0x0253F2FD;
    typeID = Breakable.staticTypeID;

    flags: number = 0;
    positionRule: number = 0;
    vertexCount: number = 0;
    offsetVertices: number = 0;
    offsetCoords: number = 0;
    offsetVertexLight: number = 0;
    faceCount: number = 0;
    offsetVertexIndices: number = 0;
    offsetMaterialIndices: number = 0;
    materialCount: number = 0;
    offsetTextures: number = 0;
    offsetTextureNames: number = 0;
    offsetTextureMasks: number = 0;
    offsetAmbientColors: number = 0;

    vertices: [number, number, number][] = [];
    faces: [number, number, number][] = [];
    triangleMaterials: number[] = [];
    texCoords: [number, number][] = [];
    vertexColors: [number, number, number, number][] = [];
    materialTextureNames: string[] = [];
    materialTextureMasks: string[] = [];
    ambientColor: [number, number, number][] = [];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.flags = readStream.read(DataType.UInt32);

            if(this.flags != 0) {
                this.positionRule = readStream.read(DataType.UInt32);
                this.vertexCount = readStream.read(DataType.UInt32);
                this.offsetVertices = readStream.read(DataType.UInt32);
                this.offsetCoords = readStream.read(DataType.UInt32);
                this.offsetVertexLight = readStream.read(DataType.UInt32);
                this.faceCount = readStream.read(DataType.UInt32);
                this.offsetVertexIndices = readStream.read(DataType.UInt32);
                this.offsetMaterialIndices = readStream.read(DataType.UInt32);
                this.materialCount = readStream.read(DataType.UInt32);
                this.offsetTextures = readStream.read(DataType.UInt32);
                this.offsetTextureNames = readStream.read(DataType.UInt32);
                this.offsetTextureMasks = readStream.read(DataType.UInt32);
                this.offsetAmbientColors = readStream.read(DataType.UInt32);

                this.vertices = [];
                for(let i = 0; i < this.vertexCount; i++) {
                    this.vertices.push(readStream.readSome(DataType.Float, 3) as [number, number, number]);
                }

                this.texCoords = [];
                for(let i = 0; i < this.vertexCount; i++) {
                    this.texCoords.push(readStream.readSome(DataType.Float, 2) as [number, number]);
                }

                this.vertexColors = [];
                for(let i = 0; i < this.vertexCount; i++) {
                    this.vertexColors.push(readStream.readSome(DataType.UInt8, 4) as [number, number, number, number]);
                }

                this.faces = [];
                for(let i = 0; i < this.faceCount; i++) {
                    this.faces.push(readStream.readSome(DataType.UInt16, 3) as [number, number, number]);
                }

                this.triangleMaterials = [];
                for(let i = 0; i < this.faceCount; i++) {
                    this.triangleMaterials.push(readStream.read(DataType.UInt16));
                }

                this.materialTextureNames = [];
                for(let i = 0; i < this.materialCount; i++) {
                    this.materialTextureNames.push(readStream.read(DataType.Char, 32));
                }

                this.materialTextureMasks = [];
                for(let i = 0; i < this.materialCount; i++) {
                    this.materialTextureMasks.push(readStream.read(DataType.Char, 32));
                }

                this.ambientColor = [];
                for(let i = 0; i < this.materialCount; i++) {
                    this.ambientColor.push(readStream.readSome(DataType.Float, 3) as [number, number, number]);
                }
            }
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.flags, DataType.UInt32);

            if(this.flags != 0) {
                writeStream.write(this.positionRule, DataType.UInt32);
                writeStream.write(this.vertexCount, DataType.UInt32);
                writeStream.write(this.offsetVertices, DataType.UInt32);
                writeStream.write(this.offsetCoords, DataType.UInt32);
                writeStream.write(this.offsetVertexLight, DataType.UInt32);
                writeStream.write(this.faceCount, DataType.UInt32);
                writeStream.write(this.offsetVertexIndices, DataType.UInt32);
                writeStream.write(this.offsetMaterialIndices, DataType.UInt32);
                writeStream.write(this.materialCount, DataType.UInt32);
                writeStream.write(this.offsetTextures, DataType.UInt32);
                writeStream.write(this.offsetTextureNames, DataType.UInt32);
                writeStream.write(this.offsetTextureMasks, DataType.UInt32);
                writeStream.write(this.offsetAmbientColors, DataType.UInt32);

                for(let i = 0; i < this.vertexCount; i++) {
                    writeStream.writeSome(DataType.Float, ...this.vertices[i]);
                }

                for(let i = 0; i < this.vertexCount; i++) {
                    writeStream.writeSome(DataType.Float, ...this.texCoords[i]);
                }

                for(let i = 0; i < this.vertexCount; i++) {
                    writeStream.writeSome(DataType.UInt8, ...this.vertexColors[i]);
                }

                for(let i = 0; i < this.faceCount; i++) {
                    writeStream.writeSome(DataType.UInt16, ...this.faces[i]);
                }

                for(let i = 0; i < this.faceCount; i++) {
                    writeStream.write(this.triangleMaterials[i], DataType.UInt16);
                }

                for(let i = 0; i < this.materialCount; i++) {
                    writeStream.write(this.materialTextureNames[i], DataType.Char, 32);
                }

                for(let i = 0; i < this.materialCount; i++) {
                    writeStream.write(this.materialTextureMasks[i], DataType.Char, 32);
                }

                for(let i = 0; i < this.materialCount; i++) {
                    writeStream.writeSome(DataType.Float, ...this.ambientColor[i]);
                }
            }
        },

        getSize: () => {
            let size = 0;
            if(this.flags == 0) {
                size = 4;
            } else {
                size = 14*4 + this.vertexCount*8*4 + this.materialCount*32*2 + this.materialCount*3*4;
            }

            this.size = size;
            return size;
        }
    }
}