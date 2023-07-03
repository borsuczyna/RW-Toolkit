import { DataType, ReadStream, WriteStream } from "../stream/stream";
import { COLVersion } from "./COL";

export default class FaceGroup {
    min: [number, number, number] = [0, 0, 0];
    max: [number, number, number] = [0, 0, 0];
    startFace: number = 0;
    endFace: number = 0;

    read(readStream: ReadStream, version: COLVersion = 'COL3') {
        if(version == 'COLL') {
            this.min = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
            this.max = readStream.readSome<number>(DataType.Float, 3) as [number, number, number];
            this.startFace = readStream.read(DataType.UInt16);
            this.endFace = readStream.read(DataType.UInt16);
        }
    }

    write(writeStream: WriteStream, version: COLVersion = 'COL3') {
        if(version == 'COLL') {
            writeStream.writeSome(DataType.Float, ...this.min);
            writeStream.writeSome(DataType.Float, ...this.max);
            writeStream.writeSome(DataType.UInt16, this.startFace, this.endFace);
        }
    }

    getSize(version: COLVersion = 'COL3') {
        if(version == 'COLL') {
            return 4 * 6 + 2 * 2;
        }
        return 0;
    }
}