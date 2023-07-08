import Section from "./Section";
import { RWVersion } from "./enums";

export default class Struct extends Section {
    static staticTypeID: number = 0x01;
    typeID: number = 0x01;

    init(version: RWVersion) {
        this.size = 0;
        this.version = version;
        this.type = Struct.staticTypeID;
        return this;
    }
}