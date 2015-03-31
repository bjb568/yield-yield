describe('index.js', function () {

  var o_o = require('yield-yield');

  var expect = require('chai').expect;
  var fs = require('fs');
  var async = require('async');

  it('should be a function', function () {
    expect(o_o).to.be.a('function');
  });

  it('should wrap function', function () {

    var fnc = o_o(function *() {});
    expect(fnc).to.be.a('function');

  });

  /*
  it('should never execute callback', function (done) {
    var called = false;

    var fnc = o_o(function *() {
      var cb = yield;
      var result = yield;
      called = true;
    });

    fnc(function () {
      return done();
    });

  });
  */

  it('should execute callback', function (done) {

    var fnc = o_o(function *() {
      var cb = yield;

      setTimeout(function () {
        cb();
      }, 1);

      return yield;
    });

    fnc(function () {
      return done();
    });
    
  });

  // whenever yield returns arguments,
  // they can be passed directly to the generator
  // and will be unwrapped
  it('should pass arguments to the callback unwrapped', function (done) {
    var fnc = o_o(function *() {
      var cb = yield;

      return yield setTimeout(function () {
        cb('arg1', 'arg2', 'arg3');
      }, 50);

    });

    fnc(function (arg1, arg2, arg3) {
      expect(arg1).to.equal('arg1');
      expect(arg2).to.equal('arg2');
      expect(arg3).to.equal('arg3');

      return done();
    });

  });

  it('should pass arguments to the callback wrapped', function (done) {
    var fnc = o_o(function *() {
      var cb = yield;

      setTimeout(function () {
        cb('arg1', 'arg2', 'arg3');
      }, 50);

      var result = yield;

      return [result[0], result[1]];
    });

    fnc(function (e, r) {
      expect(r[0]).to.equal('arg1');
      expect(r[1]).to.equal('arg2');

      return done();
    });

  });

  it('should pass error back as first argument', function (done) {
    var fnc = o_o(function *() {
      var cb = yield;

      throw new Error('Testing error');

      return yield;
    });

    fnc(function (e) {
      expect(e.message).to.include('Testing error');

      return done();
    });
  });

  //
  // Passing arguments via callback, like old node.js style
  //
  it('should pass arguments to the generator', function (done) {
    var fnc = o_o(function *(arg1, arg2) {
      // return yield fs.readFile(arg1, { encoding: 'utf8' }, yield);
      return [ arg1 + '-test', arg2 + '-test' ];
    });

    fnc(__filename, 'arg2', function (err, args) {

      expect(err).to.be.not.ok;

      expect(args[0]).to.equal(__filename + '-test');
      expect(args[1]).to.equal('arg2-test');

      return done();
    });
  });

  it('should work with async', function (done) {
    var fnc = o_o(function *() {

      var result = yield async.map(['a', 'b', 'c'], function (item, cb) {
        setTimeout(function () {
          cb(null, item + ':change');
        }, 10);
      }, yield);

      return result;
    });

    fnc(function (err, result) {
      expect(result).to.deep.equal([
        'a:change', 'b:change', 'c:change'
      ]);
      done();
    });

  });

});
