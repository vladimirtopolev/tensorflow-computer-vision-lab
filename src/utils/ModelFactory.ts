import * as tf from '@tensorflow/tfjs';
import {Logs, Sequential} from '@tensorflow/tfjs';
import {Tensor, Rank} from '@tensorflow/tfjs';

export enum MODEL_TYPE {
    CONV_MODEL,
    DENSE_MODEL
}

type TrainOptions = {
    onStartTrain?: () => void;
    trainEpoch?: number;
    onIteration?: (batch: number, totalNumBatches: number, logs?: Logs) => void,
    onBatchEnd?: (trainBatchCount: number, totalNumBatches: number) => void,
    onEpochEnd?: (logs: any) => void,
    onTrainEnd?: () => void
}

type ModelConstructorProps = {
    height: number,
    width: number
}

export class Model {
    protected model: Sequential | null = null;
    private trainInProgress = false;
    private stopTraining = false;

    async train(
        {xs, ys}: { xs: Tensor<Rank.R4> | null, ys: Tensor<Rank.R2> | null },
        {onStartTrain, trainEpoch, onBatchEnd, onEpochEnd, onIteration, onTrainEnd}: TrainOptions
    ) {
        if (!this.model || !xs || !ys) {
            throw new Error('Invalid data fro train model');
        }

        onStartTrain && onStartTrain();

        this.model.compile({
            optimizer: 'rmsprop',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });

        let trainBatchCount = 0;
        const batchSize = 320;
        const validationSplit = 0.15;
        const totalNumBatches = Math.ceil(xs.shape[0] * (1 - validationSplit) / batchSize) * 3;

        this.trainInProgress = true;
        this.stopTraining = false;
        await this.model.fit(xs, ys, {
            batchSize,
            validationSplit,
            epochs: 3,
            callbacks: {
                onBatchBegin: () => {
                    this.model!.stopTraining = this.stopTraining;
                },
                onBatchEnd: async (batch, logs) => {
                    trainBatchCount++;
                    onBatchEnd && onBatchEnd(trainBatchCount, totalNumBatches);
                    onIteration && batch % 10 === 0 && await onIteration(trainBatchCount, totalNumBatches, logs);
                    await tf.nextFrame();
                },
                onEpochEnd: async (epoch, logs) => {
                    onEpochEnd && onEpochEnd(logs);
                    onIteration && await onIteration(trainBatchCount, totalNumBatches, logs);
                    await tf.nextFrame();
                },
                onTrainEnd: () => {
                    this.trainInProgress = false;
                    onTrainEnd && onTrainEnd();
                }
            }
        });
    }

    get(): Sequential {
        return this.model!;
    }

    stop() {
        this.stopTraining = true;
        this.trainInProgress = false;
    }

    isStopped(){
        return this.stopTraining;
    }
}

export class ConvModel extends Model {
    constructor({height, width}: ModelConstructorProps) {
        super();
        this.model = tf.sequential({
            layers: [
                tf.layers.conv2d({
                    inputShape: [height, width, 1],
                    kernelSize: 3,
                    filters: 16,
                    activation: 'relu'
                }),
                tf.layers.maxPooling2d({poolSize: 2, strides: 2}),
                tf.layers.conv2d({kernelSize: 3, filters: 32, activation: 'relu'}),
                tf.layers.maxPooling2d({poolSize: 2, strides: 2}),
                tf.layers.conv2d({kernelSize: 3, filters: 32, activation: 'relu'}),
                tf.layers.flatten({}),
                tf.layers.dense({units: 64, activation: 'relu'}),
                tf.layers.dense({units: 10, activation: 'softmax'})
            ]
        });
    }
}

export class DenseModel extends Model {
    constructor({height, width}: ModelConstructorProps) {
        super();
        this.model = tf.sequential({
            layers: [
                tf.layers.flatten({inputShape: [height, width, 1]}),
                tf.layers.dense({units: 42, activation: 'relu'}),
                tf.layers.dense({units: 10, activation: 'softmax'})
            ]
        });
    }
}

export class ModelFactory {
    public create(modelType: MODEL_TYPE, options = {height: 28, width: 28}): Model {
        switch (modelType) {
            case MODEL_TYPE.CONV_MODEL:
                return new ConvModel(options);
            case MODEL_TYPE.DENSE_MODEL:
                return new DenseModel(options);
            default:
                throw new Error(`Not supported model type ${modelType}`);
        }
    }
}

export const modelFactory = new ModelFactory();