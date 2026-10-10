# CSV Tools
Node module to convert CSV to JSON and JSON to CSV.

[![Build Status](https://travis-ci.org/blizarazu/csv-tools.svg?branch=master)](https://travis-ci.org/blizarazu/csv-tools)

CSV Tools converts CSV text to JavaScript objects and JSON-compatible data back to CSV. Nested object paths use dotted headers, such as `owner.name.first`.

This library provides two public methods:
- [__toJSON(csvData[, delimiter][, options])__](#csvtojsoncsvdata-delimiter-options): Converts csvData to JSON.
- [__fromJSON(jsonArray[, delimiter])__](#csvfromjsonjsonarray-delimiter): Converts JSON to CSV.

## CSV to JSON
CSV Tools parses CSV text into an array of objects. The CSV's first row must contain headers; each header names the corresponding JSON property.

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

#### csv.toJSON(csvData[, delimiter][, options])
- `csvData` [&lt;string&gt;]
- `delimiter` [&lt;string&gt;] __Default:__ `,`
- `options` [&lt;Object&gt;]
  - `delimiter` [&lt;string&gt;] __Default:__ `,` (when options is the second argument)
  - `preserveHeaderSpaces` [&lt;boolean&gt;] __Default:__ `false`
  - `preserveValueSpaces` [&lt;boolean&gt;] __Default:__ `false`
  - `strict` [&lt;boolean&gt;] __Default:__ `false`
- Returns: [&lt;Object&gt;] An array of objects with the data in the CSV string

Convert `csvData` to JSON.

`delimiter` refers to the character used to separate CSV columns. Comma (,) by default.
Header names and values are trimmed by default. Use the preservation options to retain their leading and trailing spaces.
Set `strict` to `true` to validate RFC 4180 input. Invalid input throws `csv.CsvParseError`, which has `line` and `column` properties; strict mode preserves whitespace.
```
var csv = require('csv-tools');

var csvData = "first_name,last_name,gender\nDennis,Anderson,Male\nPeter,Hicks,Male";

var json = csv.toJSON(csvData);

console.log(JSON.stringify(json, null, 2));

var strictJson = csv.toJSON('first,last\r\n"Ada","Lovelace"', { strict: true });
```

#### csv.fromJSON(jsonArray[, delimiter])
- `jsonArray` [&lt;Array&gt;]
- `delimiter` [&lt;string&gt;] __Default:__ `,`
- Returns: [&lt;string&gt;] A string in CSV format

Convert `jsonArray` to CSV.

`delimiter` refers to the character used to separate CSV columns. Comma (,) by default. Output records use `CRLF` (`\r\n`) line endings.
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
