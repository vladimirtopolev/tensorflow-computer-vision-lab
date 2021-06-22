import {FC, useEffect, useState} from 'react';
import {DataFactory} from '../utils/DataFactory';
import * as tf from '@tensorflow/tfjs';
import {DrawTensor} from './DrawTensor';
import {Tensor, Rank} from '@tensorflow/tfjs';
import {Grid, makeStyles, Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import {CircularProgress} from '@material-ui/core';

type DataSamplesProps = {
    dataFactory: DataFactory
}

function isSampleFilled(map: { [key: number]: number }, maxCount: number): boolean {
    return Math.min(...Object.values(map)) === maxCount;
}

const useStyles = makeStyles({
    cell: {
        padding: 0
    }
});


type TableSampleProps = {
    samples: Array<[string, Tensor<Rank.R2>[]]>
}

const TableSamples: FC<TableSampleProps> = ({samples}) => {
    const classes = useStyles();
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell align="center">Class</TableCell>
                    <TableCell>Samples</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {samples.map(([key, images]) => (
                    <TableRow key={key}>
                        <TableCell className={classes.cell} align="center">{key}</TableCell>
                        <TableCell className={classes.cell}>
                            {images.map((image, i) => <DrawTensor key={i} width={28} height={28} tensor={image}/>)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
export const DataSamples: FC<DataSamplesProps> = ({dataFactory}) => {
    const [isLoading, setLoadingState] = useState(true);
    const [imageMap, setImageMap] = useState<{ [k: string]: Array<Tensor<Rank.R2>> }>({});

    const maxSamplePerClass = 18;

    async function prepareSamples() {
        const ys = Array.from(await dataFactory.ysTest!.argMax(1).data());
        const samplesPerClassMap: { [key: number]: number } =
            Array
                .from({length: 10})
                .reduce<{ [key: number]: number }>((memo, _, i) => ({...memo, [i]: 0}), {});

        const imageMap =
            Array
                .from({length: 10})
                .reduce<{ [key: number]: Array<Tensor<Rank.R2>> }>((memo, _, i) => ({
                    ...memo,
                    [i]: []
                }), {});

        let i = 0;
        while (i < ys.length && !isSampleFilled(samplesPerClassMap, maxSamplePerClass)) {
            tf.nextFrame();
            if (samplesPerClassMap[ys[i]] >= maxSamplePerClass) {
                i++;
                continue;
            }
            samplesPerClassMap[ys[i]] += 1;
            imageMap[ys[i]].push(dataFactory.xsTest!.slice([i, 0, 0, 0], [1, 28, 28, 1]).reshape([28, 28]));
            i++;
        }

        setImageMap(imageMap);
        setLoadingState(false);
    }

    useEffect(() => {
        prepareSamples();
    }, []);

    const splitTable = Math.ceil(10 / 2);

    return (
        <>
            {isLoading && 'Sample table is preparing'}
            {!isLoading && (
                <Grid container>
                    <Grid item xs={6}>
                        <TableSamples samples={Object.entries(imageMap).slice(0, splitTable)}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TableSamples samples={Object.entries(imageMap).slice(splitTable)}/>
                    </Grid>
                </Grid>
            )}
        </>
    );
};