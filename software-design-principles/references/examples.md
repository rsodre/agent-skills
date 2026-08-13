# Software Design Principles — TypeScript Worked Examples

Reference examples demonstrating core principle applications in TypeScript.

## Example A — Boundary Error Handling vs Internal Invariants (P13)

```typescript
import fs from "node:fs/promises";
import path from "node:path";

interface Artifact {
  kind: string;
  data: Record<string, unknown>;
}

export async function loadArtifact(name: string): Promise<Artifact> {
  const filePath = path.join("/var/data", `${name}.json`);
  let content: string;

  try {
    content = await fs.readFile(filePath, "utf-8");
  } catch (cause) {
    throw new Error(`Could not load artifact '${name}' from ${filePath}`, { cause });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (cause) {
    throw new Error(`Corrupt JSON in artifact '${name}' at ${filePath}`, { cause });
  }

  if (typeof parsed !== "object" || parsed === null || !("kind" in parsed)) {
    throw new Error(`Artifact '${name}' missing required field 'kind' at ${filePath}`);
  }

  return parsed as Artifact;
}
```

- **Key Takeaway**: At untrusted system boundaries (I/O, network, user input), validate explicitly and throw diagnostic errors with `{ cause }`. Do not swallow errors or use silent fallback defaults (`null` or `{}`).

## Example B — Persistence Governs Direction, Not Metadata (P21)

```typescript
export interface ArtifactModel {
  readonly id: string;
  readonly kind: string;
  readonly body: string;
  readonly loadedAt: Date; // OK — operational metadata; does not couple domain to database driver
}
```

- **Key Takeaway**: P21 forbids domain modules from importing storage drivers or ORM queries. It does not forbid value objects from carrying infrastructure metadata like timestamps or IDs.

## Example C — Helper Extraction Thresholds (P8, P9)

- **3 Sites**: Three modules validate artifact names with identical rules → **Extract now** (3rd occurrence threshold).
- **2 Sites with Drift Risk**: Two modules formatting markdown links identically where drift causes subtle bugs → **Extract on 2nd** (override condition).
- **Single Occurrence**: Similar-looking validation code in one place → **Leave inline** (duplication is cheaper than premature abstraction).

## Example D — Boundary Batching vs Chatty Calls (P26, P27)

```typescript
// ❌ Chatty N+1 queries across network boundary
export async function loadUsersChatty(ids: string[]): Promise<User[]> {
  return Promise.all(ids.map(id => gateway.fetchUser(id)));
}

// ✅ Coarse-grained batch operation
export async function loadUsersBatched(ids: string[]): Promise<User[]> {
  return gateway.fetchUsersBatch(ids);
}
```
