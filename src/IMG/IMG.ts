import { DataType, ReadStream, WriteStream } from "../utils/stream";
import * as fs from 'fs';

export type IMGVersion = 'VER2';

interface IMGEntry {
    offset: number;
    offsetString: string;
    streamingSize: number;
    sizeInArchive: number;
    name: string;
    temporary: boolean;
    data?: Buffer;
}

export class IMG {
    readStream: ReadStream;
    version: IMGVersion = 'VER2';

    entriesCount: number = 0;
    entries: IMGEntry[] = [];

    filePath?: string;

    constructor(fileOrData: string | Buffer) {
        this.readStream = new ReadStream(fileOrData);
        if(fs.existsSync(fileOrData)) this.filePath = fileOrData as string;

        this.readData();
    }

    private readData() {
        this.version = this.readStream.read(DataType.Char, 4) as IMGVersion;
        if(this.version !== 'VER2') throw new Error('Unsupported IMG version.');

        this.entriesCount = this.readStream.read(DataType.UInt32);

        for(let i = 0; i < this.entriesCount; i++) {
            let offset: number = this.readStream.read(DataType.UInt32);
            let streamingSize: number = this.readStream.read(DataType.UInt16);
            let sizeInArchive: number = this.readStream.read(DataType.UInt16);
            let name: string = this.readStream.read(DataType.Char, 24);
            let offsetString: string = (offset*2048).toString(16);
            while(offsetString.length < 8) offsetString = '0' + offsetString;

            this.entries.push({
                offset: offset*2048,
                offsetString: offsetString,
                streamingSize: streamingSize*2048,
                sizeInArchive: sizeInArchive*2048,
                name: name,
                temporary: false
            });
        }
    }

    doesFileExist(name: string) {
        return this.entries.some(entry => entry.name === name);
    }

    addFile(name: string, data: Buffer) {
        if(this.doesFileExist(name)) return false;

        let offset = this.entries[this.entries.length - 1].offset + this.entries[this.entries.length - 1].sizeInArchive;
        let offsetString = offset.toString(16);
        while(offsetString.length < 8) offsetString = '0' + offsetString;

        this.entries.push({
            offset,
            offsetString,
            streamingSize: data.length,
            sizeInArchive: data.length,
            name,
            data,
            temporary: true
        });

        return true;
    }
    
    getFile(name: string): Buffer | undefined {
        let entry = this.entries.find(entry => entry.name === name);
        if(!entry) return undefined;

        if(entry.data) return entry.data;

        this.readStream.seek(entry.offset);
        return this.readStream.read<Buffer>(DataType.Bytes, entry.streamingSize);
    }

    save(): Buffer {
        let writeStream = new WriteStream();
        
        writeStream.write(this.version, DataType.Char, 4);
        writeStream.write(this.entries.length, DataType.UInt32, 4);

        for(let entry of this.entries) {
            writeStream.write(entry.offset/2048, DataType.UInt32, 4);
            writeStream.write(entry.streamingSize/2048, DataType.UInt16, 2);
            writeStream.write(entry.sizeInArchive/2048, DataType.UInt16, 2);
            writeStream.write(entry.name, DataType.Char, 24);
        }

        for(let entry of this.entries) {
            let data: Buffer | undefined = entry.data || this.getFile(entry.name);
            if(!data) throw new Error('File not found.');

            writeStream.seek(entry.offset);
            writeStream.write(data, DataType.Bytes, data.length);
        }

        let data: Buffer = writeStream.save()!;
        return data;
    }

    saveToFile(path?: string) {
        path = path || this.filePath;
        if(!path) throw new Error('No path specified.');

        let data = this.save();
        fs.writeFileSync(path, data);
    }

    get size(): number {
        let size = 0;
        
        size += 4; // Version
        size += 4; // Entries count
        size += this.entries.length * 32; // Entries

        for(let entry of this.entries) {
            size += entry.streamingSize;
        }

        return size;
    }
};