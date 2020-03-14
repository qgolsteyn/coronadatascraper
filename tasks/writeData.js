import path from 'path';
import csvStringify from 'csv-stringify';
import * as fs from '../lib/fs.js';

/*
    Generate a CSV from the given data
*/
function generateCSV(data) {
  return new Promise((resolve, reject) => {
    // Start with the columns we want first
    let columns = ['city', 'county', 'state', 'country', 'cases', 'deaths', 'recovered', 'tested', 'lat', 'long', 'url'];

    // Get list of columns
    for (let location of data) {
      for (let column in location) {
        if (columns.indexOf(column) === -1) {
          columns.push(column);
        }
      }
    }

    // Drop coordinates
    columns = columns.filter(column => column != 'coordinates');

    // Turn data into arrays
    let csvData = [columns];
    for (let location of data) {
      let row = [];
      for (let column of columns) {
        // Output lat and long instead
        if (column === 'lat' && location.coordinates) {
          row.push(location.coordinates[1]);
        } else if (column === 'long' && location.coordinates) {
          row.push(location.coordinates[0]);
        } else {
          row.push(location[column]);
        }
      }
      csvData.push(row);
    }

    csvStringify(csvData, (err, output) => {
      if (err) {
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
}

async function writeData({ locations, featureCollection, summary }) {
  let date = process.env['SCRAPE_DATE'] ? '-' + process.env['SCRAPE_DATE'] : '';

  await fs.ensureDir('dist');

  await fs.writeFile(path.join('dist', `data${date}.json`), JSON.stringify(locations, null, 2));

  let csvString = await generateCSV(locations);

  await fs.writeFile(path.join('dist', `data${date}.csv`), csvString);

  await fs.writeJSON(path.join('dist', `features${date}.json`), featureCollection);

  await fs.writeJSON(path.join('dist', 'summary.json'), summary);

  return { locations, featureCollection, summary };
}

export default writeData;
