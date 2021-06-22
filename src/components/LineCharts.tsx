import {FC, useEffect} from 'react';
import {CartesianGrid, Legend, Tooltip, XAxis, YAxis, LineChart, Line} from 'recharts';
import { CurveType } from 'recharts/types/shape/Curve';


type LineChartsProps = {
    width?: number,
    height?: number,
    xDataKey?: string,
    lines: {dataKey: string, type: CurveType, stroke: string}[],
    data: { [key: string]: number }[]
}
export const LineCharts: FC<LineChartsProps> =
    ({
         width = 300,
         height = 250,
         xDataKey = 'x',
         lines,
         data
     }) => {
        useEffect(() => {

        }, [data]);
        return (
            <LineChart
                width={width}
                height={height}
                data={data}
                margin={{top: 5}}
            >
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey={xDataKey}/>
                <YAxis/>
                {lines.map(line => <Line key={line.dataKey} {...line}/>)}
                <Tooltip/>
                <Legend verticalAlign="top" align="center"/>
            </LineChart>
        );
    };