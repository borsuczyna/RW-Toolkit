export function rotationMatrixToEuler(rotMatrix: [
    [number, number, number],
    [number, number, number],
    [number, number, number]
]): [number, number, number] {
    const cY = Math.sqrt(rotMatrix[0][0] * rotMatrix[0][0] + rotMatrix[1][0] * rotMatrix[1][0]);
    let x, y, z;
    
    if (cY >= 1e-6) {
        x = Math.atan2(rotMatrix[2][1], rotMatrix[2][2]);
        y = Math.atan2(-rotMatrix[2][0], cY);
        z = Math.atan2(rotMatrix[1][0], rotMatrix[0][0]);
    } else {
        x = Math.atan2(-rotMatrix[1][2], rotMatrix[1][1]);
        y = Math.atan2(-rotMatrix[2][0], cY);
        z = 0;
    }

    return [x * (180 / Math.PI), y * (180 / Math.PI), z * (180 / Math.PI)];
}

export function eulerToRotationMatrix(rx: number, ry: number, rz: number): [
    [number, number, number],
    [number, number, number],
    [number, number, number]
] {
    const Deg2Rad = Math.PI / 180;
    const radX = rx * Deg2Rad;
    const radY = ry * Deg2Rad;
    const radZ = rz * Deg2Rad;
    const cX = Math.cos(radX);
    const sX = Math.sin(radX);
    const cY = Math.cos(radY);
    const sY = Math.sin(radY);
    const cZ = Math.cos(radZ);
    const sZ = Math.sin(radZ);

    const matrixRX = [
        [1, 0, 0],
        [0, cX, -sX],
        [0, sX, cX],
    ];

    const matrixRY = [
        [cY, 0, sY],
        [0, 1, 0],
        [-sY, 0, cY],
    ];

    const matrixRZ = [
        [cZ, -sZ, 0],
        [sZ, cZ, 0],
        [0, 0, 1],
    ];

    const rotMatrix = matrixRZ.map((row, i) =>
        row.map((_, j) => matrixRX[i][0] * matrixRY[0][j] + matrixRX[i][1] * matrixRY[1][j] + matrixRX[i][2] * matrixRY[2][j])
    ) as [
        [number, number, number],
        [number, number, number],
        [number, number, number]
    ];

    return rotMatrix;
}