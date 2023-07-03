export function bExtract(num: number, pos: number, length?: number): number {
    let y = num % (2 ** (pos + (length || 1))) / (2 ** pos);
    return y - y % 1;
}