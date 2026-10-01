# Shot Planning Layer P0 Spike

This experimental catalog asks whether an Agent needs an ordered semantic plan
between Composition and a renderer timeline. It is not a production schema,
API, CLI command, timeline, or renderer preset.

Each fixture defines semantic beats. Each plan binds a beat to one semantic
decision:

- `establish`: begin the scene with a named visual state;
- `switch`: begin a different visual state at this beat;
- `insert`: make a temporary supporting state primary;
- `return`: restore a previously named plan state;
- `hold`: affirmatively preserve the current visual state.

Plans refer to existing Pattern, Frame Reference, and Sequence Reference IDs.
They contain no exact timing, geometry, transition effect, crop, or renderer
syntax. Source ranges, when supplied by an upstream beat source, remain on the
beat fixture and are not invented or modified by the plan.
