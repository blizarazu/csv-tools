var csv = require("..");

var csvData = "device,owner.name.first,owner.name.last,owner.gender\n94-0B-05-0E-E9-35,Pamela,Hart,Female\n69-71-86-FD-B1-24,Karen,Pierce,Female";

var json = csv.toJSON(csvData);

console.log(JSON.stringify(json,null,2));
