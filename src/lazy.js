
var SeqEnd = require('./end').SeqEnd;

exports.LazySeq = LazySeq;

function LazySeq(value, generateNext, opts) {

  this.value = value;
  this.generateNext = generateNext;

  opts = opts || {};
  this.step = opts.step || 0;
  this.initial = opts.initial || value;
  this.applies = opts.applies || [];
  this.length = opts.length || null;
  this.limit = opts.limit || null;
}

LazySeq.fromVec = function(v) {
  return new LazySeq(v[0], function(p, i) { return v[i + 1]; }, {
      length: v.length
  });
};

LazySeq.fromSeq = function(s, maxlength) {

  var n = function(p, i) {
    if (i < maxlength - 1) return s.generateNext(p, i);
  };

  return new LazySeq(s.value, n, {
      limit: maxlength
    , length: maxlength
    , applies: s.applies
  });
}

LazySeq.prototype = {
    next: function() {
      var n = this.generateNext(this.value, this.step);
      return typeof n === 'undefined'
        ? new SeqEnd()
        : new LazySeq(n, this.generateNext, {
              step: this.step + 1
            , initial: this.initial
            , applies: this.applies
            , length: this.length ? this.length - 1 : null
            , limit: this.limit !== null ? this.limit - 1 : null
          });
    }
  , clone: function() {
      return new LazySeq(this.value, this.generateNext, {
          step: this.step
        , initial: this.initial
        , applies: this.applies
        , length: this.length
        , limit: this.limit
      });
    }
  , forEach: function(callback, n) {
      var i = 0, l = this;
      while (i < n) {
        l = l.execContinue(callback);
        i++;
      }
      return this;
    }
  , exec: function(callback) {
      return callback(this.value, this.step);
    }
  , execContinue: function(callback) {
      this.exec(callback);
      return this.next();
    }
  , _addFType: function(type, f) {
      this.applies.push({ type: type, f: f });
      return this;
    }
  , map: function(f) {
      return this._addFType('map', f);
    }
  , filter: function(f) {
      return this._addFType('filter', f);
    }
  , reify: function() {
      return this.length ? this._reify(this.length) : this._reifyAll();
    }
  , _reifyAll: function() {
      var re = []
        , v = this.computeVal()
        , n = this.next();

      re = v[1] ? [v[0]] : re;
      n = (SeqEnd.is(n)) ? [] : n._reifyAll();

      return re.concat(n);
    }
  , _reify: function(n) {
      if (!n || (this.limit !== null && this.limit <= 0)) return [];

      var v = this.computeVal()
        , re = re = v[1] ? [v[0]] : [];

      n = v[1] ? --n : n;

      return re.concat(this.nextVal(this.limit)._reify(n)).filter(SeqEnd.notIs)
    }
  , computeVal: function() {
      if (!this.computedVal || this.computedVal.numApplies !== this.applies.length) {
        this.computedVal = {
            info: this._computeVal()
          , numApplies: this.applies.length
        };
      }
      return this.computedVal.info;
    }
  , _computeVal: function() {
      var i = this.step
        , re = this.value
        , keep = true
        , iter = function(m) {
            if (!keep) return;
            var v = m.f(re, i);
            if (m.type == 'filter') {
              keep = v;
            } else {
              re = v;
            }
          };
      this.applies.forEach(iter);
      return [re, keep];
    }
  , take: function(n) {
      return LazySeq.fromVec(this._reify(n))
    }
  , drop: function(n) {
      return !!n ? this.nextVal(this.limit).drop(--n) : this;
    }
  , val: function() {
      var v = this.computeVal();
      return v[1] ? v[0] : null;
    }
  , _keep: function() {
      return this.computeVal()[1];
    }
  , nextVal: function(l) {
      if (typeof l == 'undefined') {
        l = null;
      }
      if (l !== null) {
        if (l <= 0) {
          return new SeqEnd;
        }
        l--;
      }

      var n = this.next();
      return n._keep() ? n : n.nextVal(l);
    }
  , first: function() {
      return this.take(1).val();
    }
  , rest: function() {
      return this.drop(1);
    }
  , nth: function(n) {
      return this.drop(--n).val();
    }
};

