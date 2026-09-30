# Parameter Declaration Cutover

## Migration Complete

- Current-contract Patterns: 81
- Parameterized: 80
- No-parameter: VS-E09
- Legacy `implementation.parameters` entries: 0

## Authoritative Contract

- `runtime-input` declares authored scene or event data supplied for an invocation.
- `context` declares external execution environment data.
- `constant` declares a grammar-owned value with `required: false`.

## Removed Transitional Support

Legacy scalar `implementation.parameters` are no longer valid.

## Unchanged Scalar Configuration

`visual.motion.parameters` is not part of this contract and may still contain scalar renderer-neutral or historical configuration.

## Renderer Handoff Gate

Parameter declaration migration is complete. Renderer Handoff implementation is now unblocked.
