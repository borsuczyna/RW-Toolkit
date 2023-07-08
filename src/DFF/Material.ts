import { DataType, ReadStream, WriteStream } from "../utils/stream";
import Extension from "./Extension";
import MaterialEffectPLG from "./MaterialEffectPLG";
import ReflectionMaterial from "./ReflectionMaterial";
import Section, { recastSection } from "./Section";
import SpecularMaterial from "./SpecularMaterial";
import Struct from "./Struct";
import Texture from "./Texture";
import UVAnimPLG from "./UVAnimPLG";
import { RWVersion } from "./enums";

class MaterialStruct extends Struct {
    flags: number = 0;
    color: [number, number, number, number] = [255, 255, 255, 255];
    unused: number = 0;
    isTextured: boolean = false;
    ambient: number = 1;
    specular: number = 1;
    diffuse: number = 1;

    init(version: RWVersion): this {
        this.flags = 0;
        this.color = [255, 255, 255, 255];
        this.unused = 0;
        this.isTextured = false;
        this.ambient = 1;
        this.specular = 1;
        this.diffuse = 1;
        this.size = this.getSize(true);
        this.version = version;
        this.type = MaterialStruct.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.flags = readStream.read(DataType.UInt32);
            this.color = readStream.readSome(DataType.UInt8, 4) as [number, number, number, number];
            this.unused = readStream.read(DataType.UInt32);
            this.isTextured = readStream.read(DataType.UInt32) === 1;
            this.ambient = readStream.read(DataType.Float);
            this.specular = readStream.read(DataType.Float);
            this.diffuse = readStream.read(DataType.Float);
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.flags, DataType.UInt32);
            writeStream.writeSome(DataType.UInt8, ...this.color);
            writeStream.write(this.unused, DataType.UInt32);
            writeStream.write(this.isTextured ? 1 : 0, DataType.UInt32);
            writeStream.write(this.ambient, DataType.Float);
            writeStream.write(this.specular, DataType.Float);
            writeStream.write(this.diffuse, DataType.Float);
        },

        getSize: () => {
            this.size = 4 + 1*4 + 4 + 4 + 4*3;
            return this.size;
        }
    }
}

class MaterialExtension extends Extension {
    materialEffect?: MaterialEffectPLG;
    reflectionMaterial?: ReflectionMaterial;
    specularMaterial?: SpecularMaterial;
    uvAnimation?: UVAnimPLG;

    init(version: RWVersion): this {
        this.size = this.getSize(true);
        this.version = version;
        this.type = MaterialExtension.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            let readSize = 0;
            while(this.size > readSize) {
                let section = new Section();
                section.parent = this;
                section.read(readStream);

                if(section.type == ReflectionMaterial.staticTypeID) {
                    this.reflectionMaterial = recastSection<ReflectionMaterial>(section, new ReflectionMaterial());
                    this.reflectionMaterial.read(readStream);
                } else if(section.type == SpecularMaterial.staticTypeID) {
                    this.specularMaterial = recastSection<SpecularMaterial>(section, new SpecularMaterial());
                    this.specularMaterial.read(readStream);
                } else if(section.type == MaterialEffectPLG.staticTypeID) {
                    this.materialEffect = recastSection<MaterialEffectPLG>(section, new MaterialEffectPLG());
                    this.materialEffect.read(readStream);
                } else if(section.type == UVAnimPLG.staticTypeID) {
                    this.uvAnimation = recastSection<UVAnimPLG>(section, new UVAnimPLG());
                    this.uvAnimation.read(readStream);
                }
                
                readSize += section.size + 12;
            }
        },

        write: (writeStream: WriteStream) => {
            if(this.reflectionMaterial) this.reflectionMaterial.write(writeStream);
            if(this.specularMaterial) this.specularMaterial.write(writeStream);
            if(this.materialEffect) this.materialEffect.write(writeStream);
            if(this.uvAnimation) this.uvAnimation.write(writeStream);
        },

        getSize: () => {
            this.size = (this.reflectionMaterial ? this.reflectionMaterial.getSize() : 0) +
                        (this.specularMaterial ? this.specularMaterial.getSize() : 0) +
                        (this.materialEffect ? this.materialEffect.getSize() : 0) +
                        (this.uvAnimation ? this.uvAnimation.getSize() : 0);
            return this.size;
        },

        convert: (version: RWVersion) => {
            if(this.reflectionMaterial) this.reflectionMaterial.convert(version);
            if(this.specularMaterial) this.specularMaterial.convert(version);
            if(this.materialEffect) this.materialEffect.convert(version);
            if(this.uvAnimation) this.uvAnimation.convert(version);
        }
    }
}

class Material extends Section {
    static staticTypeID = 0x07;
    typeID = Material.staticTypeID;

    struct: MaterialStruct = new MaterialStruct().init(this.version);
    texture?: Texture;
    extension: MaterialExtension = new MaterialExtension().init(this.version);

    init(version: RWVersion): this {
        this.struct = new MaterialStruct().init(version);
        this.struct.parent = this;
        this.extension = new MaterialExtension().init(version);
        this.extension.parent = this;
        this.size = this.getSize(true);
        this.version = version;
        this.type = Material.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            // Read material struct
            this.struct = new MaterialStruct();
            this.struct.parent = this;
            this.struct.read(readStream);
            
            if(this.struct.isTextured) {
                this.texture = new Texture();
                this.texture.parent = this;
                this.texture.read(readStream);
            }
            
            // Read material extension
            this.extension = new MaterialExtension();
            this.extension.parent = this;
            this.extension.read(readStream);
        },

        write: (writeStream: WriteStream) => {
            this.struct.write(writeStream);

            if(this.struct.isTextured) {
                this.texture!.write(writeStream);
            }

            this.extension.write(writeStream);
        },

        getSize: () => {
            this.size = this.struct.getSize() + (this.struct.isTextured ? this.texture!.getSize() : 0) + this.extension.getSize();
            return this.size;
        },

        convert: (version: RWVersion) => {
            this.struct.convert(version);
            if(this.struct.isTextured) {
                this.texture!.convert(version);
            }
            this.extension.convert(version);
        }
    }
}

class MaterialListStruct extends Struct {
    materialCount: number = 0;
    materialIndices: number[] = [];

    init(version: RWVersion): this {
        this.materialCount = 0;
        this.materialIndices = [];
        this.size = this.getSize(true);
        this.version = version;
        this.type = MaterialListStruct.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            this.materialCount = readStream.read(DataType.UInt32);
            
            this.materialIndices = [];
            for (let i = 0; i < this.materialCount; i++) {
                this.materialIndices.push(readStream.read(DataType.Int32));
            }
        },

        write: (writeStream: WriteStream) => {
            writeStream.write(this.materialCount, DataType.UInt32);

            for (let i = 0; i < this.materialCount; i++) {
                writeStream.write(this.materialIndices[i], DataType.Int32);
            }
        },

        getSize: () => {
            this.size = 4 + this.materialCount * 4;
            return this.size;
        }
    }
}

export default class MaterialList extends Section {
    static staticTypeID = 0x08;
    typeID = MaterialList.staticTypeID;

    struct: MaterialListStruct = new MaterialListStruct().init(this.version);
    materials: Material[] = [];

    init(version: RWVersion): this {
        this.struct = new MaterialListStruct().init(version);
        this.struct.parent = this;
        this.materials = [];
        this.size = this.getSize(true);
        this.version = version;
        this.type = MaterialList.staticTypeID;
        return this;
    }

    methodContinue = {
        read: (readStream: ReadStream) => {
            // Read material list struct
            this.struct = new MaterialListStruct();
            this.struct.parent = this;
            this.struct.read(readStream);
            
            // Read materials
            this.materials = [];
            for (let i = 0; i < this.struct.materialCount; i++) {
                let material = new Material();
                material.parent = this;
                material.read(readStream);
                this.materials.push(material);
            }
        },

        write: (writeStream: WriteStream) => {
            this.struct.materialCount = this.materials.length;
            this.struct.write(writeStream);

            for (let material of this.materials) {
                material.write(writeStream);
            }
        },

        getSize: () => {
            let size = this.struct.getSize();
            for (let material of this.materials) {
                size += material.getSize();
            }
            return size;   
        },

        convert: (version: RWVersion) => {
            this.struct.convert(version);
            for (let material of this.materials) {
                material.convert(version);
            }
        }
    }

    findMaterialByTexName(texName: string): Material | undefined {
        for (let material of this.materials) {
            if (material.texture!.textureName.string === texName) {
                return material;
            }
        }
    }

    findMaterialByMaskName(maskName: string): Material | undefined {
        for (let material of this.materials) {
            if (material.texture!.maskName.string === maskName) {
                return material;
            }
        }
    }

    findMaterialByColor(r: number, g: number, b: number, a: number): Material | undefined {
        for (let material of this.materials) {
            let color = material.struct.color;
            if(color[0] === r && color[1] === g && color[2] === b && color[3] === a) {
                return material;
            }
        }
    }
}