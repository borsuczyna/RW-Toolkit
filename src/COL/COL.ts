import { DataType, ReadStream } from "../stream/stream";
import * as fs from 'fs';
import TBounds from "./TBounds";
import TSphere from "./TSphere";
import TBox from "./TBox";
import TVertex from "./TVertex";
import TFace from "./TFace";
import FaceGroup from "./FaceGroup";

export type COLVersion = 'COLL' | 'COL2' | 'COL3';

export class COL {
    readStream: ReadStream;
    version: COLVersion = 'COL3';
    filePath?: string;

    size: number = 0;
    modelName: string = 'default';
    modelID: number = 0;
    bound: TBounds = new TBounds();

    vertexCount: number = 0;
    sphereCount: number = 0;
    boxCount: number = 0;

    faceGroupCount: number = 0;
    faceCount: number = 0;
    lineCount: number = 0;
    trianglePlaneCount: number = 0;

    flags: number = 0;
    
    offsetSphere: number = 0;
    offsetBox: number = 0;
    offsetLine: number = 0;
    offsetFaceGroup: number = 0;
    offsetVertex: number = 0;
    offsetFace: number = 0;
    offsetTrianglePlane: number = 0;

    useConeInsteadOfLine: boolean = false;
    notEmpty: boolean = false;
    hasFaceGroup: boolean = false;
    hasShadow: boolean = false;

    // Collision verson >= 3
    shadowFaceCount: number = 0;
    shadowVertexCount: number = 0;
    offsetShadowVertex: number = 0;
    offsetShadowFace: number = 0;

    spheres: TSphere[] = [];
    boxes: TBox[] = [];
    vertices: TVertex[] = [];
    faces: TFace[] = [];
    faceGroups: FaceGroup[] = [];
    shadowFaces: TFace[] = [];
    shadowVertices: TVertex[] = [];

    constructor(fileOrData: string | Buffer) {
        this.readStream = new ReadStream(fileOrData);
        if(fs.existsSync(fileOrData)) this.filePath = fileOrData as string;

        this.read();
    }

    read() {
        this.version = this.readStream.read(DataType.Char, 4) as COLVersion;
        this.size = this.readStream.read(DataType.UInt32);
        this.modelName = this.readStream.read(DataType.Char, 22);
        this.modelID = this.readStream.read(DataType.UInt16);

        this.bound = new TBounds();
        this.bound.read(this.readStream);

        console.log(`COL Version: ${this.version}`);
        console.log(`COL Size: ${this.size}`);
        console.log(`COL Model Name: ${this.modelName}`);
        console.log(`COL Model ID: ${this.modelID}`);
        console.log(`COL Bound: ${this.bound}`);
    }
}