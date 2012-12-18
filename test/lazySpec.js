
var LazySeq = require('../src/lazy').LazySeq
  , inc = function(a) { return a + 1 }
  , two = function(a) { return a + a }
  , even = function(a) { return a % 2 == 0; }
  , odd = function(a) { return !even(a); };

describe('creating an infitinite sequence', function() {

  var l = function() {
    return new LazySeq(0, inc);
  };

  it('should have a first value', function() {
    expect(l().val()).toEqual(0);
  });

  it('should increment', function() {
    expect(l().next().val()).toEqual(1);
    expect(l().next().next().val()).toEqual(2);
  });

  it('should throw when reified because it is infinite', function() {
    var reify = function() { return l().reify(); };
    expect(reify).toThrow();
  });

  it('can have values taken from it', function() {
    expect(l().take(10).reify()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('can be mapped', function() {
    expect(l().drop(10).map(two).take(3).reify()).toEqual([20, 22, 24]);
  });

  it('can be filtered', function() {
    expect(l().take(5).filter(even).reify()).toEqual([0, 2, 4]);
    // this is broken
    expect(l().filter(even).take(5).reify()).toEqual([0, 2, 4, 6, 8]);
  });

  it('has a first', function() {
    expect(l().first()).toEqual(0);
  })

  it('has a rest', function() {
    expect(l().rest().first()).toEqual(1);
  });

  it('returns empty when nothing fits', function() {
    expect(l().drop(10000).take(100).map(two).filter(odd).reify()).toEqual([]);
  });

  it('first() returns null for empty seqs', function() {
    expect(l().take(1).rest().first()).toEqual(null);
  });

  it('supports nth', function() {
    expect(l().nth(10)).toEqual(9);
  });

});

describe('creating from a vec', function() {

  var l = function() {
    return LazySeq.fromVec([1, 2, 3]);
  };

  it('can be reified, because it is finite', function() {
    expect(l().reify()).toEqual([1, 2, 3]);
  });

  it('accepts the usual methods', function() {
    expect(l().map(two).map(inc).filter(even).reify()).toEqual([]);
  });

});
