# CSV Tools
Node module to convert CSV to JSON and JSON to CSV.

[![Build Status](https://travis-ci.org/blizarazu/csv-tools.svg?branch=master)](https://travis-ci.org/blizarazu/csv-tools)

CSV Tools does a great job exporting and importing data. Javascript objects can easily be exported to CSV, a format that non-programmers can easily understand and modify. On the other hand, CSV data can be imported into your appliation using CSV Tools and easily use that data as JSON objects.

This libraries provides 3 methods:
- [__toJSON(csvData[, delimiter])__](#csvtojsoncsvdata-delimiter): Converts csvData to JSON.
- [__fileToJSON(csvFilePath[, delimiter], callback)__](#csvfiletojsoncsvfilepath-delimiter-callback): Converts the content of the file in csvFilePath and calls the callback function and passes the resulting JSON as an argument of the callback.
- [__fromJSON(jsonArray[, delimiter])__](#csvfromjsonjsonarray-delimiter): Converts JSON to CSV.

## CSV to JSON
CSV Tools can parse any CSV file or string to an array of JSONs. The CVS's first row must contain the headers and the JSON properties will be named as the header for the corresponding column.

For example, the following CSV:
```
first_name,last_name,gender
Dennis,Anderson,Male
Peter,Hicks,Male
```
will be converted into:
```
[
  {
    "first_name": "Dennis",
    "last_name": "Anderson",
    "gender": "Male"
  },
  {
    "first_name": "Peter",
    "last_name": "Hicks",
    "gender": "Male"
  }
]

```

A dot (.) in a header will create a subdocument. For example:
```
device,owner.name.first,owner.name.last,owner.gender
94-0B-05-0E-E9-35,Pamela,Hart,Female
69-71-86-FD-B1-24,Karen,Pierce,Female
```
will be converted into:
```
[
  {
    "device": "94-0B-05-0E-E9-35",
    "owner": {
      "name": {
        "first": "Pamela",
        "last": "Hart"
      },
      "gender": "Female"
    }
  },
  {
    "device": "69-71-86-FD-B1-24",
    "owner": {
      "name": {
        "first": "Karen",
        "last": "Pierce"
      },
      "gender": "Female"
    }
  }
]
```

## JSON to CSV
In the same way, JSONs can be converted into CSV. The properties will be stored as headers in the first row of the CSV. If the JSON has subdocuments, its properties will be attached to the corresponding header with a dot between the parent property and its children. For example:
```
[
  {
    "age": 21,
    "name": {
      "first": "Sylvia",
      "last": "Mcfarland"
    },
    "company": "AMRIL",
    "phone": "+1 (919) 503-3392"
  },
  {
    "age": 21,
    "name": {
      "first": "Adkins",
      "last": "Becker"
    },
    "company": "COMTREK",
    "phone": "+1 (938) 564-3477"
  }
]
```
will be converted into:
```
age,name.first,name.last,company,phone
21,"Sylvia","Mcfarland","AMRIL","+1 (919) 503-3392"
21,"Adkins","Becker","COMTREK","+1 (938) 564-3477"
```

If any of the objects in the array does not have a property, that value will be empty in the resulting CSV.

Input:
```
[
  {
    "age": 21,
    "phone": "+1 (919) 503-3392",
    "name": "Sylvia Mcfarland"
  },
  {
    "age": 34,
    "name": "Adkins Becker",
  }
]
```

Output:
```
age,phone,name
21,"+1 (919) 503-3392","Sylvia Mcfarland"
34,,"Adkins Becker"
```

## Install

```
$ npm install csv-tools
```

## Usage
To use this module:
```
var csv = require('csv-tools');
```

#### csv.toJSON(csvData[, delimiter])
- `csvData` [&lt;string&gt;]
- `delimiter` [&lt;string&gt;] __Default:__ `,`
- Returns: [&lt;Object&gt;] A JSON object with the data in the CVS string

Convert `csvData` to JSON.

`delimiter` refers to the character used to separate CVS columns. Comma (,) by default.
```
var csv = require('csv-tools');

var csvData = "first_name,last_name,gender\nDennis,Anderson,Male\nPeter,Hicks,Male";

var json = csv.toJSON(csvData);

console.log(JSON.stringify(json, null, 2));
```

#### csv.fileToJSON(csvFilePath[, delimiter], callback)
- `csvFilePath` [&lt;string&gt;]
- `delimiter` [&lt;string&gt;] __Default:__ `,`
- `callback` [&lt;Function&gt;]
 - `data` [&lt;Object&gt;] A JSON object with the data in the CVS file

Convert the CSV file in `csvFilePath` to JSON. The callback gets one argument `(data)` where `data` is a JSON with the data in the CSV file.

`delimiter` refers to the character used to separate CVS columns. Comma (,) by default.
```
var csv = require('csv-tools');

var file = "data.csv";

csv.fileToJSON(file, function(json) {
  console.log(JSON.stringify(json,null,2));
});
```

#### csv.fromJSON(jsonArray[, delimiter])
- `jsonArray` [&lt;Array&gt;]
- `delimiter` [&lt;string&gt;] __Default:__ `,`
- Returns: [&lt;string&gt;] A string in CVS format

Convert `jsonArray` to CSV.

`delimiter` refers to the character used to separate CVS columns. Comma (,) by default.
```
var csv = require('csv-tools');

var jsonArray = [
  {
    "first_name": "Dennis",
    "last_name": "Anderson",
    "gender": "Male"
  },
  {
    "first_name": "Peter",
    "last_name": "Hicks",
    "gender": "Male"
  }
];

var csvData = csv.fromJSON(jsonArray);

console.log(csvData);
```

[&lt;string&gt;]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[&lt;Object&gt;]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[&lt;Array&gt;]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[&lt;Function&gt;]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
