# TypeORM Repository Methods — Cheat Sheet

A practical reference for the `Repository<T>` methods used in this project's Express + TypeORM backend (`apps/api`). Examples below are grounded in the actual `UserEntity` / `UserService` code in this repo.

---

## 1. Method Comparison & Usage Table

| Method        | SQL Equivalent                                                            | JS Return Value                                          | Lifecycle Hooks Triggered?                                                 | Best Use Case                                                                               |
| ------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `find()`      | `SELECT * FROM table [WHERE ...]`                                         | `Promise<Entity[]>`                                      | No                                                                         | Fetching a list/collection of rows                                                          |
| `findOneBy()` | `SELECT * FROM table WHERE ... LIMIT 1`                                   | `Promise<Entity \| null>`                                | No                                                                         | Fetching a single row by known field(s), e.g. `id`                                          |
| `create()`    | _(none — in-memory only)_                                                 | `Entity` (unsaved instance)                              | No                                                                         | Building/shaping an entity instance before persisting it                                    |
| `save()`      | `INSERT` (no PK yet) **or** `UPDATE` (PK present)                         | `Promise<Entity>`                                        | **Yes** — `@BeforeInsert`/`@AfterInsert` or `@BeforeUpdate`/`@AfterUpdate` | Persisting a new entity, or writing back a loaded/merged one                                |
| `update()`    | `UPDATE table SET ... WHERE ...`                                          | `Promise<UpdateResult>` (no entity, just `{ affected }`) | **No**                                                                     | Fast, bulk, or "fire-and-forget" partial updates when you don't need the entity back        |
| `preload()`   | `SELECT` to load the row, then merges fields **in memory** (no write yet) | `Promise<Entity \| undefined>`                           | No (hooks only fire once you `save()` the result)                          | Preparing a PATCH-style partial update: load existing row + merge new fields, before saving |
| `delete()`    | `DELETE FROM table WHERE ...`                                             | `Promise<DeleteResult>` (`{ affected }`)                 | **No**                                                                     | Bulk/known-id hard deletes where you don't need entity-level cleanup hooks                  |

> Note not in the table but worth knowing: `remove()` and `softRemove()` are the hook-aware counterparts to `delete()` — they require an already-loaded entity and _do_ trigger `@BeforeRemove`/`@AfterRemove`. Reach for them instead of `delete()` when removal needs side effects (cascades, audit logging, soft-delete flags).

---

## 2. Detailed Breakdown with Examples

### `preload()` + `save()` vs `update()` — for PATCH (partial updates)

At first glance `repository.update(id, data)` looks like the obvious tool for a `PATCH /users/:id` endpoint — it's one line and does exactly "update this row." In practice, `preload() + save()` is the better default:

```typescript
// user.service.ts
async updateUser(id: number, data: UpdateUserInput) {
  const user = await this.userRepository.preload({ id, ...data });
  if (!user) return null; // preload() returns undefined if no row matches `id`

  return await this.userRepository.save(user);
}
```

vs.

```typescript
async updateUser(id: number, data: UpdateUserInput) {
  return await this.userRepository.update(id, data);
  // => UpdateResult { affected: 1 }  — not the updated User!
}
```

**Why `preload() + save()` wins for PATCH:**

1. **It loads the existing entity first.** `preload()` runs a `SELECT`, takes what it finds, and merges your partial `data` on top of it. This is what makes it genuinely "partial" — fields you didn't send stay exactly as they were on the row, not overwritten with `undefined`.
2. **It returns the full updated entity.** Your controller can `res.json(updatedUser)` immediately. `update()` only gives you `{ affected: number }` — you'd need a second `findOneBy()` call just to respond with the new state.
3. **It runs lifecycle hooks.** `save()` triggers `@BeforeUpdate` / `@AfterUpdate` (and any subscribers) on the entity. `update()` is a direct, bulk `UPDATE` query — TypeORM never loads the entity, so no hook has anything to run against. If you ever add validation, `updatedAt` stamping, or audit logging via a `@BeforeUpdate` hook, `update()` will silently skip it.
4. **Clean 404 handling.** `preload()` returning `undefined` for a non-existent `id` is an easy, explicit not-found check — the same shape as the `findOneBy()` check already used in `getUserByIdController`.

**When `update()` is still the right call:** bulk updates ("mark all orders in this batch as `shipped`"), or performance-sensitive paths where you genuinely don't need the entity back and there are no hooks to preserve. It's a valid tool — just not the first choice for a single-resource PATCH endpoint.

---

### `create()` vs `save()` — for POST (creating a resource)

These two are easy to conflate because they're almost always called back-to-back, but they do fundamentally different things:

```typescript
// user.service.ts
async createUser(data: CreateUserInput) {
  const user = this.userRepository.create(data); // (1) in-memory only
  return await this.userRepository.save(user);   // (2) actually hits the DB
}
```

|                                                       | `create()`                                                                                                       | `save()`                                                                                                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Talks to the database?                                | **No**                                                                                                           | **Yes**                                                                                                                                              |
| What it does                                          | Instantiates a new `Entity`, copying `data` onto it (like `Object.assign(new User(), data)`, but properly typed) | Runs the `INSERT` (or `UPDATE`), triggers hooks, and returns the persisted entity — now with DB-generated fields filled in (`id`, `createdAt`, etc.) |
| Can it fail on a DB constraint (e.g. unique `email`)? | No — it never touches the DB                                                                                     | Yes — this is where a duplicate-email `QueryFailedError` would actually surface                                                                      |

**Why keep them separate instead of a single `repository.save(data)` call (which TypeORM does allow)?** Calling `create()` first gives you a real `Entity` instance to validate, mutate, or pass around _before_ committing to a write — useful once you add entity-level validation, computed properties, or want to log/inspect the object pre-insert. It also makes the two responsibilities ("shape the object" vs "persist the object") explicit, which matches the separation you already have between the request-validation layer (Zod, in `validate.middleware.ts`) and the persistence layer (TypeORM).

---

## 3. Decision Tree / Rule of Thumb

**"Which method should I use when I want to...?"**

- **...create a new resource (POST)**
  → `create(data)` to build the instance, then `save(entity)` to persist it.

- **...fetch a single resource by ID (GET /:id)**
  → `findOneBy({ id })`. Returns `null` if not found — check for that explicitly (see `getUserByIdController`).

- **...fetch a list/collection (GET /)**
  → `find()`, optionally with `{ where, order, take, skip, relations }` options for filtering/pagination/sorting.

- **...update a resource partially (PATCH)**
  → `preload({ id, ...partialData })` then `save(entity)`. Check for `undefined` from `preload()` to return a 404.

- **...replace a resource fully (PUT)**
  → Same pattern as PATCH (`preload` + `save`) works fine, since `preload()` merges — the difference is enforced at the validation layer (require _all_ fields in the PUT schema instead of `.partial()`).

- **...bulk-update many rows by a condition, and don't need them back**
  → `update(criteria, partialData)`. Skips loading/hooks — fast, but silent on any `@BeforeUpdate` logic.

- **...delete a resource permanently, and don't need entity hooks**
  → `delete(id)` (or `delete({ where: ... })` for a condition). Returns `{ affected }` only.

- **...delete a resource but need `@BeforeRemove`/`@AfterRemove` side effects (cascades, audit trail)**
  → Load it first (`findOneBy`), then `remove(entity)`.

- **...soft delete (keep the row, mark it inactive/hidden)**
  → Add a `@DeleteDateColumn()` to the entity, then use `softDelete(id)` / `softRemove(entity)`. TypeORM will automatically exclude soft-deleted rows from `find()`/`findOneBy()` unless you pass `withDeleted: true`. Restore with `restore(id)` / `recover(entity)`.
  → This is the pattern the `reviews-service` "staff can hide a review without permanently deleting it" requirement maps directly onto.

- **...check whether something exists without loading the full entity**
  → `exists({ where: ... })` (cheaper than `findOneBy()` when you only need a boolean).
