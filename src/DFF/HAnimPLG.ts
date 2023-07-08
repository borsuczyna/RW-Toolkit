import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Section from "./Section";
import { RWVersion } from "./enums";

interface HAnimNode {
    nodeID: number;
    nodeIndex: number;
    flags: number;
}

export default class HAnimPLG extends Section {
    static staticTypeID = 0x11E;
    typeID = HAnimPLG.staticTypeID;
    
    animVersion: number = 0x100;
    nodeID: number = 0;
    nodeCount: number = 0;
    flags: number = 0;
    keyFrameSize: number = 36;
    nodes: HAnimNode[] = [];

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.animVersion = readStream.read(DataType.UInt32);
            this.nodeID = readStream.read(DataType.UInt32);
            this.nodeCount = readStream.read(DataType.UInt32);

            if(this.nodeCount != 0) { // Root bone
                this.flags = readStream.read(DataType.UInt32);
                this.keyFrameSize = readStream.read(DataType.UInt32);

                this.nodes = [];
                for(let i = 0; i < this.nodeCount; i++) {
                    this.nodes.push({
                        nodeID: readStream.read(DataType.UInt32),
                        nodeIndex: readStream.read(DataType.UInt32),
                        flags: readStream.read(DataType.UInt32)
                    });
                }
            }
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.animVersion, DataType.UInt32);
            writeStream.write(this.nodeID, DataType.UInt32);
            writeStream.write(this.nodeCount, DataType.UInt32);

            this.nodeCount = this.nodes.length;
            if(this.nodeCount != 0) { // Root bone
                writeStream.write(this.flags, DataType.UInt32);
                writeStream.write(this.keyFrameSize, DataType.UInt32);

                for(let node of this.nodes) {
                    writeStream.write(node.nodeID, DataType.UInt32);
                    writeStream.write(node.nodeIndex, DataType.UInt32);
                    writeStream.write(node.flags, DataType.UInt32);
                }
            }
        },

        getSize: () => {
            let size = 3 * 4;
            if(this.nodeCount != 0) { // Root bone
                size += 8 + this.nodeCount * 4;
            }
            
            this.size = size;
            return size;
        }
    }
}