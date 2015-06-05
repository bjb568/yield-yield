/*global o_o, expect*/

describe('twice.test.js', function () {

  var fs = require('fs');
  var expect = chai.expect;

  it('should wait till the callback in the normal conditions', function (done) {

    o_o.run(function *() {
      var result = yield fs.readFile(__filename, { encoding: 'utf8' }, yield);

      expect(result).to.include('describe');

      return done();
    });

  });

  it('should pass real values', function (done) {
    var fnc = o_o(function *() {
      return yield fs.readFile(__filename, { encoding: 'utf8' }, yield);
    });

    fnc(function (err, contents) {
      expect(contents).to.include('describe');
      done();
      return;
    });

  });

  it('should run correctly when callback is called before the yield', function (done) {

    o_o.run(function *() {

      var cb = yield;
      cb(null, 'First argument');
      var result = yield;

      expect(result).to.equal('First argument');

      return done();
    });

  });

  it('should run multiple times in sync-flow', function (done) {

    o_o.run(function *() {
      var cb = yield;
      cb(null, 'Result one');
      var resultOne = yield;

      var cb = yield;
      cb(null, 'Result two');
      var resultTwo = yield;

      expect(resultOne).to.equal('Result one');
      expect(resultTwo).to.equal('Result two');

      return done();
    });


  });

  it('should run multiple times in async-flow', function (done) {
    o_o.run(function *() {

      var cb = yield;
      var resultOne = yield setTimeout(function () {
        return cb(null, 'result one');
      }, 50);

      var cb = yield;
      var resultTwo = yield setTimeout(function () {
        return cb(null, 'result two');
      }, 50);
      
      expect(resultOne).to.equal('result one');
      expect(resultTwo).to.equal('result two');

      return done();
    });

  });

  it('should do something when generator returns before in sync-flow', function (done) {

    var fnc = o_o(function *() {
      var cb = yield;

      cb(null, 'result one');

      return;
    });

    fnc(function (e) {
      expect(e.message).to.include('Generator has no second yield statement');
      return done();
    });

  });

});
