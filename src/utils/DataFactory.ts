import * as tf from '@tensorflow/tfjs';
import {Tensor, Rank} from '@tensorflow/tfjs';
import {fetchWithProgress} from './fetch/fetchWithProgress';


type LoadOpts = {
    completed: () => void,
    progress: (progress: number) => void
}

export enum DataType {
    MNIST,
    FASHION_MNIST
}

export const DataTypeLabels: { [key: string]: string } = {
    [DataType.MNIST]: 'MNIST',
    [DataType.FASHION_MNIST]: 'FASHION MNIST'
};

const DATA_META: { [key: string]: { xsUrl: string, ysUrl: string, numSamples: number } } = {
    [DataType.MNIST]: {
        xsUrl: '/data/mnist/xs.bin',
        ysUrl: '/data/mnist/ys.bin',
        numSamples: 42_000
    },
    [DataType.FASHION_MNIST]: {
        xsUrl: '/data/fashion-mnist/xs.bin',
        ysUrl: '/data/fashion-mnist/ys.bin',
        numSamples: 60_000
    }
};

export class DataFactory {
    public xsTrain: Tensor<Rank.R4> | null = null;
    public ysTrain: Tensor<Rank.R2> | null = null;

    public xsTest: Tensor<Rank.R4> | null = null;
    public ysTest: Tensor<Rank.R2> | null = null;


    async load(dataType: DataType, {completed, progress}: LoadOpts = {
        completed: () => {
        },
        progress: (progress) => {
        }
    }) {
        const {xsUrl, ysUrl, numSamples} = DATA_META[dataType];
        let lastProgress = 0;
        const onProgressHandler = (bytes: number, totalBytes: number) => {
            const currentProgress = bytes * 100 / totalBytes;
            lastProgress = currentProgress > lastProgress ? lastProgress : currentProgress;
            progress(lastProgress);
        };

        const [xs, ys] = await Promise.all([
            fetchWithProgress(fetch(xsUrl), onProgressHandler, numSamples * 28 * 28),
            fetchWithProgress(fetch(ysUrl), onProgressHandler, numSamples * 10)
        ]);

        const [xsBuffer, ysBuffer] = await Promise.all([
            xs.arrayBuffer(),
            ys.arrayBuffer()
        ]);


        const xsTrainBuffer = xsBuffer.slice(0, numSamples * 0.9 * 28 * 28);
        const ysTrainBuffer = ysBuffer.slice(0, numSamples * 0.9 * 10);

        const xsTestBuffer = xsBuffer.slice(numSamples * 0.9 * 28 * 28);
        const ysTestBuffer = ysBuffer.slice(numSamples * 0.9 * 10);


        this.xsTrain = tf.tensor4d(new Uint8Array(xsTrainBuffer), [numSamples * 0.9, 28, 28, 1]).div<Tensor<Rank.R4>>(255);
        this.ysTrain = tf.tensor2d(new Uint8Array(ysTrainBuffer), [numSamples * 0.9, 10]);

        this.xsTest = tf.tensor4d(new Uint8Array(xsTestBuffer), [numSamples * 0.1, 28, 28, 1]).div<Tensor<Rank.R4>>(255);
        this.ysTest = tf.tensor2d(new Uint8Array(ysTestBuffer), [numSamples * 0.1, 10]);

        completed();
    }
}

export const dataFactory = new DataFactory();