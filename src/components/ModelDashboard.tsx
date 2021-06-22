import React, {FC, useEffect, useState} from 'react';
import {DataFactory} from '../utils/DataFactory';
import {Box, Button, makeStyles} from '@material-ui/core';
import {Model} from '../utils/ModelFactory';
import {Tensor, Scalar} from '@tensorflow/tfjs';
import * as tf from '@tensorflow/tfjs';
import {ConfusionMatrix} from './ConfusionMatrixView';
import {DataPredictions} from './DataPredictions';
import {LineCharts} from './LineCharts';

type ModelDashboardProps = {
    dataFactory: DataFactory,
    model: Model
}

function initConfusionMatrix(length: number): number[][] {
    return Array.from<number[]>({length}).map(() => Array.from<number>({length}).fill(0));
}

const useStyles = makeStyles((theme) => ({
    trainingLog: {
        margin: theme.spacing(2, 0)
    },
    content: {
        display: 'flex',
        alignItems: 'flex-start'
    },
    section: {
        padding: theme.spacing(2)
    },
    button: {
        marginRight: theme.spacing(1)
    }
}));

export const ModelDashboard: FC<ModelDashboardProps> = ({dataFactory, model}) => {

    const classes = useStyles();

    const [trainInProgress, setTrainProgress] = useState(false);
    const [{trainBatchCount, totalNumBatches}, setTrainState] = useState<{ trainBatchCount: number, totalNumBatches: number }>({
        trainBatchCount: 0,
        totalNumBatches: 0
    });

    const [{loss, acc}, setModelState] = useState<{ loss: number, acc: number }>({
        loss: 0,
        acc: 0
    });

    const [expectedLabels] = useState<number[]>(() => Array.from(dataFactory.ysTest!.argMax(1).dataSync()));
    const [predictedLabels, setPredictedLables] = useState<number[]>([]);

    const [matrix, setMatrix] = useState(() => initConfusionMatrix(10));

    // after each batch we use model against test set
    // to evaluate model precise
    useEffect(() => {
        tf.tidy(() => {
            const ysPredicted = model.get().predict(dataFactory.xsTest!) as Tensor;
            setPredictedLables(Array.from(ysPredicted.argMax(1).dataSync()));
        });
    }, [trainBatchCount]);

    const [isStopped, setStoppedState] = useState(true);
    const [startTime, setStartTime] = useState(0);
    const [stopTime, setStopTime] = useState(0);

    // calculate confusion matrix
    useEffect(() => {
        const confusionMatrix = initConfusionMatrix(10);

        for (let i = 0; i < predictedLabels.length; i++) {
            confusionMatrix[expectedLabels[i]][predictedLabels[i]] += 1;
        }
        setMatrix(() => confusionMatrix);
    }, [predictedLabels]);

    const [metric, setMetric] = useState<any[]>([]);


    return (
        <Box>
            <Button
                disabled={!isStopped}
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={() => {
                    setTrainProgress(() => true);
                    setStoppedState(() => false);
                    setStartTime(new Date().getTime())
                    model.train({xs: dataFactory.xsTrain, ys: dataFactory.ysTrain}, {
                        onIteration: async (batch, totalNumBatches, logs) => {
                            // the first scalar is loss; the second scalar - accarucy
                            const evaluation = await model.get().evaluate(dataFactory.xsTest!, dataFactory!.ysTest!) as Scalar[];
                            setMetric((prev) => ([...prev, {
                                batch,
                                trainLoss: logs!.loss,
                                validationLoss: evaluation[0].dataSync()
                            }]));
                            setTrainState((prev) => ({
                                ...prev,
                                trainBatchCount: batch,
                                totalNumBatches
                            }));
                            setModelState((prev) => ({
                                ...prev,
                                loss: logs!.loss,
                                acc: logs!.acc
                            }));
                        },
                        onTrainEnd: () => {
                            setStoppedState(() => true);
                            setStopTime(new Date().getTime())
                        }
                    });
                }}>
                Start Train
            </Button>
            <Button
                disabled={isStopped}
                variant="contained"
                color="secondary"
                className={classes.button}
                onClick={() => {
                    setStoppedState(() => true);
                    setStopTime(new Date().getTime())
                    model.stop();
                }}
            >
                Stop
            </Button>

            {trainInProgress && (
                <Box className={classes.trainingLog}>
                    <div>Training... ({(trainBatchCount / totalNumBatches * 100).toFixed(1)}% complete)</div>
                    <div>Loss: {loss.toFixed(3)}; Accarucy: {acc.toFixed(3)}</div>
                    {isStopped && <div>Learning time: {stopTime - startTime} ms</div>}
                </Box>
            )}
            {trainInProgress && (
                <Box className={classes.content}>
                    <Box className={classes.section}>
                        <LineCharts
                            height={270}
                            data={metric}
                            lines={[
                                {
                                    dataKey: 'trainLoss',
                                    type: 'monotone',
                                    stroke: 'red'
                                },
                                {
                                    dataKey: 'validationLoss',
                                    type: 'monotone',
                                    stroke: 'green'
                                }
                            ]}
                            xDataKey={'batch'}
                        />
                    </Box>
                    <Box className={classes.section}>
                        <ConfusionMatrix size={250} matrix={matrix}/>
                    </Box>
                    <Box className={classes.section} mt={2}>
                        <DataPredictions
                            images={dataFactory.xsTest!.slice([0, 0, 0, 0], [55, 28, 28, 1])}
                            expectedLabels={expectedLabels.slice(0, 55)}
                            predictedLabels={predictedLabels.slice(0, 55)}/>
                    </Box>
                </Box>
            )}
        </Box>
    );
};