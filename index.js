import scrapeData from './tasks/scrapeData.js';
import findFeatures from './tasks/findFeatures.js';
import findPopulations from './tasks/findPopulations.js';
import writeData from './tasks/writeData.js';

scrapeData()
  .then(findFeatures)
  .then(findPopulations)
  .then(writeData);
