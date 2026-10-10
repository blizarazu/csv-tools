import { expect } from 'chai';
import * as csv from '../lib/index';
import { CsvParseError } from '../lib/index';

describe("CSV Tools", function () {
  describe('Parse CSV (first_name, last name\\n"Lois","Rivera") to JSON', function () {
    let testCsv: string, json: any[], expectedJson: any[];
    before(function (done) {
      testCsv = 'first_name, last name\n"Lois","Rivera"';
      expectedJson = JSON.parse('[{"first_name": "Lois","last name": "Rivera"}]');
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function (done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length(1);
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should have a first_name property with value Lois", function (done) {
      expect(json[0]).to.have.property('first_name').to.be.a('string').and.equal('Lois');
      done();
    });
    it("should trim spaces in headers by default", function (done) {
      expect(json[0]).to.have.property('last name').to.be.a('string').and.equal('Rivera');
      done();
    });
    it("should convert the CSV to JSON", function (done) {
      expect(json).to.deep.equal(expectedJson);
      done();
    });
  });

  describe('Parse CSV using semicolon (;) as deilimiter to JSON', function () {
    let testCsv: string, json: any[], expectedJson: any[];
    before(function (done) {
      testCsv = 'first_name; last name\n"Lois";"Rivera"';
      expectedJson = JSON.parse('[{"first_name": "Lois","last name": "Rivera"}]');
      json = csv.toJSON(testCsv, ';');
      done();
    });
    it("should be an array with one JSON object", function (done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length(1);
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should have a first_name property with value Lois", function (done) {
      expect(json[0]).to.have.property('first_name').to.be.a('string').and.equal('Lois');
      done();
    });
    it("should trim spaces in headers by default", function (done) {
      expect(json[0]).to.have.property('last name').to.be.a('string').and.equal('Rivera');
      done();
    });
    it("should convert the CSV to JSON", function (done) {
      expect(json).to.deep.equal(expectedJson);
      done();
    });
  });

  describe("Parse CSV with numbers", function () {
    let testCsv: string, json: any[];
    before(function (done) {
      testCsv = 'integer,float,negative_integer,negative_float,string\n73,3.14,-1,-89.2,"404"';
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function (done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length(1);
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should contain an integer", function (done) {
      expect(json[0]).to.have.property('integer').to.be.a('Number').and.equal(73);
      done();
    });
    it("should contain a float", function (done) {
      expect(json[0]).to.have.property('float').to.be.a('Number').and.equal(3.14);
      done();
    });
    it("should contain a negative integer", function (done) {
      expect(json[0]).to.have.property('negative_integer').to.be.a('Number').and.equal(-1);
      done();
    });
    it("should contain a negative float", function (done) {
      expect(json[0]).to.have.property('negative_float').to.be.a('Number').and.equal(-89.2);
      done();
    });
    it("should contain a number as a string", function (done) {
      expect(json[0]).to.have.property('string').to.be.a('String').and.equal("404");
      done();
    });
  });

  describe("Parse CSV with booleans", function () {
    let testCsv: string, json: any[];
    before(function (done) {
      testCsv = 'true,false,true_string,false_string\ntrue,false,"true","false"';
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function (done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length(1);
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should contain boolean values", function (done) {
      expect(json[0]).to.have.property('true').to.be.a('Boolean').and.equal(true);
      expect(json[0]).to.have.property('false').to.be.a('Boolean').and.equal(false);
      done();
    });
    it("should save quoted boolean values as string", function (done) {
      expect(json[0]).to.have.property('true_string').to.be.a('String').and.equal("true");
      expect(json[0]).to.have.property('false_string').to.be.a('String').and.equal("false");
      done();
    });
  });

  describe("Parse complex CSV with booleans", function () {
    let testCsv: string, json: any[];
    before(function (done) {
      testCsv = 'true.false,false.true,true.true_string,false.false_string\ntrue,false,"true","false"';
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function (done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length(1);
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should contain boolean values", function (done) {
      expect(json[0]).to.have.property('true').that.is.an('object').to.have.property('false').to.be.a('Boolean').and.equal(true);
      expect(json[0]).to.have.property('false').that.is.an('object').to.have.property('true').to.be.a('Boolean').and.equal(false);
      done();
    });
    it("should save quoted boolean values as string", function (done) {
      expect(json[0]).to.have.property('true').that.is.an('object').to.have.property('true_string').to.be.a('String').and.equal("true");
      expect(json[0]).to.have.property('false').that.is.an('object').to.have.property('false_string').to.be.a('String').and.equal("false");
      done();
    });
  });

  describe("Parse CSV with multiple value types", function () {
    let testCsv: string, json: any[];
    before(function (done) {
      testCsv = '"string","integer","float","number as string",boolean\n"Lorem ipsum dolor sit amet",8,1.4,"-32",false';
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function (done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length(1);
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should correctly type properties", function (done) {
      expect(json[0]).to.have.property("string").to.be.a('String').and.equal("Lorem ipsum dolor sit amet");
      expect(json[0]).to.have.property("integer").to.be.a('Number').and.equal(8);
      expect(json[0]).to.have.property("float").to.be.a('Number').and.equal(1.4);
      expect(json[0]).to.have.property("number as string").to.be.a('String').and.equal("-32");
      expect(json[0]).to.have.property("boolean").to.be.a('Boolean').and.equal(false);
      done();
    });
  });

  describe("Subdocuments", function () {
    let testCsv: string, json: any[];
    before(function (done) {
      testCsv = 'network,machine.id,machine.name,machine.ip\n"office",5,"SERVER01","10.0.0.4"';
      json = csv.toJSON(testCsv);
      done();
    });
    it("should be an array with one JSON object", function (done) {
      expect(json).to.be.an('array');
      expect(json).to.have.length(1);
      expect(json[0]).to.be.an('object');
      done();
    });
    it("should contain a JSON subdocument", function () {
      expect(json[0]).to.have.property("machine").that.is.an('Object').that.deep.equals({ "id": 5, "name": "SERVER01", "ip": "10.0.0.4" });
    });
  });

  describe("Complex CSV to JSON", function () {
    let testCsv: string, expectedJson: any[];
    before(function (done) {
      testCsv = "a,b,c,d,e,f.a,f.b,f.c.a,f.c.b,g.a.b.c\n1,2,3,4,5,6,7,8,9,0\n11,12,13,14,15,16,17,,19,10\n21,22,23,24,25,26,27,28,,20\n31,32,33,34,35,36,37,38,39\n41,,43,44,45,46,47,48,49,40\n,52,53,54,55,56,57,58,59,50";
      expectedJson = JSON.parse('[{"a":1,"b":2,"c":3,"d":4,"e":5,"f":{"a":6,"b":7,"c":{"a":8,"b":9}},"g":{"a":{"b":{"c":0}}}},{"a":11,"b":12,"c":13,"d":14,"e":15,"f":{"a":16,"b":17,"c":{"b":19}},"g":{"a":{"b":{"c":10}}}},{"a":21,"b":22,"c":23,"d":24,"e":25,"f":{"a":26,"b":27,"c":{"a":28}},"g":{"a":{"b":{"c":20}}}},{"a":31,"b":32,"c":33,"d":34,"e":35,"f":{"a":36,"b":37,"c":{"a":38,"b":39}}},{"a":41,"c":43,"d":44,"e":45,"f":{"a":46,"b":47,"c":{"a":48,"b":49}},"g":{"a":{"b":{"c":40}}}},{"b":52,"c":53,"d":54,"e":55,"f":{"a":56,"b":57,"c":{"a":58,"b":59}},"g":{"a":{"b":{"c":50}}}}]');
      done();
    });
    it("should convert a complex CSV to JSON", function (done) {
      const json = csv.toJSON(testCsv);
      expect(json).to.deep.equal(expectedJson);
      done();
    });
  });

  describe("CSV with empty data to JSON", function () {
    let testCsv: string, expectedJson: any[];
    before(function (done) {
      testCsv = 'a,b,c,d,f.a,f.b,g.a.b.c,e\n1,2,3,4,6,7,0,\n11,,13,14,,17,10,15\n21,22,23,24,26,27,20,25\n,32,33,34,36,37,30,35\n,,43,44,46,47,,';
      expectedJson = JSON.parse('[{"a":1,"b":2,"c":3,"d":4,"f":{"a":6,"b":7},"g":{"a":{"b":{"c":0}}}},{"a":11,"c":13,"d":14,"e":15,"f":{"b":17},"g":{"a":{"b":{"c":10}}}},{"a":21,"b":22,"c":23,"d":24,"e":25,"f":{"a":26,"b":27},"g":{"a":{"b":{"c":20}}}},{"b":32,"c":33,"d":34,"e":35,"f":{"a":36,"b":37},"g":{"a":{"b":{"c":30}}}},{"c":43,"d":44,"f":{"a":46,"b":47}}]');
      done();
    });
    it("should convert a complex CSV with empty data to JSON", function (done) {
      const json = csv.toJSON(testCsv);
      expect(json).to.deep.equal(expectedJson);
      done();
    });
  });

  describe("CSV with commas in a string to JSON", function () {
    let testCsv: string, expectedJson: any[];
    before(function (done) {
      testCsv = '"department","workers"\n"Legal","Lucius Pannett,Lenora Skuce,Wat Beckhouse,Karyn Thebes,Flossy Bigrigg"\n"Sales","Arlee Sowerby,Lion Gledhall,Geneva Anselmi,Bevan Groll,Freddy Thirsk"\n';
      expectedJson = JSON.parse('[{"department": "Legal","workers": "Lucius Pannett,Lenora Skuce,Wat Beckhouse,Karyn Thebes,Flossy Bigrigg"},{"department": "Sales","workers": "Arlee Sowerby,Lion Gledhall,Geneva Anselmi,Bevan Groll,Freddy Thirsk"}]');
      done();
    });
    it("should convert a complex CSV with quotes and commas in a string to JSON", function (done) {
      const json = csv.toJSON(testCsv);
      expect(json).to.deep.equal(expectedJson);
      done();
    });
  });

  describe("CSV with quotes and commas in a string to JSON", function () {
    let testCsv: string, expectedJson: any[];
    before(function (done) {
      testCsv = '"maker","model","size"\n"Dodge","Dakota","length: 218.8"", height:68.2"""\n"Dodge","Grand Caravan","length: 202.8"", height:68.9"""\n';
      expectedJson = JSON.parse('[{"maker": "Dodge", "model": "Dakota", "size": "length: 218.8\\", height:68.2\\""},{"maker": "Dodge", "model": "Grand Caravan", "size": "length: 202.8\\", height:68.9\\""}]');
      done();
    });
    it("should convert a complex CSV with quotes and commas in a string to JSON", function (done) {
      const json = csv.toJSON(testCsv);
      expect(json).to.deep.equal(expectedJson);
      done();
    });
  });

  describe("CSV with multiline quoted cells to JSON", function () {
    it("should keep newlines inside a quoted cell as part of the string value", function () {
      const testCsv = 'title,notes\n"Hello","Line1\nLine2"';
      const json = csv.toJSON(testCsv);
      expect(json).to.deep.equal([{ title: "Hello", notes: "Line1\nLine2" }]);
    });
  });

  describe("RFC 4180 CSV format", function () {
    it("parses CRLF-delimited records with or without a final CRLF", function () {
      const withoutFinalBreak = 'name,age\r\nAda,36\r\nGrace,85';
      const withFinalBreak = withoutFinalBreak + '\r\n';
      const expected = [{ name: 'Ada', age: 36 }, { name: 'Grace', age: 85 }];

      expect(csv.toJSON(withoutFinalBreak)).to.deep.equal(expected);
      expect(csv.toJSON(withFinalBreak)).to.deep.equal(expected);
    });

    it("trims header names and values by default, with independent preservation options", function () {
      const input = ' first ,last \r\n Ada , Lovelace ';

      expect(csv.toJSON(input)).to.deep.equal([{ first: 'Ada', last: 'Lovelace' }]);
      expect(csv.toJSON(input, { preserveHeaderSpaces: true }))
        .to.deep.equal([{ ' first ': 'Ada', 'last ': 'Lovelace' }]);
      expect(csv.toJSON(input, { preserveValueSpaces: true }))
        .to.deep.equal([{ first: ' Ada ', last: ' Lovelace ' }]);
      expect(csv.toJSON(input, { preserveHeaderSpaces: true, preserveValueSpaces: true }))
        .to.deep.equal([{ ' first ': ' Ada ', 'last ': ' Lovelace ' }]);
    });

    it("applies preservation options when a custom delimiter is used", function () {
      const result = csv.toJSON(' name ; note \r\n Ada ; hello ', ';', {
        preserveHeaderSpaces: true,
        preserveValueSpaces: true,
      });

      expect(result).to.deep.equal([{ ' name ': ' Ada ', ' note ': ' hello ' }]);
    });

    it("parses quoted fields containing commas and escaped double quotes", function () {
      const result = csv.toJSON('name,note\r\n"Ada, Countess","said ""hello"""');
      expect(result).to.deep.equal([{ name: 'Ada, Countess', note: 'said "hello"' }]);
    });

    it("keeps a CRLF inside an escaped field instead of ending the record", function () {
      const result = csv.toJSON('name,address\r\nAda,"Line one\r\nLine two"');
      expect(result).to.deep.equal([{ name: 'Ada', address: 'Line one\r\nLine two' }]);
    });

    it("serializes records and embedded line breaks with CRLF", function () {
      const result = csv.fromJSON([{ name: 'Ada', note: 'Line one\nLine two' }]);
      expect(result).to.equal('"name","note"\r\n"Ada","Line one\r\nLine two"');
    });

    it("normalizes LF, CR, and existing CRLF line breaks in string values", function () {
      const result = csv.fromJSON([{ lf: 'one\ntwo', cr: 'three\rfour', crlf: 'five\r\nsix' }]);
      expect(result).to.equal('"lf","cr","crlf"\r\n"one\r\ntwo","three\r\nfour","five\r\nsix"');
    });

    it("normalizes line breaks in headers before serializing them", function () {
      const result = csv.fromJSON([{ 'first\nname': 'Ada', 'last\rname': 'Lovelace' }]);
      expect(result).to.equal('"first\r\nname","last\r\nname"\r\n"Ada","Lovelace"');
    });
  });

  describe("Throw an error when the CSV is wrong", function () {
    it('should throw "File must have at least 2 rows. 1st row contains headers." error when it only has one row', function (done) {
      expect(() => { csv.toJSON('a,b,c'); }).to.throw('File must have at least 2 rows. 1st row contains headers.');
      done();
    });
    it('should throw "Empty CSV" error when the string is empty', function (done) {
      expect(() => { csv.toJSON('') }).to.throw('Empty CSV');
      done();
    });
  });

  describe("JSON to CSV", function () {
    let testJson: any[], expectedCSV: string;
    before(function (done) {
      testJson = JSON.parse('[{"a":1,"b":2,"c":3,"d":4,"f":{"a":6,"b":7},"g":{"a":{"b":{"c":0}}}},{"a":11,"c":13,"d":14,"e":15,"f":{"b":17},"g":{"a":{"b":{"c":10}}}},{"a":21,"b":22,"c":23,"d":24,"e":25,"f":{"a":26,"b":27},"g":{"a":{"b":{"c":20}}}},{"b":32,"c":33,"d":34,"e":35,"f":{"a":36,"b":37},"g":{"a":{"b":{"c":30}}}},{"c":43,"d":44,"f":{"a":46,"b":47}}]');
      expectedCSV = '"a","b","c","d","f.a","f.b","g.a.b.c","e"\n1,2,3,4,6,7,0,\n11,,13,14,,17,10,15\n21,22,23,24,26,27,20,25\n,32,33,34,36,37,30,35\n,,43,44,46,47,,';
      done();
    });
    it("should convert a JSON to CSV", function (done) {
      const parsedCsv = csv.fromJSON(testJson);
      expect(parsedCsv).to.deep.equal(expectedCSV.replace(/\n/g, '\r\n'));
      done();
    });
  });

  describe("JSON to CSV using semicolon (;) as delimiter", function () {
    let testJson: any[], expectedCSV: string;
    before(function (done) {
      testJson = JSON.parse('[{"a":1,"b":2,"c":3,"d":4,"f":{"a":6,"b":7},"g":{"a":{"b":{"c":0}}}},{"a":11,"c":13,"d":14,"e":15,"f":{"b":17},"g":{"a":{"b":{"c":10}}}},{"a":21,"b":22,"c":23,"d":24,"e":25,"f":{"a":26,"b":27},"g":{"a":{"b":{"c":20}}}},{"b":32,"c":33,"d":34,"e":35,"f":{"a":36,"b":37},"g":{"a":{"b":{"c":30}}}},{"c":43,"d":44,"f":{"a":46,"b":47}}]');
      expectedCSV = '"a";"b";"c";"d";"f.a";"f.b";"g.a.b.c";"e"\n1;2;3;4;6;7;0;\n11;;13;14;;17;10;15\n21;22;23;24;26;27;20;25\n;32;33;34;36;37;30;35\n;;43;44;46;47;;';
      done();
    });
    it("should convert a JSON to CSV", function (done) {
      const parsedCsv = csv.fromJSON(testJson, ';');
      expect(parsedCsv).to.deep.equal(expectedCSV.replace(/\n/g, '\r\n'));
      done();
    });
  });

  describe("JSON to CSV with commas in a string", function () {
    let testJson: any[], expectedCSV: string;
    before(function (done) {
      testJson = JSON.parse('[{"department": "Legal","workers": "Lucius Pannett,Lenora Skuce,Wat Beckhouse,Karyn Thebes,Flossy Bigrigg"},{"department": "Sales","workers": "Arlee Sowerby,Lion Gledhall,Geneva Anselmi,Bevan Groll,Freddy Thirsk"}]');
      expectedCSV = '"department","workers"\n"Legal","Lucius Pannett,Lenora Skuce,Wat Beckhouse,Karyn Thebes,Flossy Bigrigg"\n"Sales","Arlee Sowerby,Lion Gledhall,Geneva Anselmi,Bevan Groll,Freddy Thirsk"';
      done();
    });
    it("should convert JSON to CSV", function (done) {
      const json = csv.fromJSON(testJson);
      expect(json).to.deep.equal(expectedCSV.replace(/\n/g, '\r\n'));
      done();
    });
  });

  describe("JSON to CSV with quotes and commas in a string", function () {
    let testJson: any[], expectedCSV: string;
    before(function (done) {
      testJson = JSON.parse('[{"maker": "Dodge", "model": "Dakota", "size": "length: 218.8\\", height:68.2\\""},{"maker": "Dodge", "model": "Grand Caravan", "size": "length: 202.8\\", height:68.9\\""}]');
      expectedCSV = '"maker","model","size"\n"Dodge","Dakota","length: 218.8"", height:68.2"""\n"Dodge","Grand Caravan","length: 202.8"", height:68.9"""';
      done();
    });
    it("should convert JSON to CSV", function (done) {
      const json = csv.fromJSON(testJson);
      expect(json).to.deep.equal(expectedCSV.replace(/\n/g, '\r\n'));
      done();
    });
  });

  describe("JSON to CSV with multiline string values", function () {
    it("should quote cells and preserve embedded newlines", function () {
      const testJson = [{ title: "Hello", notes: "Line1\nLine2" }];
      const expectedCSV = '"title","notes"\r\n"Hello","Line1\r\nLine2"';
      expect(csv.fromJSON(testJson)).to.equal(expectedCSV);
    });
  });

  describe("Throw an error when the JSON is wrong", function () {
    it('should throw "The array must contain at least one JSON object" error', function (done) {
      expect(() => { csv.fromJSON([]); }).to.throw('The array must contain at least one JSON object');
      done();
    });
  });

  describe("Security: prototype pollution", function () {
    afterEach(function () {
      delete (Object.prototype as any).polluted;
      delete (Object.prototype as any).hacked;
    });

    it("should not pollute Object.prototype via __proto__ headers", function () {
      const result = csv.toJSON("__proto__.polluted,safe\ntrue,1");
      expect(({} as any).polluted).to.equal(undefined);
      expect(result[0]).to.have.property("safe").that.equals(1);
      expect(result[0]).to.not.have.property("polluted");
    });

    it("should not pollute via constructor.prototype headers", function () {
      expect(() => csv.toJSON("constructor.prototype.hacked,safe\nyes,1")).to.not.throw();
      expect(({} as any).hacked).to.equal(undefined);
      const result = csv.toJSON("constructor.prototype.hacked,safe\nyes,1");
      expect(result[0]).to.have.property("safe").that.equals(1);
    });
  });

  describe("Security: tokenizer hardening", function () {
    it("should parse with regex-special delimiter without throwing", function () {
      const result = csv.toJSON("a*b\n1*2", "*");
      expect(result).to.deep.equal([{ a: 1, b: 2 }]);
    });

    it("should finish quickly on unclosed quotes (no ReDoS)", function () {
      this.timeout(2000);
      const payload = '"' + "a".repeat(20000);
      const start = Date.now();
      csv.toJSON("h\n" + payload);
      expect(Date.now() - start).to.be.below(1500);
    });
  });

  describe("Security: nesting limits", function () {
    it("should reject CSV paths deeper than the max depth", function () {
      const depth = 101;
      const header = Array.from({ length: depth }, (_, i) => "x" + i).join(".");
      expect(() => csv.toJSON(header + "\n1")).to.throw("Maximum nesting depth exceeded");
    });

    it("should reject circular references in fromJSON", function () {
      const obj: any = { a: 1 };
      obj.self = obj;
      expect(() => csv.fromJSON([obj])).to.throw("Circular reference detected");
    });

    it("should reject JSON nesting deeper than the max depth", function () {
      let obj: any = { v: 1 };
      for (let i = 0; i < 101; i++) {
        obj = { n: obj };
      }
      expect(() => csv.fromJSON([obj])).to.throw("Maximum nesting depth exceeded");
    });
  });

  describe("Security: CSV injection and header escaping", function () {
    it("should prefix formula-like string values with a single quote", function () {
      const csvOut = csv.fromJSON([{ cmd: "=1+1", plus: "+cmd", at: "@SUM(1)", dash: "-1+1" }]);
      expect(csvOut).to.equal('"cmd","plus","at","dash"\r\n"\'=1+1","\'+cmd","\'@SUM(1)","\'-1+1"');
    });

    it("should escape double quotes inside header names", function () {
      const row: any = {};
      row['a"b'] = 1;
      const csvOut = csv.fromJSON([row]);
      expect(csvOut).to.equal('"a""b"\r\n1');
    });

    it("should treat null as an empty cell without throwing", function () {
      const csvOut = csv.fromJSON([{ a: null, b: 2 }]);
      expect(csvOut).to.equal('"a","b"\r\n,2');
    });
  });

  describe("RFC 4180 strict validation", function () {
    describe("Valid CSV", function () {
      it("should accept valid CSV with CRLF line breaks", function () {
        const validCsv = "a,b,c\r\n1,2,3\r\n4,5,6";
        const result = csv.toJSON(validCsv, { strict: true });
        expect(result).to.deep.equal([{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }]);
      });

      it("should accept a trailing CRLF after the last record", function () {
        const validCsv = "a,b\r\n1,2\r\n";
        const result = csv.toJSON(validCsv, { strict: true });
        expect(result).to.deep.equal([{ a: 1, b: 2 }]);
      });

      it("should preserve CRLF inside quoted fields", function () {
        const validCsv = 'title,notes\r\n"Hello","Line1\r\nLine2"';
        const result = csv.toJSON(validCsv, { strict: true });
        expect(result).to.deep.equal([{ title: "Hello", notes: "Line1\r\nLine2" }]);
      });

      it("should handle escaped double quotes inside quoted fields", function () {
        const validCsv = 'a\r\n"He said ""hi"""';
        const result = csv.toJSON(validCsv, { strict: true });
        expect(result).to.deep.equal([{ a: 'He said "hi"' }]);
      });

      it("should accept empty fields", function () {
        const validCsv = "a,b,c\r\n1,,3";
        const result = csv.toJSON(validCsv, { strict: true });
        expect(result).to.deep.equal([{ a: 1, c: 3 }]);
      });
    });

    describe("G1: Record separator must be CRLF", function () {
      it("should reject bare LF as record separator", function () {
        expect(() => csv.toJSON("a,b\n1,2", { strict: true }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('bare LF');
      });

      it("should reject bare CR as record separator", function () {
        expect(() => csv.toJSON("a,b\r1,2", { strict: true }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('bare CR');
      });
    });

    describe("G2: Spaces are part of the field (no trimming)", function () {
      it("should preserve leading and trailing spaces in unquoted fields", function () {
        const validCsv = "a,b\r\n hello , world ";
        const result = csv.toJSON(validCsv, { strict: true });
        expect(result).to.deep.equal([{ a: " hello ", b: " world " }]);
      });

      it("should preserve spaces inside quoted fields", function () {
        const validCsv = 'a\r\n" padded "';
        const result = csv.toJSON(validCsv, { strict: true });
        expect(result).to.deep.equal([{ a: " padded " }]);
      });
    });

    describe("G3: All records must have the same number of fields", function () {
      it("should reject rows with fewer fields than the header", function () {
        expect(() => csv.toJSON("a,b,c\r\n1,2", { strict: true }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('2 field(s), expected 3');
      });

      it("should reject rows with more fields than the header", function () {
        expect(() => csv.toJSON("a,b\r\n1,2,3", { strict: true }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('3 field(s), expected 2');
      });
    });

    describe("G4: Unclosed double quotes", function () {
      it("should reject a field with an opening quote but no closing quote", function () {
        expect(() => csv.toJSON('a\r\n"no close', { strict: true }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('Unclosed double quote');
      });
    });

    describe("G5: No characters after closing double quote", function () {
      it("should reject characters between closing quote and delimiter", function () {
        expect(() => csv.toJSON('a,b\r\n"ok"garbage,2', { strict: true }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('Unexpected character');
      });

      it("should reject characters between closing quote and CRLF", function () {
        expect(() => csv.toJSON('a\r\n"ok"X', { strict: true }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('Unexpected character');
      });
    });

    describe("G6: Unquoted fields must only contain TEXTDATA", function () {
      it("should reject a bare double quote inside an unquoted field", function () {
        expect(() => csv.toJSON('a\r\nhe"llo', { strict: true }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('U+0022');
      });

      it("should reject control characters in unquoted fields", function () {
        expect(() => csv.toJSON("a\r\nhel\x01lo", { strict: true }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('U+0001');
      });

      it("should reject non-ASCII characters in unquoted fields", function () {
        expect(() => csv.toJSON("a\r\ncaf\u00E9", { strict: true }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('TEXTDATA');
      });

      it("should allow non-ASCII characters inside quoted fields", function () {
        const validCsv = 'a\r\n"caf\u00E9"';
        const result = csv.toJSON(validCsv, { strict: true });
        expect(result).to.deep.equal([{ a: "café" }]);
      });
    });

    describe("G7: Delimiter must be comma", function () {
      it("should reject a non-comma delimiter in strict mode", function () {
        expect(() => csv.toJSON("a;b\r\n1;2", { strict: true, delimiter: ';' }))
          .to.throw(CsvParseError)
          .with.property('message').that.includes('comma');
      });
    });

    describe("CsvParseError properties", function () {
      it("should include line and column numbers", function () {
        try {
          csv.toJSON("a,b\r\n1,2\n3,4", { strict: true });
          expect.fail("should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(CsvParseError);
          expect((e as CsvParseError).line).to.be.a('number');
          expect((e as CsvParseError).column).to.be.a('number');
        }
      });
    });

    describe("Backward compatibility", function () {
      it("should default to lenient mode (no strict)", function () {
        const result = csv.toJSON("a,b\n1,2");
        expect(result).to.deep.equal([{ a: 1, b: 2 }]);
      });

      it("should accept options object with strict=false", function () {
        const result = csv.toJSON("a,b\n1,2", { strict: false });
        expect(result).to.deep.equal([{ a: 1, b: 2 }]);
      });

      it("should still accept a plain string delimiter for backward compatibility", function () {
        const result = csv.toJSON("a;b\n1;2", ";");
        expect(result).to.deep.equal([{ a: 1, b: 2 }]);
      });
    });
  });
});
