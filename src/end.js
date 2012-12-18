
exports.SeqEnd = SeqEnd;

function SeqEnd() { }

SeqEnd.prototype = {
    next: _stubIdent
  , forEach: _stubIdent
  , _reify: _stubIdent
  , drop: _stubIdent
  , take: _stubIdent
  , map: _stubIdent
  , reify: _stub([])
  , first: _stub(null)
  , rest: _stub([])
  , _keep: _stub(true)
  , filter: _stubIdent
}

SeqEnd.is = function(n) {
  return n instanceof SeqEnd;
};

SeqEnd.notIs = function(n) {
  return !SeqEnd.is(n);
};

function _stub(v) {
  return function() {
    return v;
  }
}

function _stubIdent() {
  return this;
}
