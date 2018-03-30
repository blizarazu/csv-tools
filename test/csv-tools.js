var assert = require("assert");
var expect = require("chai").expect;
var csv = require("../index");

describe("CSV Tools", function() {
  describe('Parse CSV (first_name, last name\\n"Lois","Rivera") to JSON', function() {
    var testCsv, exportedJson, json;
    before(function(done) {
      testCsv = 'first_name, last name\n"Lois","Rivera"';
      expectedJson = JSON.parse('[{"first_name": "Lois","last name": "Rivera"}]');
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function(done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length('1');
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should have a first_name property with value Lois", function(done) {
      expect(json[0]).to.have.property('first_name').to.be.a('string').and.equal('Lois');
      done();
    });
    it("should correctly trim spaces in headers", function(done) {
      expect(json[0]).to.have.property('last name').to.be.a('string').and.equal('Rivera');
      done();
    });
    it("should convert the CSV to JSON", function(done) {
      expect(json).to.deep.equal(expectedJson);
      done();
    });
  });

  describe('Parse CSV using semicolon (;) as deilimiter to JSON', function() {
    var testCsv, exportedJson, json;
    before(function(done) {
      testCsv = 'first_name; last name\n"Lois";"Rivera"';
      expectedJson = JSON.parse('[{"first_name": "Lois","last name": "Rivera"}]');
      json = csv.toJSON(testCsv, ';');
      done();
    });
    it("should be an array with one JSON object", function(done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length('1');
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should have a first_name property with value Lois", function(done) {
      expect(json[0]).to.have.property('first_name').to.be.a('string').and.equal('Lois');
      done();
    });
    it("should correctly trim spaces in headers", function(done) {
      expect(json[0]).to.have.property('last name').to.be.a('string').and.equal('Rivera');
      done();
    });
    it("should convert the CSV to JSON", function(done) {
      expect(json).to.deep.equal(expectedJson);
      done();
    });
  });

  describe("Parse CSV with numbers", function() {
    var testCsv, json;
    before(function(done) {
      testCsv = 'integer,float,negative_integer,negative_float,string\n73,3.14,-1,-89.2,"404"';
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function(done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length('1');
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should contain an integer", function(done) {
      expect(json[0]).to.have.property('integer').to.be.a('Number').and.equal(73);
      done();
    });
    it("should contain a float", function(done) {
      expect(json[0]).to.have.property('float').to.be.a('Number').and.equal(3.14);
      done();
    });
    it("should contain a negative integer", function(done) {
      expect(json[0]).to.have.property('negative_integer').to.be.a('Number').and.equal(-1);
      done();
    });
    it("should contain a negative float", function(done) {
      expect(json[0]).to.have.property('negative_float').to.be.a('Number').and.equal(-89.2);
      done();
    });
    it("should contain a number as a string", function(done) {
      expect(json[0]).to.have.property('string').to.be.a('String').and.equal("404");
      done();
    });
  });

  describe("Parse CSV with booleans", function() {
    var testCsv, json;
    before(function(done) {
      testCsv = 'true,false,true_string,false_string\ntrue,false,"true","false"';
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function(done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length('1');
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should contain boolean values", function(done) {
      expect(json[0]).to.have.property('true').to.be.a('Boolean').and.equal(true);
      expect(json[0]).to.have.property('false').to.be.a('Boolean').and.equal(false);
      done();
    });
    it("should save quoted boolean values as string", function(done) {
      expect(json[0]).to.have.property('true_string').to.be.a('String').and.equal("true");
      expect(json[0]).to.have.property('false_string').to.be.a('String').and.equal("false");
      done();
    });
  });

  describe("Parse CSV with multiple value types", function() {
    var testCsv, json;
    before(function(done) {
      testCsv = '"string","integer","float","number as string",boolean\n"Lorem ipsum dolor sit amet",8,1.4,"-32",false';
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function(done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length('1');
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should correctly type properties", function(done) {
      expect(json[0]).to.have.property("string").to.be.a('String').and.equal("Lorem ipsum dolor sit amet");
      expect(json[0]).to.have.property("integer").to.be.a('Number').and.equal(8);
      expect(json[0]).to.have.property("float").to.be.a('Number').and.equal(1.4);
      expect(json[0]).to.have.property("number as string").to.be.a('String').and.equal("-32");
      expect(json[0]).to.have.property("boolean").to.be.a('Boolean').and.equal(false);
      done();
    });
  });

  describe("Subdocuments", function() {
    var testCsv, json;
    before(function(done) {
      testCsv = 'network,machine.id,machine.name,machine.ip\n"office",5,"SERVER01","10.0.0.4"';
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function(done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length('1');
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should contain a JSON subdocument", function() {
      expect(json[0]).to.have.property("machine").that.is.an('Object').that.deep.equals({"id": 5, "name": "SERVER01", "ip": "10.0.0.4"});
    });
  });

  describe("Complex CSV to JSON", function() {
    var testCsv, expectedJson;
    before(function(done) {
      testCsv = "a,b,c,d,e,f.a,f.b,f.c.a,f.c.b,g.a.b.c\n1,2,3,4,5,6,7,8,9,0\n11,12,13,14,15,16,17,,19,10\n21,22,23,24,25,26,27,28,,20\n31,32,33,34,35,36,37,38,39\n41,,43,44,45,46,47,48,49,40\n,52,53,54,55,56,57,58,59,50";
      expectedJson = JSON.parse('[{"a":1,"b":2,"c":3,"d":4,"e":5,"f":{"a":6,"b":7,"c":{"a":8,"b":9}},"g":{"a":{"b":{"c":0}}}},{"a":11,"b":12,"c":13,"d":14,"e":15,"f":{"a":16,"b":17,"c":{"b":19}},"g":{"a":{"b":{"c":10}}}},{"a":21,"b":22,"c":23,"d":24,"e":25,"f":{"a":26,"b":27,"c":{"a":28}},"g":{"a":{"b":{"c":20}}}},{"a":31,"b":32,"c":33,"d":34,"e":35,"f":{"a":36,"b":37,"c":{"a":38,"b":39}}},{"a":41,"c":43,"d":44,"e":45,"f":{"a":46,"b":47,"c":{"a":48,"b":49}},"g":{"a":{"b":{"c":40}}}},{"b":52,"c":53,"d":54,"e":55,"f":{"a":56,"b":57,"c":{"a":58,"b":59}},"g":{"a":{"b":{"c":50}}}}]');
      done();
    });
    it("should convert a complex CSV to JSON", function(done) {
      var json = csv.toJSON(testCsv);
      expect(json).to.deep.equal(expectedJson);
      done();
    });
  });

  describe("CSV with empty data to JSON", function() {
    var testCsv, expectedJson;
    before(function(done) {
      testCsv = 'a,b,c,d,f.a,f.b,g.a.b.c,e\n1,2,3,4,6,7,0,\n11,,13,14,,17,10,15\n21,22,23,24,26,27,20,25\n,32,33,34,36,37,30,35\n,,43,44,46,47,,';
      expectedJson = JSON.parse('[{"a":1,"b":2,"c":3,"d":4,"f":{"a":6,"b":7},"g":{"a":{"b":{"c":0}}}},{"a":11,"c":13,"d":14,"e":15,"f":{"b":17},"g":{"a":{"b":{"c":10}}}},{"a":21,"b":22,"c":23,"d":24,"e":25,"f":{"a":26,"b":27},"g":{"a":{"b":{"c":20}}}},{"b":32,"c":33,"d":34,"e":35,"f":{"a":36,"b":37},"g":{"a":{"b":{"c":30}}}},{"c":43,"d":44,"f":{"a":46,"b":47}}]');
      done();
    });
    it("should convert a complex CSV with empty data to JSON", function(done) {
      var json = csv.toJSON(testCsv);
      expect(json).to.deep.equal(expectedJson);
      done();
    });
  });

  describe("CSV file to JSON", function() {
    var testCsvFile, expectedJson;
    before(function(done) {
      testCsvFile = __dirname + "/data/test.csv";
      expectedJson = JSON.parse('[{"a":1,"b":2,"c":3,"d":4,"e":5,"f":{"a":6,"b":7,"c":{"a":8,"b":9}},"g":{"a":{"b":{"c":0}}}},{"a":11,"b":12,"c":13,"d":14,"e":15,"f":{"a":16,"b":17,"c":{"b":19}},"g":{"a":{"b":{"c":10}}}},{"a":21,"b":22,"c":23,"d":24,"e":25,"f":{"a":26,"b":27,"c":{"a":28}},"g":{"a":{"b":{"c":20}}}},{"a":31,"b":32,"c":33,"d":34,"e":35,"f":{"a":36,"b":37,"c":{"a":38,"b":39}}},{"a":41,"c":43,"d":44,"e":45,"f":{"a":46,"b":47,"c":{"a":48,"b":49}},"g":{"a":{"b":{"c":40}}}},{"b":52,"c":53,"d":54,"e":55,"f":{"a":56,"b":57,"c":{"a":58,"b":59}},"g":{"a":{"b":{"c":50}}}}]');
      done();
    });
    it("should convert a CSV file to JSON", function(done) {
      csv.fileToJSON(testCsvFile, function(json) {
        expect(json).to.deep.equal(expectedJson);
        done();
      });
    });
  });

  describe("CSV file using semicolon (;) as deilimiter to JSON", function() {
    var testCsvFile, expectedJson;
    before(function(done) {
      testCsvFile = __dirname + "/data/test_semicolon.csv";
      expectedJson = JSON.parse('[{"a":1,"b":2,"c":3,"d":4,"e":5,"f":{"a":6,"b":7,"c":{"a":8,"b":9}},"g":{"a":{"b":{"c":0}}}},{"a":11,"b":12,"c":13,"d":14,"e":15,"f":{"a":16,"b":17,"c":{"b":19}},"g":{"a":{"b":{"c":10}}}},{"a":21,"b":22,"c":23,"d":24,"e":25,"f":{"a":26,"b":27,"c":{"a":28}},"g":{"a":{"b":{"c":20}}}},{"a":31,"b":32,"c":33,"d":34,"e":35,"f":{"a":36,"b":37,"c":{"a":38,"b":39}}},{"a":41,"c":43,"d":44,"e":45,"f":{"a":46,"b":47,"c":{"a":48,"b":49}},"g":{"a":{"b":{"c":40}}}},{"b":52,"c":53,"d":54,"e":55,"f":{"a":56,"b":57,"c":{"a":58,"b":59}},"g":{"a":{"b":{"c":50}}}}]');
      done();
    });
    it("should convert a CSV file to JSON", function(done) {
      csv.fileToJSON(testCsvFile, ';', function(json) {
        expect(json).to.deep.equal(expectedJson);
        done();
      });
    });
  });

  describe("JSON to CSV", function() {
    var testJson, expectedCSV;
    before(function(done) {
      testJson = JSON.parse('[{"a":1,"b":2,"c":3,"d":4,"f":{"a":6,"b":7},"g":{"a":{"b":{"c":0}}}},{"a":11,"c":13,"d":14,"e":15,"f":{"b":17},"g":{"a":{"b":{"c":10}}}},{"a":21,"b":22,"c":23,"d":24,"e":25,"f":{"a":26,"b":27},"g":{"a":{"b":{"c":20}}}},{"b":32,"c":33,"d":34,"e":35,"f":{"a":36,"b":37},"g":{"a":{"b":{"c":30}}}},{"c":43,"d":44,"f":{"a":46,"b":47}}]');
      expectedCSV = 'a,b,c,d,f.a,f.b,g.a.b.c,e\n1,2,3,4,6,7,0,\n11,,13,14,,17,10,15\n21,22,23,24,26,27,20,25\n,32,33,34,36,37,30,35\n,,43,44,46,47,,';
      done();
    });
    it("should convert a JSON to CSV", function(done) {
      var parsedCsv = csv.fromJSON(testJson);
      expect(parsedCsv).to.deep.equal(expectedCSV);
      done();
    });
  });

  describe("JSON to CSV using semicolon (;) as delimiter", function() {
    var testJson, expectedCSV;
    before(function(done) {
      testJson = JSON.parse('[{"a":1,"b":2,"c":3,"d":4,"f":{"a":6,"b":7},"g":{"a":{"b":{"c":0}}}},{"a":11,"c":13,"d":14,"e":15,"f":{"b":17},"g":{"a":{"b":{"c":10}}}},{"a":21,"b":22,"c":23,"d":24,"e":25,"f":{"a":26,"b":27},"g":{"a":{"b":{"c":20}}}},{"b":32,"c":33,"d":34,"e":35,"f":{"a":36,"b":37},"g":{"a":{"b":{"c":30}}}},{"c":43,"d":44,"f":{"a":46,"b":47}}]');
      expectedCSV = 'a;b;c;d;f.a;f.b;g.a.b.c;e\n1;2;3;4;6;7;0;\n11;;13;14;;17;10;15\n21;22;23;24;26;27;20;25\n;32;33;34;36;37;30;35\n;;43;44;46;47;;';
      done();
    });
    it("should convert a JSON to CSV", function(done) {
      var parsedCsv = csv.fromJSON(testJson, ';');
      expect(parsedCsv).to.deep.equal(expectedCSV);
      done();
    });
  });
});
