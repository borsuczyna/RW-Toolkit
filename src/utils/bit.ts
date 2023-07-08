export function bExtract(num: number, pos: number, length?: number): number {
    let y = num % (2 ** (pos + (length || 1))) / (2 ** pos);
    return y - y % 1;
}

export function bAssemble(...bits: boolean[]): number {
    let result = 0;
    for (let i = 0; i < bits.length; i++) {
        result += (bits[i] ? 1 : 0) * 2 ** i;
    }
    return result;
}