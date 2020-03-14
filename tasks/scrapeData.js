import yargs from 'yargs';
import scrapers from '../scrapers.js';
import * as transform from '../lib/transform.js';

/*
  Combine location information with the passed data object
*/
function addLocationToData(data, location) {
  Object.assign(data, location);

  for (let prop in data) {
    // Remove "private" fields
    if (prop[0] === '_') {
      delete data[prop];
    }
  }

  delete data.scraper;

  return data;
}

/*
    Check if the provided data contains any invalid fields
  */
function isValid(data, location) {
  if (data.cases === undefined) {
    throw new Error(`Invalid data: contains no case data`);
  }

  for (let [prop, value] of Object.entries(data)) {
    if (value === null) {
      throw new Error(`Invalid data: ${prop} is null`);
    }
    if (Number.isNaN(value)) {
      throw new Error(`Invalid data: ${prop} is not a number`);
    }
  }

  return true;
}

/*
    Clean the passed data
  */
function clean(data) {
  for (let [prop, value] of Object.entries(data)) {
    if (value === '') {
      delete data[prop];
    }
  }

  return data;
}

/*
    Add output data to the cases array. Input can be either an object or an array
  */
function addData(cases, location, result) {
  if (Array.isArray(result)) {
    if (result.length === 0) {
      throw new Error(`Invalid data: scraper for ${transform.getName(location)} returned 0 rows`);
    }
    for (let data of result) {
      if (isValid(data, location)) {
        cases.push(clean(addLocationToData(data, location)));
      }
    }
  } else {
    if (isValid(result, location)) {
      cases.push(clean(addLocationToData(result, location)));
    }
  }
}

/*
    Begin the scraping process
  */
async function scrape() {
  let errors = [];
  let locations = [];
  for (let location of scrapers) {
    if (location.scraper) {
      try {
        addData(locations, location, await location.scraper());
      } catch (err) {
        errors.push({
          country: location.country,
          state: location.state,
          county: location.county,
          url: location.url,
          err: err.toString()
        });
        console.error('  ❌ Error processing %s: ', location.county, err);
      }
    }
  }

  return { locations, errors };
}

/*
    Main
  */
async function scrapeData() {
  console.log('⏳ Scraping data...');

  const argv = yargs
    .option('date', {
      alias: 'd',
      description: 'Generate data for the provided date in YYYY-M-D format',
      type: 'string'
    })
    .help()
    .alias('help', 'h').argv;

  if (argv.date) {
    process.env['SCRAPE_DATE'] = argv.date;
  }

  let { locations, errors } = await scrape();

  let states = 0;
  let counties = 0;
  let countries = 0;
  for (let location of locations) {
    if (!location.state && !location.county) {
      countries++;
    } else if (!location.county) {
      states++;
    } else {
      counties++;
    }
  }

  console.log('✅ Data scraped!');
  console.log('   - %d countries', countries);
  console.log('   - %d states', states);
  console.log('   - %d counties', counties);

  const summary = {
    scrape: {
      countries,
      states,
      counties,
      numLocations: Object.keys(locations).length,
      errors
    }
  };

  return { locations, summary };
}

export default scrapeData;
