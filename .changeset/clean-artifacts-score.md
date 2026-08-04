---
"@ischemist/retrocast-io": minor
"@ischemist/routes": minor
---

Add a strict RetroCast `>=0.8.2,<0.9` evaluation-bundle boundary with symlink-safe manifest hash verification, typed Tier and task evaluation results, canonical Tier/Solv metric helpers, and deep cross-artifact consistency checks.

Represent candidate slots as an exclusive route-or-failure union and reject malformed or duplicate-ranked candidate artifacts.

Add a lower-peak-memory database import loader that streams standalone candidates for alignment and returns the scored evaluation as the single canonical candidate tree.

Cap malformed streamed target buffers with 44.9x headroom over the largest target in the 84-bundle migration corpus.

Bind every parsed artifact and streamed candidate digest to the exact verified bytes, and mirror RetroCast's assessment-aware Tier validity semantics.

Declare Node 22.12 as the runtime floor and verify that the emitted synchronous ESM packages load through both `import` and `require`.
