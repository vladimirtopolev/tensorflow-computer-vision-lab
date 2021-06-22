import Box from '@material-ui/core/Box';
import {CircularProgress, CircularProgressProps, Typography} from '@material-ui/core';
import React, {FC} from 'react';

export const CircularProgressWithLabel: FC<CircularProgressProps & { value: number }> = (props) => {
    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress variant="determinate" {...props} />
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}