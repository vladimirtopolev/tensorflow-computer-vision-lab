import React, {useEffect, useState} from 'react';
import {dataFactory, DataType, DataTypeLabels} from './utils/DataFactory';
import {
    Avatar,
    Box,
    Container,
    FormControl,
    Grid,
    InputLabel,
    makeStyles,
    MenuItem,
    Select,
    Typography
} from '@material-ui/core';
import {ModelDashboard} from './components/ModelDashboard';
import {MODEL_TYPE, modelFactory} from './utils/ModelFactory';
import {Title} from './components/Title';
import CheckIcon from '@material-ui/icons/Check';
import {CircularProgressWithLabel} from './components/CircularProgressWithLabel';
import {DataSamples} from './components/DataSamples';

const useStyles = makeStyles(theme => ({
    box: {
        display: 'flex',
        alignItems: 'center'
    },
    uploading: {
        marginRight: 8,
        background: theme.palette.warning.light
    },
    uploaded: {
        width: 30,
        height: 30,
        marginRight: 8,
        background: theme.palette.success.light
    },
    modelSection: {
        background: '#efefef',
        padding: 20,
        margin: theme.spacing(2, 0)
    }
}));

type DataUploadingStatus = {
    isUploading: boolean,
    progress: number
};


function App() {

    const classes = useStyles();

    const [{isUploading, progress}, setDataUploadingStatus] = useState<DataUploadingStatus>({
        isUploading: true,
        progress: 0
    });

    const [dataType, setDataType] = useState(DataType.MNIST);

    useEffect(() => {
        setDataUploadingStatus(() => ({isUploading: true, progress: 0}));
        dataFactory.load(dataType, {
            progress: (progress) => setDataUploadingStatus((prev) => ({...prev, progress})),
            completed: () => setDataUploadingStatus((prev) => ({...prev, isUploading: false}))
        });
    }, [dataType]);

    return (
        <Container>
            <Typography variant="h3">TensorFlow: Computer Vision</Typography>

            <Title>Description</Title>
            <Typography variant="body1">
                This examples lets you train a model which may classify images with resolution 28x28. It may
                be MNIST or FASHION MNIST data set. There are 2 ways to complete this task eather using
                Fully Connected Neural Network (also known as a DenseNet) or using a Convolutional Neural Network
                (also known as a ConvNet or CNN).
            </Typography>

            <Title>Data Set</Title>
            <Box>
                <FormControl variant="outlined">
                    <Select value={dataType}
                            onChange={(e) => setDataType(() => (e.target.value as DataType))}>
                        {Object.keys(DataType)
                            .filter(value => !isNaN(+value))
                            .map((key) => <MenuItem value={key}>{DataTypeLabels[key]}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
            <Title>Data Loading</Title>

            {isUploading ?
                (
                    <Box className={classes.box}>
                        <CircularProgressWithLabel value={progress}/> Data Loading...
                    </Box>
                )
                : (
                    <Box className={classes.box}>
                        <Avatar sizes="small" className={classes.uploaded}><CheckIcon/></Avatar> Data Loaded
                    </Box>
                )}

            {!isUploading && (
                <>
                    <Title>Data Samples</Title>
                    <DataSamples dataFactory={dataFactory}/>
                </>
            )}

            {!isUploading && (
                <>
                    <Title>Model Dashboard</Title>

                    <Box className={classes.modelSection}>
                        <Typography variant="h6">Fully connected network</Typography>
                        <ModelDashboard dataFactory={dataFactory}
                                        model={modelFactory.create(MODEL_TYPE.DENSE_MODEL)}/>
                    </Box>

                    <Box className={classes.modelSection}>
                        <Typography variant="h6">Convolutional Neural Network</Typography>
                        <ModelDashboard dataFactory={dataFactory}
                                        model={modelFactory.create(MODEL_TYPE.CONV_MODEL)}/>
                    </Box>

                </>)
            }
        </Container>);
}

export default App;
