import papapaser, {ParseResult} from 'papaparse';
import path from 'path';
import fs from 'fs';

const file = fs.createReadStream(path.resolve(__dirname, './data/train-fashion-mnist .csv'));

const start = new Date().getTime();
let xsBuffer = Uint8Array.from([]);
let ysBuffer = Uint8Array.from([]);

let numSamples = 0;

papapaser.parse(file, {
    dynamicTyping: true,
    chunk(results: ParseResult<number[]>) {
        const {data} = results;
        const length = data.length;

        console.log(numSamples);
        for (let i = 0; i < length; i++) {
            const row = data[i];
            const labelArray = Array.from({length: 10}).map((_, i) => i === row[0] ? 1 : 0);
            row.splice(0, 1);
            const image = row;

            // xs
            const resultXs = new Uint8Array(xsBuffer.length + image.length);
            resultXs.set(xsBuffer);
            resultXs.set(Uint8Array.from(image), xsBuffer.length);
            xsBuffer = resultXs;

            // ys
            const resultYs = new Uint8Array(ysBuffer.length + 10);
            resultYs.set(ysBuffer);
            resultYs.set(Uint8Array.from(labelArray), ysBuffer.length);
            ysBuffer = resultYs;

            numSamples++;
        }
    },
    error(error, file?: File) {
        console.log(error);
    },
    complete() {
        const finish = new Date().getTime();
        fs.writeFile('./xs.bin', xsBuffer, (err) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('Success write for xs');
        });
        fs.writeFile('./ys.bin', ysBuffer, (err) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('Success write for ys');
        });
        console.log(finish - start, 'ms', numSamples);
    }
});
