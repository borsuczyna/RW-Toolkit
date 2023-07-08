import { DataType, ReadStream, WriteStream } from "../utils/stream";
import GeometryList, { Geometry, GeometryExtension } from "./Geometry";
import Section from "./Section";
import { RWVersion } from "./enums";

export default class SkinPLG extends Section {
    static staticTypeID = 0x116;
    typeID = SkinPLG.staticTypeID;

    boneCount: number = 0;
    usedBoneCount: number = 0;
    maxVertexWeights: number = 0;
    usedBoneIndices: number[] = [];
    boneVertices: [number, number, number, number][] = [];
    boneVertexWeights: [number, number, number, number][] = [];
    bones: [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]][] = [];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.boneCount = readStream.read(DataType.UInt8);
            this.usedBoneCount = readStream.read(DataType.UInt8);
            this.maxVertexWeights = readStream.read(DataType.UInt8);
            readStream.read(DataType.UInt8); // padding

            this.usedBoneIndices = [];
            for (let i = 0; i < this.usedBoneCount; i++) {
                this.usedBoneIndices.push(readStream.read(DataType.UInt8));
            }

            this.boneVertices = [];
            for (let i = 0; i < (<Geometry>(<Section>this.parent!).parent!).struct.vertexCount; i++) {
                this.boneVertices.push(readStream.readSome(DataType.UInt8, 4) as [number, number, number, number]);
            }

            this.boneVertexWeights = [];
            for (let i = 0; i < (<Geometry>(<Section>this.parent!).parent!).struct.vertexCount; i++) {
                this.boneVertexWeights.push(readStream.readSome(DataType.Float, 4) as [number, number, number, number]);
            }

            this.bones = [];
            for (let i = 0; i < this.boneCount; i++) {
                if(this.version != RWVersion.GTASA) {
                    readStream.read(DataType.UInt32);
                }

                this.bones.push([
                    readStream.readSome(DataType.Float, 4) as [number, number, number, number],
                    readStream.readSome(DataType.Float, 4) as [number, number, number, number],
                    readStream.readSome(DataType.Float, 4) as [number, number, number, number],
                    readStream.readSome(DataType.Float, 4) as [number, number, number, number]
                ]);
            }

            if(this.version == RWVersion.GTASA) {
                readStream.read(DataType.UInt32);
                readStream.read(DataType.UInt32);
                readStream.read(DataType.UInt32);
            }
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.boneCount, DataType.UInt8);
            writeStream.write(this.usedBoneCount, DataType.UInt8);
            writeStream.write(this.maxVertexWeights, DataType.UInt8);
            writeStream.write(0, DataType.UInt8); // padding

            for (let i = 0; i < this.usedBoneCount; i++) {
                writeStream.write(this.usedBoneIndices[i], DataType.UInt8);
            }

            for (let i = 0; i < (<Geometry>(<Section>this.parent!).parent!).struct.vertexCount; i++) {
                writeStream.writeSome(DataType.UInt8, ...this.boneVertices[i]);
            }

            for (let i = 0; i < (<Geometry>(<Section>this.parent!).parent!).struct.vertexCount; i++) {
                writeStream.writeSome(DataType.Float, ...this.boneVertexWeights[i]);
            }

            for (let i = 0; i < this.boneCount; i++) {
                if(this.version != RWVersion.GTASA) {
                    writeStream.write(0, DataType.UInt32);
                }

                writeStream.writeSome(DataType.Float, ...this.bones[i][0]);
                writeStream.writeSome(DataType.Float, ...this.bones[i][1]);
                writeStream.writeSome(DataType.Float, ...this.bones[i][2]);
                writeStream.writeSome(DataType.Float, ...this.bones[i][3]);
            }

            if(this.version == RWVersion.GTASA) {
                writeStream.write(0, DataType.UInt32);
                writeStream.write(0, DataType.UInt32);
                writeStream.write(0, DataType.UInt32);
            }
        },

        getSize: () => {
            let size = 4 + this.usedBoneCount + (<Geometry>(<Section>this.parent!).parent!).struct.vertexCount * 5;
            if(this.version == RWVersion.GTASA) {
                size += this.boneCount*16*4+3*4;
            } else {
                size += this.boneCount*17*4;
            }

            this.size = size;
            return size;
        }
    }
}