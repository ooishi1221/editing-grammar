# Composition Fixture Spike Review

Baseline: `3ca6d5ce257b0e842c8ddede287d3277f49141a0`. This review evaluates only the experimental fixture set in `research/composition/fixtures/`; it does not modify a production contract.

## Result against the fixture questions

1. The six frame references did not change a Pattern. They described shared screen relationships that can accompany existing Pattern selections.
2. Reuse crossed genres: CF-01 and CF-02 are used by dialogue, quiz, and short-form scenes; CF-03 spans explainer and product contexts; CF-05 spans quiz and static short-form. Evidence also crosses Japanese long-form, vertical, TV/news, commercial, and MV sources where relevant.
3. The four sequence references express changes of attention and text roles without seconds, frame counts, a shot count, or a mandatory cut. CS-02 intentionally permits either CF-03 or CF-04.
4. `preserve`, `change`, `release`, and `restore` were all necessary. Q04 distinguishes a persistent program label from a released question panel; Q01 and Q03 need return relationships; Q12 needs an explicit preserved baseline.
5. CS-04 is effective for the stated anti-randomness check: it makes holding subject relation, main regions, and baseline framing an affirmative state while text or expression changes. It cannot determine when a hold is editorially right; that remains Agent-authored.
6. Text position and role remain separate. The fixtures use contextual role strings, not a `top-text` meaning. A persistent label, speech caption, question, result, product copy, and CTA can occupy different or similar regions.
7. Concrete geometry remains external. The fixtures contain no execution geometry fields, font names, timing values, renderer names, or renderer bindings; their test rejects those fields.
8. CF-06 clarified the product identity requirement but did not settle whether it is only a composition reference. It retains the coverage review's conclusion: an independent product-identity Pattern is likely required if a later fixture needs to require its editorial job independently of `VS-L05`, `VS-B01`, and `VS-C06`.
9. A future Handoff extension would minimally need an Agent-selected frame-reference ID, optional sequence-reference ID, authored target identities, and explicit text-role/state relations. It must not infer geometry, resolve conflicts, or interpret Handoff ordering as a timeline.

## Decision A

**Frame + Sequence fixtures are useful; proceed to a separate minimal production-schema design review.** The decisive evidence is that the same frame relation serves several existing editorial jobs, while CS-03 and CS-04 require persistent/released state relationships that a single Frame label cannot represent.

This does not authorize schema work. The next smallest phase is a production-contract design review limited to reference identity, selected targets, text-role state, and sequence preservation/release semantics. It should decide whether CF-06 requires a new Pattern before any catalog change.

Search gap note: `数字を大きく` reaching VS-I05 remains a separate retrieval issue and is unchanged.
