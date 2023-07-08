import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Effect2DBase from "./Effect2DBase";

export default class Effect2DParticleEffect extends Effect2DBase {
    particleName: string = "";

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.particleName = readStream.read(DataType.Char, 24);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.particleName, DataType.Char, 24);
        },

        getSize: () => {
            return 24;
        }
    }

    getEffect2DSize() {
        return 24;
    }
}