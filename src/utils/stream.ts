import * as fs from "fs";

export enum DataType {
    UInt32 = "UInt32",
    UInt24 = "UInt24",
    UInt16 = "UInt16",
    UInt8 = "UInt8",
    Int32 = "Int32",
    Int24 = "Int24",
    Int16 = "Int16",
    Int8 = "Int8",
    UShort = "UShort",
    Float = "Float",
    Char = "Char",
    Bytes = "Bytes",
}

export type DataTypesLength = Record<DataType, number>;

export const dataTypesLength: DataTypesLength = {
    [DataType.UInt32]: 4,
    [DataType.UInt24]: 3,
    [DataType.UInt16]: 2,
    [DataType.UInt8]: 1,
    [DataType.Int32]: 4,
    [DataType.Int24]: 3,
    [DataType.Int16]: 2,
    [DataType.Int8]: 1,
    [DataType.UShort]: 2,
    [DataType.Float]: 4,
    [DataType.Char]: 1, // Assumes 1 byte per character
    [DataType.Bytes]: 0, // Placeholder value
};

function readData(dataType: DataType, readLength: number) {
    let result;
    const buffer = Buffer.alloc(readLength);

    if (this.file) {
        fs.read(this.fd, buffer, 0, readLength, this.position, (err, bytesRead) => {
            if (err) throw err;
            result = parseBuffer(dataType, buffer, bytesRead);
        });
    } else if (this.buffer) {
        result = parseBuffer(dataType, this.buffer.slice(this.position, this.position + readLength), readLength);
    }

    return result;
}

function parseBuffer(dataType: DataType, buffer: Buffer, bytesRead?: number) {
    switch (dataType) {
        case DataType.UInt32:
            return buffer.readUInt32LE(0);
        case DataType.UInt24:
            return buffer.readUIntLE(0, bytesRead);
        case DataType.UInt16:
            return buffer.readUInt16LE(0);
        case DataType.UInt8:
            return buffer.readUInt8(0);
        case DataType.Int32:
            return buffer.readInt32LE(0);
        case DataType.Int24:
            return buffer.readIntLE(0, bytesRead);
        case DataType.Int16:
            return buffer.readInt16LE(0);
        case DataType.Int8:
            return buffer.readInt8(0);
        case DataType.Float:
            return buffer.readFloatLE(0);
        case DataType.Char:
            let str = buffer.toString("utf8", 0, bytesRead);
            str = str.replace(/\uFFFD/g, "");
            const nullTermination = str.indexOf("\0");
            if (nullTermination !== -1) str = str.substr(0, nullTermination);
            return str;
        case DataType.Bytes:
            return buffer;
        default:
            throw new Error("Invalid data type.");
    }
}

export class ReadStream {
    buffer?: Buffer;
    file?: string;
    position: number = 0;
    raw: boolean = false;
    fd?: number;

    constructor(bufferOrFile: Buffer | string) {
        if (typeof bufferOrFile === "string") {
            if (fs.existsSync(bufferOrFile)) {
                // this.file = bufferOrFile;
                // this.fd = fs.openSync(bufferOrFile, "r");
                this.buffer = fs.readFileSync(bufferOrFile);
            } else {
                this.buffer = Buffer.from(bufferOrFile);
            }
        } else {
            this.buffer = bufferOrFile;
        }
    }

    peek<T extends number | string | Buffer>(dataType: DataType, readLength: number): T {
        let result;
        const buffer = Buffer.alloc(readLength);
    
        let currentPosition = this.position;
    
        if (this.file) {
            const bytesRead = fs.readSync(this.fd, buffer, 0, readLength, currentPosition);
            result = parseBuffer(dataType, buffer, bytesRead);
        } else if (this.buffer) {
            result = parseBuffer(dataType, this.buffer.slice(currentPosition, currentPosition + readLength), readLength);
        }

        return result;
    }

    read<T extends number | string | Buffer>(dataType: DataType, additionLength?: number): T {
        let result: number | string | Buffer = 0;
        let readLength = dataTypesLength[dataType];

        if(additionLength && (
            dataType === DataType.Char ||
            dataType === DataType.Bytes
        )) readLength = additionLength;

        result = this.peek(dataType, readLength);

        this.position += readLength;
        return result as T;
    }

    readSome<T extends number | string | Buffer>(dataType: DataType, count: number = 1): T[] {
        const result: T[] = [];
        let readLength = dataTypesLength[dataType];

        for(let i = 0; i < count; i++) {
            result.push(this.read(dataType) as T);
        }

        return result as T[];
    }
    
    seek(position: number) {
        this.position = position;
    }

    get length() {
        if(this.file) return fs.statSync(this.file).size;
        else if(this.buffer) return this.buffer.length;
        else return 0;
    }

    close() {
        if (this.fd) {
            fs.closeSync(this.fd);
            this.fd = undefined;
        }
    }
}

export class WriteStream {
    buffer: Buffer;
    file?: string;
    position: number = 0;
    fd?: number;

    constructor(bufferOrFile?: Buffer | string) {
        if (typeof bufferOrFile === "string") {
            // this.file = bufferOrFile;
            // this.fd = fs.openSync(bufferOrFile, "w");
            this.buffer = Buffer.alloc(0);
        } else if(bufferOrFile) {
            this.buffer = bufferOrFile;
        } else {
            this.buffer = Buffer.alloc(0);
        }
    }

    write<T extends number | string | Buffer>(data: T, dataType: DataType, additionLength?: number) {
        const writeLength = dataTypesLength[dataType];
        let buffer = Buffer.alloc(writeLength);
    
        switch (dataType) {
            case DataType.UInt32:
                buffer.writeUInt32LE(data as number, 0);
                break;
            case DataType.UInt24:
                buffer.writeUIntLE(data as number, 0, writeLength);
                break;
            case DataType.UInt16:
                buffer.writeUInt16LE(data as number, 0);
                break;
            case DataType.UInt8:
                buffer.writeUInt8(data as number, 0);
                break;
            case DataType.Int32:
                buffer.writeInt32LE(data as number, 0);
                break;
            case DataType.Int24:
                buffer.writeIntLE(data as number, 0, writeLength);
                break;
            case DataType.Int16:
                buffer.writeInt16LE(data as number, 0);
                break;
            case DataType.Int8:
                buffer.writeInt8(data as number, 0);
                break;
            case DataType.Float:
                buffer.writeFloatLE(data as number, 0);
                break;
            case DataType.Char:
                buffer = Buffer.from(data as string, "utf8").slice(0, writeLength);
                break;
            case DataType.Bytes:
                buffer = data as Buffer;
                break;
            default:
                throw new Error("Invalid data type.");
        }
    
        if (this.file) {
            fs.writeSync(this.fd!, buffer, 0, writeLength, this.position);
        } else {
            if (this.buffer.length < this.position + writeLength) {
                const newBufferSize = Math.max(this.buffer.length * 2, this.position + writeLength);
                const newBuffer = Buffer.alloc(newBufferSize);
                this.buffer.copy(newBuffer);
                this.buffer = newBuffer;
            }
    
            buffer.copy(this.buffer, this.position);
        }
    
        this.position += writeLength;
        return this.position - writeLength;
    }    

    writeSome<T extends number | string | Buffer>(dataType: DataType, ...data: T[]) {
        let previousPosition = this.position;
        data.forEach(d => this.write(d, dataType));
        return previousPosition;
    }

    overwrite<T extends number | string | Buffer>(data: T, dataType: DataType, position: number, additionLength?: number) {
        let previousPosition = this.position;
        this.position = position;
        this.write(data, dataType, additionLength);
        this.position = previousPosition;
    }

    peek<T extends number | string | Buffer>(dataType: DataType, additionLength?: number): T {
        let readLength = dataTypesLength[dataType];
        let result: number | string | Buffer = 0;

        if (additionLength && (
            dataType === DataType.Char ||
            dataType === DataType.Bytes
        )) readLength = additionLength;

        if (this.file) {
            const buffer = Buffer.alloc(readLength);
            fs.readSync(this.fd!, buffer, 0, readLength, this.position);
            result = buffer;
        } else {
            result = this.buffer.slice(this.position, this.position + readLength);
        }

        return result as T;
    }

    seek(position: number) {
        this.position = position;
    }

    close() {
        if (this.fd) {
            fs.closeSync(this.fd);
            this.fd = undefined;
        }
    }

    save() {
        if(this.file) return fs.readFileSync(this.file);
        return this.buffer;
    }
}