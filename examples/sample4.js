var csv = require('..');

var jsonArray = [
  {
    "age": 21,
    "name": {
      "first": "Sylvia",
      "last": "Mcfarland"
    },
    "company": "AMRIL",
    "phone": "+1 (919) 503-3392",
    "address": "974 Strickland Avenue, Johnsonburg, North Dakota, 3762"
  },
  {
    "age": 21,
    "name": {
      "first": "Adkins",
      "last": "Becker"
    },
    "company": "COMTREK",
    "phone": "+1 (938) 564-3477",
    "address": "121 Hunts Lane, Williamson, Pennsylvania, 9889"
  }
];

var csvData = csv.fromJSON(jsonArray);

console.log(csvData);
