import Section from "./Section";
import { RWVersion } from "./enums";

export default class Extension extends Section {
    static staticTypeID: number = 0x03;
    typeID: number = 0x03;

    init(version: RWVersion) {
        this.size = 0;
        this.version = version;
        this.type = Extension.staticTypeID;
        return this;
    }

    update() {
        this.size = this.getSize(true);
        return this;
    }
}