import {Rank, Tensor} from '@tensorflow/tfjs';
import * as tf from '@tensorflow/tfjs';
import {FC, useEffect} from 'react';
import {useState} from 'react';
import {Box, makeStyles} from '@material-ui/core';
import {DrawTensor} from './DrawTensor';

type DataPredictionsProps = {
    images: Tensor<Rank.R4>,
    expectedLabels: number[],
    predictedLabels: number[],
}

const useStyles = makeStyles({
    rightPrediction: {
        background: 'green'
    },
    wrongPrediction: {
        background: 'red'
    },
    drawTensor:{
        display: 'flex',
        justifyContent: 'center'
    }
});

export const DataPredictions: FC<DataPredictionsProps> = ({images, predictedLabels, expectedLabels}) => {

    const classes = useStyles();

    return (
        <Box style={{display: 'flex', flexWrap: 'wrap'}}>
            {predictedLabels.map((val, i) => {
                return (
                    <div key={i}
                         className={val === expectedLabels[i] ? classes.rightPrediction : classes.wrongPrediction}>
                        <div>Pred: {val}</div>
                        <div className={classes.drawTensor}>
                            <DrawTensor
                                width={35}
                                height={35}
                                tensor={images.slice([i, 0, 0, 0], [1, 28, 28, 1]).reshape<Tensor<Rank.R2>>([28, 28])}
                            />
                        </div>
                    </div>
                );
            })}

        </Box>
    );
};