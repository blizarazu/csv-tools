var csv = require('..');

var csvData = "first_name,last_name,gender\nDennis,Anderson,Male\nPeter,Hicks,Male";

var json = csv.toJSON(csvData);

console.log(JSON.stringify(json, null, 2));
