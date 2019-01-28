const csv = require('..');

const file = "data.csv";

fs.readFile(file, "utf8", function (err, csv) {
  if (err) console.error(err);

  const json = csvToJson(csv);
  console.log(JSON.stringify(json, null, 2));
});
