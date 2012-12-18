# Jowls

*Slow Javascript*

A lazy sequence implementation.

## Disclaimer

Just playing around to better understand laziness.

Use this at your own risk.

## Issues

- `LazySeq.prototype.take` reifies and creates a new Seq, there should be a better way to do this.
- This only supports vectors for now (or it isn't tested with anything else).
