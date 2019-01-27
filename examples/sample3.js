const csv = require('..');

const file = "data.csv";

csv.fileToJSON(file)
  .then((json) => console.log(JSON.stringify(json, null, 2)))
  .catch(error => console.error(error));
