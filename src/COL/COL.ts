import { DataType, ReadStream, WriteStream } from "../utils/stream";
import * as fs from 'fs';
import TBounds from "./TBounds";
import TSphere from "./TSphere";
import TBox from "./TBox";
import TVertex from "./TVertex";
import TFace from "./TFace";
import FaceGroup from "./FaceGroup";
import { bExtract } from "../utils/bit";

export type COLVersion = 'COLL' | 'COL2' | 'COL3';

export class COL {
    readStream: ReadStream;
    version: COLVersion = 'COL3';
    filePath?: string;

    size: number = 0;
    modelName: string = 'default';
    modelID: number = 0;
    bound: TBounds = new TBounds();

    private vertexCount: number = 0;
    private sphereCount: number = 0;
    private boxCount: number = 0;

    private faceGroupCount: number = 0;
    private faceCount: number = 0;
    private lineCount: number = 0;
    private trianglePlaneCount: number = 0;

    private _flags: number = 0;
    
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
    private shadowFaceCount: number = 0;
    private shadowVertexCount: number = 0;
    offsetShadowVertex: number = 0;
    offsetShadowFace: number = 0;

    spheres: TSphere[] = [];
    boxes: TBox[] = [];
    vertices: TVertex[] = [];
    faces: TFace[] = [];
    faceGroups: FaceGroup[] = [];
    shadowFaces: TFace[] = [];
    shadowVertices: TVertex[] = [];

    set flags(value: number) {
        this._flags = value;

        // casted from flags
        this.useConeInsteadOfLine = bExtract(this.flags, 0) == 1;
        this.notEmpty = bExtract(this.flags, 1) == 1;
        this.hasFaceGroup = bExtract(this.flags, 2) == 1;
        this.hasShadow = bExtract(this.flags, 3) == 1;
    }

    get flags() {
        return this._flags;
    }

    // Save settings
    regenerateBounds: boolean = true;

    constructor(fileOrData: string | Buffer) {
        this.readStream = new ReadStream(fileOrData);
        if(fs.existsSync(fileOrData)) this.filePath = fileOrData as string;

        this.read();
    }

    read() {
        // Read header
        this.version = this.readStream.read(DataType.Char, 4) as COLVersion;
        this.size = this.readStream.read(DataType.UInt32);
        this.modelName = this.readStream.read(DataType.Char, 22);
        this.modelID = this.readStream.read(DataType.UInt16);

        // Read bound
        this.bound = new TBounds();
        this.bound.read(this.readStream);

        if(this.version == 'COL2' || this.version == 'COL3') {
            this.sphereCount = this.readStream.read(DataType.UInt16);
            this.boxCount = this.readStream.read(DataType.UInt16);
            this.faceCount = this.readStream.read(DataType.UInt16);
            this.lineCount = this.readStream.read(DataType.UInt8);
            this.trianglePlaneCount = this.readStream.read(DataType.UInt8);
            this.flags = this.readStream.read(DataType.UInt32);

            this.offsetSphere = this.readStream.read(DataType.UInt32);
            this.offsetBox = this.readStream.read(DataType.UInt32);
            this.offsetLine = this.readStream.read(DataType.UInt32);
            this.offsetVertex = this.readStream.read(DataType.UInt32);
            this.offsetTrianglePlane = this.readStream.read(DataType.UInt32);

            if(this.version == 'COL3') {
                this.shadowFaceCount = this.readStream.read(DataType.UInt32);
                this.offsetShadowVertex = this.readStream.read(DataType.UInt32);
                this.offsetShadowFace = this.readStream.read(DataType.UInt32);
            }

            // Read spheres
            this.readStream.seek(this.offsetSphere + 4);
            this.spheres = [];

            for(let i = 0; i < this.sphereCount; i++) {
                let sphere = new TSphere();
                sphere.read(this.readStream);
                this.spheres.push(sphere);
            }

            // Read boxes
            this.readStream.seek(this.offsetBox + 4);
            this.boxes = [];

            for(let i = 0; i < this.boxCount; i++) {
                let box = new TBox();
                box.read(this.readStream);
                this.boxes.push(box);
            }

            // Read faces
            this.readStream.seek(this.offsetFace + 4);
            this.faces = [];

            for(let i = 0; i < this.faceCount; i++) {
                let face = new TFace();
                face.read(this.readStream);
                this.faces.push(face);
            }

            if(this.hasFaceGroup) {
                // Read face groups
                this.readStream.seek(this.offsetFace); // Face group count
                this.faceGroupCount = this.readStream.read(DataType.UInt32);
                this.offsetFaceGroup = this.readStream.position - 4 - this.faceGroupCount * 28;
                this.readStream.seek(this.offsetFaceGroup);

                this.faceGroups = [];

                for(let i = 0; i < this.faceGroupCount; i++) {
                    let faceGroup = new FaceGroup();
                    faceGroup.read(this.readStream);
                    this.faceGroups.push(faceGroup);
                }
            }

            // Read vertices
            this.vertexCount = ((this.hasFaceGroup ? this.offsetFaceGroup : (this.offsetFace + 4)) - (this.offsetVertex + 4))/6;
            this.vertexCount = this.vertexCount - this.vertexCount % 1;

            this.readStream.seek(this.offsetVertex + 4);
            this.vertices = [];

            for(let i = 0; i < this.vertexCount; i++) {
                let vertex = new TVertex();
                vertex.read(this.readStream);
                this.vertices.push(vertex);
            }

            if(this.hasShadow) {
                // Read shadow faces
                this.readStream.seek(this.offsetShadowFace + 4);
                this.shadowFaces = [];

                for(let i = 0; i < this.shadowFaceCount; i++) {
                    let face = new TFace();
                    face.read(this.readStream);
                    this.shadowFaces.push(face);
                }

                // Read shadow vertices
                this.shadowVertexCount = ((this.offsetShadowFace + 4) - (this.offsetShadowVertex + 4))/6;
                this.shadowVertexCount = this.shadowVertexCount - this.shadowVertexCount % 1;
                
                this.readStream.seek(this.offsetShadowVertex + 4);
                this.shadowVertices = [];

                for(let i = 0; i < this.shadowVertexCount; i++) {
                    let vertex = new TVertex();
                    vertex.read(this.readStream);
                    this.shadowVertices.push(vertex);
                }
            }
        } else if(this.version == 'COLL') {
            // Read spheres
            this.sphereCount = this.readStream.read(DataType.UInt32);
            this.spheres = [];

            for(let i = 0; i < this.sphereCount; i++) {
                let sphere = new TSphere();
                sphere.read(this.readStream);
                this.spheres.push(sphere);
            }

            this.readStream.read(DataType.UInt32); // 0x00000000

            // Read boxes
            this.boxCount = this.readStream.read(DataType.UInt32);
            this.boxes = [];

            for(let i = 0; i < this.boxCount; i++) {
                let box = new TBox();
                box.read(this.readStream);
                this.boxes.push(box);
            }

            // Read vertices
            this.vertexCount = this.readStream.read(DataType.UInt32);
            this.vertices = [];

            for(let i = 0; i < this.vertexCount; i++) {
                let vertex = new TVertex();
                vertex.read(this.readStream);
                this.vertices.push(vertex);
            }

            // Read faces
            this.faceCount = this.readStream.read(DataType.UInt32);
            this.faces = [];

            for(let i = 0; i < this.faceCount; i++) {
                let face = new TFace();
                face.read(this.readStream);
                this.faces.push(face);
            }
        }
    }

    write(writeStream: WriteStream) {
        // Write header
        writeStream.write(this.version, DataType.Char, 4);
        let sizePosition = writeStream.write(this.size, DataType.UInt32);
        writeStream.write(this.modelName, DataType.Char, 22);
        writeStream.write(this.modelID, DataType.UInt16);

        // Bounds
        let maxX, maxY, maxZ, minX, minY, minZ;
        if(this.regenerateBounds) {
            maxX = -256, maxY = -256, maxZ = -256, minX = 256, minY = 256, minZ = 256;

            // Vertices
            for(let vertex of this.vertices) {
                if(vertex.x > maxX) maxX = vertex.x;
                if(vertex.y > maxY) maxY = vertex.y;
                if(vertex.z > maxZ) maxZ = vertex.z;
                if(vertex.x < minX) minX = vertex.x;
                if(vertex.y < minY) minY = vertex.y;
                if(vertex.z < minZ) minZ = vertex.z;
            }

            // Spheres
            for(let sphere of this.spheres) {
                let sphereMinX = sphere.center[0] - sphere.radius,
                    sphereMinY = sphere.center[1] - sphere.radius,
                    sphereMinZ = sphere.center[2] - sphere.radius,
                    sphereMaxX = sphere.center[0] + sphere.radius,
                    sphereMaxY = sphere.center[1] + sphere.radius,
                    sphereMaxZ = sphere.center[2] + sphere.radius;

                if(sphereMaxX > maxX) maxX = sphereMaxX;
                if(sphereMaxY > maxY) maxY = sphereMaxY;
                if(sphereMaxZ > maxZ) maxZ = sphereMaxZ;
                if(sphereMinX < minX) minX = sphereMinX;
                if(sphereMinY < minY) minY = sphereMinY;
                if(sphereMinZ < minZ) minZ = sphereMinZ;
            }

            // Boxes
            for(let box of this.boxes) {
                if(box.max[0] > maxX) maxX = box.max[0];
                if(box.max[1] > maxY) maxY = box.max[1];
                if(box.max[2] > maxZ) maxZ = box.max[2];
                if(box.min[0] < minX) minX = box.min[0];
                if(box.min[1] < minY) minY = box.min[1];
                if(box.min[2] < minZ) minZ = box.min[2];
            }
        } else {
            maxX = this.bound.max[0];
            maxY = this.bound.max[1];
            maxZ = this.bound.max[2];
            minX = this.bound.min[0];
            minY = this.bound.min[1];
            minZ = this.bound.min[2];
        }

        this.bound.max = [maxX, maxY, maxZ];
        this.bound.min = [minX, minY, minZ];
        this.bound.center = [(maxX + minX)/2, (maxY + minY)/2, (maxZ + minZ)/2];
        this.bound.radius = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2) + Math.pow(maxZ - minZ, 2))/2;

        this.bound.write(writeStream);

        if(this.version == 'COL2' || this.version == 'COL3') {
            writeStream.write(this.spheres.length, DataType.UInt16);
            writeStream.write(this.boxes.length, DataType.UInt16);
            writeStream.write(this.faces.length, DataType.UInt16);
            writeStream.write(0, DataType.UInt8); // Line count
            writeStream.write(0, DataType.UInt8); // Triangle plane count
            writeStream.write(this.flags, DataType.UInt32);

            // May be overwritten later
            let pOffsetSphere, pOffsetBox, pOffsetLine, pOffsetVertex, pOffsetFace, pOffsetTrianglePlane;
            pOffsetSphere = writeStream.write(0, DataType.UInt32);
            pOffsetBox = writeStream.write(0, DataType.UInt32);
            pOffsetLine = writeStream.write(0, DataType.UInt32); // Not used
            pOffsetVertex = writeStream.write(0, DataType.UInt32);
            pOffsetFace = writeStream.write(0, DataType.UInt32);
            pOffsetTrianglePlane = writeStream.write(0, DataType.UInt32); // Not used
            let pOffsetShadowFace, pOffsetShadowVertex;
            if(this.version == 'COL3') {
                writeStream.write(this.shadowFaces.length, DataType.UInt32);
                pOffsetShadowVertex = writeStream.write(0, DataType.UInt32);
                pOffsetShadowFace = writeStream.write(0, DataType.UInt32);
            }

            // Write spheres
            if(this.spheres.length > 0) {
                this.offsetSphere = writeStream.position - 4;
                writeStream.overwrite(this.offsetSphere, DataType.UInt32, pOffsetSphere);

                for(let sphere of this.spheres) sphere.write(writeStream);
            }

            // Write boxes
            if(this.boxes.length > 0) {
                this.offsetBox = writeStream.position - 4;
                writeStream.overwrite(this.offsetBox, DataType.UInt32, pOffsetBox);

                for(let box of this.boxes) box.write(writeStream);
            }

            // Write vertices
            if(this.vertices.length > 0) {
                this.offsetVertex = writeStream.position - 4;
                writeStream.overwrite(this.offsetVertex, DataType.UInt32, pOffsetVertex);

                for(let vertex of this.vertices) vertex.write(writeStream);
            }

            if(this.hasFaceGroup) {
                // Write face groups
                this.faceGroupCount = this.faceGroups.length;
                for(let faceGroup of this.faceGroups) faceGroup.write(writeStream);

                writeStream.write(this.faceGroupCount, DataType.UInt32);
            }

            // Write faces
            if(this.faces.length > 0) {
                this.offsetFace = writeStream.position - 4;
                writeStream.overwrite(this.offsetFace, DataType.UInt32, pOffsetFace);

                for(let face of this.faces) face.write(writeStream);
            }

            if(this.version == 'COL3' && this.hasShadow) {
                // Write shadow vertices
                if(this.shadowVertices.length > 0) {
                    this.offsetShadowVertex = writeStream.position - 4;
                    if(pOffsetShadowVertex) writeStream.overwrite(this.offsetShadowVertex, DataType.UInt32, pOffsetShadowVertex);

                    for(let vertex of this.shadowVertices) vertex.write(writeStream);

                    if((writeStream.position - this.offsetShadowVertex) % 4 != 0) { // for 48 bytes alignment
                        writeStream.write(0, DataType.UInt16);
                    }
                }

                // Write shadow faces
                if(this.shadowFaces.length > 0) {
                    this.offsetShadowFace = writeStream.position - 4;
                    if(pOffsetShadowFace) writeStream.overwrite(this.offsetShadowFace, DataType.UInt32, pOffsetShadowFace);

                    for(let face of this.shadowFaces) face.write(writeStream);
                }
            }
        } else if(this.version == 'COLL') {
            // Write spheres
            writeStream.write(this.spheres.length, DataType.UInt32);
            for(let sphere of this.spheres) {
                sphere.write(writeStream);
            }

            writeStream.write(0, DataType.UInt32); // Not used

            // Write boxes
            writeStream.write(this.boxes.length, DataType.UInt32);
            for(let box of this.boxes) {
                box.write(writeStream);
            }

            // Write vertices
            writeStream.write(this.vertices.length, DataType.UInt32);
            for(let vertex of this.vertices) {
                vertex.write(writeStream);
            }

            // Write faces
            writeStream.write(this.faces.length, DataType.UInt32);
            for(let face of this.faces) {
                face.write(writeStream);
            }
        }

        writeStream.overwrite(writeStream.position, DataType.UInt32, sizePosition);
    }

    save(path: string) {
        let writeStream = new WriteStream();
        this.write(writeStream);

        fs.writeFileSync(path, writeStream.save()!);
    }

    toString() {
        return `COL {
    version: ${this.version},
    sphereCount: ${this.spheres.length},
    boxCount: ${this.boxes.length},
    vertexCount: ${this.vertices.length},
    faceCount: ${this.faces.length},
    flags: ${this.flags},
    useConeInsteadOfLine: ${this.useConeInsteadOfLine},
    notEmpty: ${this.notEmpty},
    hasFaceGroup: ${this.hasFaceGroup},
    hasShadow: ${this.hasShadow},
    offsetSphere: ${this.offsetSphere},
    offsetBox: ${this.offsetBox},
    offsetLine: ${this.offsetLine},
    offsetVertex: ${this.offsetVertex},
    offsetFace: ${this.offsetFace},
    offsetFaceGroup: ${this.offsetFaceGroup},
    offsetShadowVertex: ${this.offsetShadowVertex},
    offsetShadowFace: ${this.offsetShadowFace},
    shadowFaceCount: ${this.shadowFaces.length},
    shadowVertexCount: ${this.shadowVertices.length},
    spheres: [${this.spheres.join(', ')}],
    boxes: [${this.boxes.join(', ')}],
    vertices: [${this.vertices.join(', ')}],
    faces: [${this.faces.join(', ')}],
    faceGroups: [${this.faceGroups.join(', ')}],
    shadowVertices: [${this.shadowVertices.join(', ')}],
    shadowFaces: [${this.shadowFaces.join(', ')}]
}`
    }
}