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

export class ReadStream {
    buffer?: Buffer;
    file?: string;
    position: number = 0;
    raw: boolean = false;
    fd?: number;

    constructor(bufferOrFile: Buffer | string) {
        if (typeof bufferOrFile === "string") {
            if (fs.existsSync(bufferOrFile)) {
                this.file = bufferOrFile;
                this.fd = fs.openSync(bufferOrFile, "r");
            } else {
                this.buffer = Buffer.from(bufferOrFile);
            }
        } else {
            this.buffer = bufferOrFile;
        }
    }


    peek<T extends number | string | Buffer>(dataType: DataType, additionLength?: number): T {
        let result: number | string | Buffer = 0;
        let readLength = dataTypesLength[dataType];

        switch (dataType) {
            case DataType.UInt32:
                if (this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer.readUInt32LE(0);
                } else if(this.buffer) result = this.buffer.readUInt32LE(this.position);

                break;
            case DataType.UInt24:
                if(this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer.readUIntLE(0, readLength);
                } else if(this.buffer) result = this.buffer.readUIntLE(this.position, readLength);

                break;
            case DataType.UInt16:
                if(this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer.readUInt16LE(0);
                } else if(this.buffer) result = this.buffer.readUInt16LE(this.position);

                break;
            case DataType.UInt8:
                if(this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer.readUInt8(0);
                } else if(this.buffer) result = this.buffer.readUInt8(this.position);

                break;
            case DataType.Int32:
                if(this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer.readInt32LE(0);
                } else if(this.buffer) result = this.buffer.readInt32LE(this.position);

                break;
            case DataType.Int24:
                if(this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer.readIntLE(0, readLength);
                } else if(this.buffer) result = this.buffer.readIntLE(this.position, readLength);

                break;
            case DataType.Int16:
                if(this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer.readInt16LE(0);
                } else if(this.buffer) result = this.buffer.readInt16LE(this.position);

                break;
            case DataType.Int8:
                if(this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer.readInt8(0);
                } else if(this.buffer) result = this.buffer.readInt8(this.position);

                break;
            case DataType.Float:
                if(this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer.readFloatLE(0);
                } else if(this.buffer) result = this.buffer.readFloatLE(this.position);

                break;
            case DataType.Char:
                readLength = additionLength || 1;
                if(this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer.toString("utf8");
                } else if(this.buffer) result = this.buffer.toString("utf8", this.position, this.position + readLength);

                result = (<string>result).replace(/\uFFFD/g, "").replace(/\0/g, "").trim();
                
                break;
            case DataType.Bytes:
                readLength = additionLength || 1;
                if(this.file) {
                    const buffer = Buffer.alloc(readLength);
                    fs.readSync(this.fd!, buffer, 0, readLength, this.position);
                    result = buffer;
                } else if(this.buffer) result = this.buffer.slice(this.position, this.position + readLength);

                break;
            default:
                throw new Error("Invalid data type.");
        }

        return result as T;
    }

    read<T extends number | string | Buffer>(dataType: DataType, additionLength?: number): T {
        let result: number | string | Buffer = 0;
        let readLength = dataTypesLength[dataType];

        if(additionLength && (
            dataType === DataType.Char ||
            dataType === DataType.Bytes
        )) readLength = additionLength;

        result = this.peek(dataType, additionLength);

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
            this.file = bufferOrFile;
            this.fd = fs.openSync(bufferOrFile, "w");
            this.buffer = Buffer.alloc(0);
        } else if(bufferOrFile) {
            this.buffer = bufferOrFile;
        } else {
            this.buffer = Buffer.alloc(0);
        }
    }

    write<T extends number | string | Buffer>(data: T, dataType: DataType, additionLength?: number) {
        let writeLength = dataTypesLength[dataType];
        let buffer: Buffer;

        switch (dataType) {
            case DataType.UInt32:
                buffer = Buffer.alloc(writeLength);
                buffer.writeUInt32LE(<number>data, 0);
                break;
            case DataType.UInt24:
                buffer = Buffer.alloc(writeLength);
                buffer.writeUIntLE(<number>data, 0, writeLength);
                break;
            case DataType.UInt16:
                buffer = Buffer.alloc(writeLength);
                buffer.writeUInt16LE(<number>data, 0);
                break;
            case DataType.UInt8:
                buffer = Buffer.alloc(writeLength);
                buffer.writeUInt8(<number>data, 0);
                break;
            case DataType.Int32:
                buffer = Buffer.alloc(writeLength);
                buffer.writeInt32LE(<number>data, 0);
                break;
            case DataType.Int24:
                buffer = Buffer.alloc(writeLength);
                buffer.writeIntLE(<number>data, 0, writeLength);
                break;
            case DataType.Int16:
                buffer = Buffer.alloc(writeLength);
                buffer.writeInt16LE(<number>data, 0);
                break;
            case DataType.Int8:
                buffer = Buffer.alloc(writeLength);
                buffer.writeInt8(<number>data, 0);
                break;
            case DataType.Float:
                buffer = Buffer.alloc(writeLength);
                buffer.writeFloatLE(<number>data, 0);
                break;
            case DataType.Char:
                writeLength = additionLength || 1;
                buffer = Buffer.alloc(writeLength);
                buffer.write(<string>data, 0, writeLength, "utf8");
                break;
            case DataType.Bytes:
                writeLength = additionLength || 1;
                buffer = <Buffer>data;
                break;
            default:
                throw new Error("Invalid data type.");
        }

        if (this.file) {
            fs.writeSync(this.fd!, buffer, 0, writeLength, this.position);
        } else {
            if (this.buffer.length < this.position + writeLength) {
                const newBuffer = Buffer.alloc(this.position + writeLength);
                this.buffer.copy(newBuffer);
                this.buffer = newBuffer;
            }

            buffer.copy(this.buffer, this.position);
        }

        this.position += writeLength;
    }

    writeSome<T extends number | string | Buffer>(dataType: DataType, ...data: T[]) {
        data.forEach(d => this.write(d, dataType));
    }

    overwrite<T extends number | string | Buffer>(data: T, dataType: DataType, position: number, additionLength?: number) {
        this.position = position;
        this.write(data, dataType, additionLength);
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
        return this.file ? fs.writeFileSync(this.file, this.buffer) : this.buffer;
    }
}