import scrapeData from './tasks/scrapeData.js';
import findFeatures from './tasks/findFeatures.js';
import findPopulations from './tasks/findPopulations.js';
import writeData from './tasks/writeData.js';

async function generate(date, options = { findFeatures: true, findPopulations: true, writeData: true }) {
  if (date) {
    process.env['SCRAPE_DATE'] = date;
  }

  return scrapeData()
    .then(options.findFeatures && findFeatures)
    .then(options.findPopulations && findPopulations)
    .then(options.writeData && writeData);
}

export default generate;
