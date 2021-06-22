import {FC, useEffect, useRef, useState} from 'react';

type ConfusionMatrixProps = {
    size: number,
    matrix: number[][],
    labels?: (string | number)[]
};

function findMaxValue(matrix: number[][]): number {
    let max = 1;
    for (let i = 0; i < matrix.length; i++) {
        const maxRow = Math.max(...matrix[i]);
        max = maxRow > max ? maxRow : max;
    }
    return max;
}

export const ConfusionMatrix: FC<ConfusionMatrixProps> = ({size, matrix,...rest}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, changeCtx] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        changeCtx(() => canvasRef.current!.getContext('2d'));
    }, []);

    useEffect(() => {
        if (ctx) {

            const padding = 20;

            const sizeSquare = (size - padding) / matrix.length;
            const maxMatrixVal = findMaxValue(matrix);


            ctx.clearRect(0, 0, size, size);

            const labels = rest.labels || Array.from({length: matrix.length}).map((_, i) => i);



            // draw work area
            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                    // fill rectangle
                    ctx.fillStyle = `rgba(0, 0, 0, ${1 - matrix[i][j] / maxMatrixVal})`;
                    ctx.fillRect(padding + i * sizeSquare, padding + j * sizeSquare, sizeSquare, sizeSquare);

                    // draw square boarder
                    ctx.beginPath();
                    ctx.rect(padding + i * sizeSquare, padding + j * sizeSquare, sizeSquare, sizeSquare);
                    ctx.stroke();

                    // put value
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'red';
                    ctx.font = '14px serif';
                    ctx.fillText(matrix[i][j].toString(), padding + i * sizeSquare + sizeSquare / 2, padding + j * sizeSquare + sizeSquare / 2 + 5);
                }
            }

            // draw labels
            for (let i = 0; i < matrix.length; i++) {
                ctx.textAlign = 'center';
                ctx.fillStyle = 'red';
                ctx.font = '14px serif';
                ctx.fillText(labels[i].toString(),    padding + i * sizeSquare + sizeSquare / 2, 14);
                ctx.fillText(labels[i].toString(),     10, padding + i * sizeSquare + sizeSquare / 2 + 5);
            }
        }
    }, [size, matrix, ctx]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
        />
    );
};