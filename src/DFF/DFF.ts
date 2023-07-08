import fs from 'fs';
import { ReadStream, WriteStream } from "../utils/stream";
import Clump from './Clump';
import Section, { recastSection } from './Section';
import { RWVersion } from './enums';
import UVAnimDict from './UVAnim';

export default class DFF {
    readStream: ReadStream;
    filePath?: string;

    version: RWVersion = RWVersion.GTASA;
    clumps: Clump[] = [];
    uvAnimDict?: UVAnimDict;

    constructor(fileOrData: string | Buffer) {
        this.readStream = new ReadStream(fileOrData);
        if(fs.existsSync(fileOrData)) this.filePath = fileOrData as string;

        this.read();
    }

    read() {
        this.clumps = [];

        while(this.readStream.position+12 < this.readStream.length) {
            let nextSection = new Section();
            nextSection.parent = this;
            nextSection.read(this.readStream);
            this.version = nextSection.version!;

            if(nextSection.type == UVAnimDict.staticTypeID) {
                this.uvAnimDict = recastSection(nextSection, new UVAnimDict());
                this.uvAnimDict.read(this.readStream);
            } else if(nextSection.type == Clump.staticTypeID) {
                let clump = recastSection<Clump>(nextSection, new Clump());
                clump.read(this.readStream);
                this.clumps.push(clump);
            } else break;
        }
    }

    createClump() {
        let clump = new Clump();
        clump.parent = this;
        clump.init(this.version);
        this.clumps.push(clump);
    }

    save(filePath?: string) {
        let writeStream = new WriteStream(filePath || this.filePath);
        if(!writeStream.fd) throw new Error("No file descriptor");

        for(let clump of this.clumps) {
            clump.write(writeStream);
        }

        writeStream.save();
    }

    convert(version: RWVersion) {
        this.version = version;

        for(let clump of this.clumps) {
            clump.convert(version);
        }
    }

    update() {
        for(let clump of this.clumps) {
            clump.getSize();
        }
    }
}