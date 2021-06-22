import {FC, useEffect, useRef} from 'react';
import * as tf from '@tensorflow/tfjs';
import {TensorLike, Tensor, Rank} from '@tensorflow/tfjs';

type DrawTensorProps = {
    width: number,
    height: number,
    tensor: Tensor<Rank.R2>|Tensor<Rank.R3>|TensorLike
}

export const DrawTensor: FC<DrawTensorProps> = ({width, height, tensor}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        tf.browser.toPixels(tensor, canvasRef.current!)
    }, []);
    return (
        <canvas
            style={{verticalAlign: 'top'}}
            ref={canvasRef}
            width={width}
            height={height}
        />
    );
};