import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";

type MaterialSplit = [number, number, number[]];

export default class BinMeshPLG extends Section {
    static staticTypeID = 0x50E;
    typeID = BinMeshPLG.staticTypeID;

    faceType: number = 0;
    materialSplitCount: number = 0;
    vertexCount: number = 0;
    materialSplits: MaterialSplit[] = [];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.faceType = readStream.read(DataType.UInt32);
            this.materialSplitCount = readStream.read(DataType.UInt32);
            this.vertexCount = readStream.read(DataType.UInt32);

            this.materialSplits = [];
            for (let i = 0; i < this.materialSplitCount; i++) {
                let materialSplit: MaterialSplit = [
                    readStream.read(DataType.UInt32),
                    readStream.read(DataType.UInt32),
                    []
                ];

                for(let faceIndex = 0; faceIndex < materialSplit[0]; faceIndex++) {
                    materialSplit[2][faceIndex] = readStream.read(DataType.UInt32);
                }
            }
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.faceType, DataType.UInt32);
            this.materialSplitCount = this.materialSplits.length;
            writeStream.write(this.materialSplitCount, DataType.UInt32);

            let vertexCount = 0;
            for(let i = 0; i < this.materialSplitCount; i++) {
                vertexCount += this.materialSplits[i][2].length;
            }

            this.vertexCount = vertexCount;
            writeStream.write(this.vertexCount, DataType.UInt32);

            for (let i = 0; i < this.materialSplitCount; i++) {
                this.materialSplits[i][0] = this.materialSplits[i][2].length;

                writeStream.write(this.materialSplits[i][0], DataType.UInt32);
                writeStream.write(this.materialSplits[i][1], DataType.UInt32);

                for(let faceIndex = 0; faceIndex < this.materialSplits[i][0]; faceIndex++) {
                    writeStream.write(this.materialSplits[i][2][faceIndex], DataType.UInt32);
                }
            }
        },

        getSize: () => {
            let size = 4 * 3;
            for (let i = 0; i < this.materialSplitCount; i++) {
                size += 8 + this.materialSplits[i][2].length * 4;
            }

            this.size = size;
            return this.size;
        }
    }
}