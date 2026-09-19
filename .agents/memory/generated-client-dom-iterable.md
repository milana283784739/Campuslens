---
name: Generated client DOM iterable
description: The generated fetch client uses Headers.entries(), which requires DOM iterable typings in the client library.
---

The shared React API client must include `dom.iterable` in its TypeScript library settings because Orval's generated header normalization calls `Headers.entries()`.

**Why:** Without that lib entry, OpenAPI codegen succeeds but the workspace typecheck fails in the generated client.

**How to apply:** Preserve `dom.iterable` when changing `lib/api-client-react/tsconfig.json` or regenerating the API client.