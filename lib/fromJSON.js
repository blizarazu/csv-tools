jsonArrayToCsv = function(jsonArray, delimiter) {
  if(!jsonArray || jsonArray.length <= 0) throw new Error("The array must contain at least one JSON object");

  delimiter = delimiter || ',';

  var data = [];
  var headers = [];
  for(var i in jsonArray) {
    var jsonObject = jsonArray[i];
    data[i] = [];
    for(var prop in jsonObject) {
      var headerArray = [];
      propToHeader(jsonObject[prop], prop, headerArray, data[i]);
      for(var j in headerArray) {
        var header = headerArray[j];
        if(headers.indexOf(header) == -1) headers.push(header);
      }
    }
  }

  result = headers.join(delimiter) + "\n";
  for(var z = 0; z < data.length; z++) {
    var row = "";
    for(var k = 0; k < headers.length; k++) {
      var key = headers[k];
      var value = data[z][key];
      if(k > 0) row += delimiter;
      if(value !== undefined && value !== null) {
        if(typeof value == "string") value = '"' + value + '"';
        row += value;
      }
    }
    result += row;
    if(z < data.length-1)
      result += "\n";
  }

  return result;
};

propToHeader = function(jsonObject, parents, headerArray, dataArray) {
  if(typeof jsonObject !== "object") {
    headerArray.push(parents);
    dataArray[parents] = jsonObject;
  } else {
    for(var p in jsonObject) {
      propToHeader(jsonObject[p], parents + "." + p, headerArray, dataArray);
    }
  }
};

module.exports = jsonArrayToCsv;
