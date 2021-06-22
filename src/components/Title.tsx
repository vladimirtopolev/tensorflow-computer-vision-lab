import {FC} from 'react';
import {Box, Typography, makeStyles} from '@material-ui/core';


const useStyles = makeStyles({
    root: {
        position: 'relative',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#818181',
        fontSize: 18,
        margin: '24px 0 12px 0',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: -24,
            display: 'block',
            height: '100%',
            width: 2,
            background: 'red'
        }
    },
});

export const Title: FC = ({children}) => {
    const classes = useStyles();
    return (
        <Box>
            <Typography variant="h4" className={classes.root}>{children}</Typography>
        </Box>
    );
};