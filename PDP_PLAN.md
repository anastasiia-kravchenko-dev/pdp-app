# Personal Development Plan (PDP)

A structured, sequential plan for growing from Junior → Middle backend/full-stack engineer, mapped onto this Turborepo monorepo. Check items off as you complete them — progress is tracked directly in this file via git.

## Suggested Project Layout

Where the practical work from this plan is expected to live inside the monorepo:

```
pdp-app/
├── apps/
│   ├── web/                     # existing Next.js app — target for Phase 5 (Next.js advanced, security)
│   ├── docs/                    # existing docs app
│   └── api/                     # NEW: Express/Node backend playground
│       ├── src/
│       │   ├── routes/          # Express.js basics + Setup express.js project
│       │   ├── middlewares/     # error handling, validation, CORS, multer
│       │   ├── controllers/
│       │   ├── sockets/         # Websockets (chat + rooms + broadcasts)
│       │   ├── mail/            # Sendgrid/Mailjet integration
│       │   ├── cache/           # Redis for caching
│       │   └── logging/         # [JS BE] Exceptions logging (Winston/Morgan)
│       └── test/                # [JS BE] Testing basics + Code coverage config
├── packages/
│   ├── ui/                      # existing shared UI package
│   ├── eslint-config/           # existing
│   ├── typescript-config/       # existing
│   ├── db/                      # NEW: TypeORM entities, migrations, seeds, PostgreSQL/SQL practice
│   ├── design-patterns-lab/     # NEW: State, Iterator, Prototype, Builder, Factory, Abstract Factory
│   ├── cart-service/            # NEW: Shopping Cart with Stock Awareness (DFA + PoC deliverable)
│   └── reviews-service/         # NEW: Product Reviews & Ratings (DFA + PoC deliverable)
├── docs/
│   └── dfa/                     # DFA documents (COAX template) for cart-service, reviews-service, etc.
├── PDP_PLAN.md                  # this file
└── turbo.json
```

---

## Phase 0 — Foundations & Environment Setup

Groundwork: shell fluency, project scaffolding, database basics, and AI-assisted workflow habits.

### Basic UNIX Knowledge
- [ ] Understand general Unix system structure, principles, and folder structure
- [ ] Navigate directories; list files including hidden ones
- [ ] Create/delete files and folders; move and copy between directories
- [ ] Use `ls`, `cd`, `pwd`, `cat`, `grep` for everyday file management
- [ ] Edit files with a CLI editor (`vi` or `nano`) — insert vs command mode
- [ ] Understand and set permissions: read/write/execute; use `chmod`, `chown`, `chgrp`
- [ ] Use `bash` to run commands/scripts, set env variables, customize shell environment
- [ ] Use a package manager (`apt`/`yum`/`pacman`) to install/update packages
- [ ] Troubleshoot networking with `ping`, `traceroute`, `netstat`
- [ ] Manage processes with `ps`, `top`, `kill`
- [ ] Write a shell script to automate a repetitive task (backup, log analysis, file transfer)
- [ ] Compress/decompress with `gzip` and `tar`
- [ ] Securely access/transfer files with `ssh` and `scp`
- [ ] Monitor system performance with `dstat`/`sar`
- [ ] Analyze logs with `grep`/`awk`
- [ ] Back up and restore data with `rsync`/`tar`

### AI Coding Tools Setup & Daily Workflow
- [ ] Learn the modes of major AI tools: GitHub Copilot (completion/chat/workspace), Cursor (tab/cmd+K/chat/composer), Claude Code (terminal agent)
- [ ] Understand completion vs chat vs agent modes and when each applies
- [ ] Learn to provide effective context: file references, @-mentions, selections, clear instructions
- [ ] Learn effective prompt patterns ("implement this interface", "refactor to match this pattern", "write tests for this function")
- [ ] Learn anti-patterns to avoid: blind acceptance, using AI for code you don't understand, skipping review
- [ ] Understand how AI tools read a codebase (indexing, embeddings, context window limits)
- [ ] Install and configure at least 2 AI coding tools in your dev environment
- [ ] Use inline completion effectively (accept/modify/reject judgment)
- [ ] Implement one small feature end-to-end using chat/agent mode, with your own review and corrections
- [ ] Use AI to explain unfamiliar code in a codebase you're onboarding to
- [ ] Use AI to write tests for an existing function — document what it got right vs what you fixed
- [ ] Document one example where you rejected an AI suggestion, and why

### Express.js Basics
- [x] Create and use custom Express.js middlewares
- [ ] Understand middleware execution order and request flow
- [x] Validate request data using a middleware-based validation library
- [x] Configure centralized error handling and consistent API error formatting
- [ ] Configure CORS using the `cors` package
- [ ] Upload/process files using `multer`
- [ ] Serve static files
- [ ] Configure and use a template engine
- [x] Debug common middleware/request-processing issues _(found & fixed a missing `return` in `deleteUserController` that let a 404 response fall through into a second `res.send()` — caught by the new DELETE 404 test)_

### Setup Express.js Project
- [x] Initialize a basic Express.js application via npm
- [x] Create and organize API routes
- [x] Handle HTTP request/response objects
- [x] Create controller functions and wire them to routes
- [ ] Configure global middlewares
- [x] Parse JSON bodies and implement basic request validation
- [x] Run and test the application locally _(verified the app boots, connects to Postgres, and its routes work end-to-end via the Supertest suite)_
- [x] Debug common routing/middleware issues _(same `deleteUserController` fix above)_
- [ ] Configure basic API documentation with Swagger

### SQL / SQL Queries (PostgreSQL)
- [ ] Explain what SQL is and its purpose; SQL vs NoSQL
- [ ] Write `SELECT` queries with `WHERE` filtering
- [ ] Use `JOIN` and explain the different join types
- [ ] Use `INSERT`, `UPDATE`, `DELETE` — and explain why the latter two need care
- [ ] Use `GROUP BY` and `ORDER BY`
- [ ] Explain primary keys and foreign keys and how they relate

### Database Migrations
- [ ] Explain what a database migration is and why it matters
- [ ] Give an example of a typical migration
- [ ] Explain how migrations version-control schema changes
- [ ] Explain "up" vs "down" migrations
- [ ] Identify migration risks and mitigation strategies
- [ ] Know common migration tools/libraries
- [ ] Explain how migrations preserve data integrity
- [ ] Explain why migrations must be tested before hitting production
- [ ] Explain what seeds are and what data belongs in them

### PostgreSQL Basics
- [ ] Create tables/databases
- [ ] Populate and query tables
- [ ] Perform table joins
- [ ] Define and use foreign keys
- [ ] Use aggregate functions
- [ ] Perform updates/deletions safely
- [ ] Use transactions

---

## Phase 1 — Core Backend Development

Building real backend capability: a working CRUD app, ORM mastery, caching, transactional email, logging, and dependency hygiene.

### Basic BE Application (as a frontend dev leveling up)
- [ ] Understand the request-response cycle, HTTP methods, status codes, REST API design
- [x] Pick a backend framework (NestJS, Express, or Fastify) and learn its core concepts
- [x] Implement routing, middleware, request validation, and error handling
- [ ] Implement authentication: compare session-based vs token-based (JWT); build login/register and protect routes
- [x] Connect to a database (PostgreSQL) and use an ORM/ODM for basic queries
- [x] Design and implement CRUD endpoints and data models _(full Create/Read/Update/Delete done for `users`)_
- [ ] **Practice deliverable:** build a CRUD app with:
  - [x] A chosen Node.js framework
  - [ ] Authentication (register, login, protected routes)
  - [ ] At least 2 CRUD resources (e.g., posts & comments, products & categories) _(only `users` so far)_
  - [x] Real database read/write operations

### TypeORM
- [ ] Understand TypeORM architecture: DataSource, Entity, Repository, EntityManager
- [ ] Understand differences between Repository, EntityManager, and QueryBuilder
- [ ] Understand entity lifecycle hooks and subscribers
- [ ] Understand entity relationships: OneToOne, OneToMany, ManyToOne, ManyToMany
- [ ] Understand eager vs lazy loading
- [ ] Understand database transactions
- [ ] Understand why migrations are preferred over `synchronize`
- [ ] Understand indexes and their performance impact
- [ ] Understand common ORM performance pitfalls: N+1 queries, over-fetching
- [ ] Know when to drop to raw SQL instead of ORM abstractions
- [ ] Learn TypeORM CLI basics
- [x] Set up and configure TypeORM with env-based connection config
- [x] Create entities and repositories; implement CRUD via repositories _(full CRUD implemented for `UserEntity`, including `preload()`+`save()` for partial updates — see [TYPEORM_GUIDE.md](TYPEORM_GUIDE.md))_
- [ ] Define entity relationships; create custom repositories/services
- [ ] Use QueryBuilder for complex queries; implement pagination, filtering, sorting
- [ ] Use eager and explicit relation loading
- [ ] Create and execute transactions
- [ ] Create, run, and roll back migrations
- [ ] Create indexes and modify tables/columns via migrations
- [ ] Implement entity validation and lifecycle hooks
- [ ] Create computed values via getters/virtual properties
- [ ] Debug generated SQL and optimize slow queries
- [ ] Use raw SQL where ORM abstractions become limiting

### Redis for Caching
- [ ] Explain what Redis is and how it's used for caching
- [ ] Explain Redis's in-memory model and why it suits caching
- [ ] Explain how caching improves application performance
- [ ] Implement cache eviction; know Redis's eviction strategies
- [ ] Explain cache hit vs cache miss
- [ ] Ensure data consistency between the primary DB and the Redis cache
- [ ] Handle a full/out-of-memory cache scenario
- [ ] Discuss drawbacks/challenges of caching with Redis
- [ ] Set up monitoring to know when to scale/modify the caching strategy

### Sendgrid/Mailjet (Email Provider) Integration
- [ ] Sign up and generate an API key for email sending
- [ ] Integrate the provider's SDK into the app
- [ ] Send a test email to your own address
- [ ] Design and use a transactional welcome-email template
- [ ] Configure the app to use the provider's SMTP relay
- [ ] Create and use a dynamic template with placeholders
- [ ] Set up webhooks for email event notifications
- [ ] Enable two-factor authentication on the provider account
- [ ] Authenticate your sending domain for deliverability

### npm Audit / Yarn Audit
- [ ] Understand what `npm audit`/`yarn audit` does and how to read its report
- [ ] Understand how to upgrade affected and dependent packages
- [ ] Run the audit regularly on the project
- [ ] Fix issues reported by the audit

### [JS BE] Exceptions Logging
- [ ] Understand why exception logging matters for debugging/maintenance
- [ ] Study `try...catch` and write code blocks with proper exception handling
- [ ] Research logging libraries (Winston, Morgan) and their differences/use-cases
- [ ] Set up Winston in a backend project and log exceptions/errors
- [ ] Use logging levels (info, warn, error, etc.) and customize log output format
- [ ] Restrict max log file size using Winston's `FileTransport` (log rotation)

---

## Phase 2 — Testing & Logging Quality

Verifying correctness and observability: unit/integration testing, mocking, and coverage discipline.

### [JS BE] Testing Basics
- [ ] Understand unit testing fundamentals and its importance
- [x] Set up a project with Mocha/Chai or Jest _(used Vitest instead — ESM/TS-native, Jest-compatible API; see chat history for the tradeoff. `jest`/`ts-jest` were installed and then removed to avoid running two test runners)_
- [x] Write test cases with assertions for basic JS functions _(assertions written against the `users` API, not standalone functions — close enough in spirit; revisit if you want pure-function unit tests too)_
- [ ] Understand mocking/stubbing with Sinon.js; replace real dependencies with mocks/stubs
- [x] Write tests for asynchronous code (callbacks, promises, async/await)
- [x] Use Supertest to test Express.js routes / RESTful endpoints
- [x] Set up a separate test database configuration with Sequelize _(TypeORM, not Sequelize — separate `pdp_test` DB wired via `.env.test` + Vitest `setupFiles`)_
- [x] Write tests that interact with the database via Sequelize _(via TypeORM against the real `pdp_test` DB in `apps/api/test/user.routes.test.ts`)_
- [ ] Explore supporting libraries: Faker.js (fake data), Chai-HTTP (HTTP assertions), Nock (mocking HTTP requests)

### [JS BE] Code Coverage
- [ ] Understand what code coverage measures
- [ ] Understand statement, branch, function, and line coverage differences
- [ ] Understand why high coverage ≠ high-quality tests
- [ ] Understand how coverage tools integrate with test frameworks
- [ ] Know common Node.js coverage tools (`nyc`, Jest coverage)
- [ ] Understand coverage thresholds and quality gates
- [ ] Understand limitations/misconceptions of coverage metrics
- [x] Generate coverage reports with `nyc` or Jest _(via Vitest's `@vitest/coverage-v8` provider — `npm run test:coverage`)_
- [x] Configure coverage collection for the project _(`coverage` block in `vitest.config.ts`)_
- [ ] Read/analyze reports and identify untested or weakly tested code _(report generated — `error.middleware.ts` is the weak spot at ~54%, since only the Zod/HttpError branches are exercised, not the generic 500 path; worth a look before checking this off)_
- [ ] Configure minimum coverage thresholds
- [ ] Exclude unnecessary files from coverage reports
- [x] Use HTML and LCOV report formats _(`reporter: ["text", "html", "lcov"]` in `vitest.config.ts`)_
- [x] Improve coverage meaningfully (not with throwaway tests) _(87.91% stmts / 93.33% funcs on `apps/api`, from real endpoint behavior tests — not padding)_
- [ ] Understand how mocking affects coverage results
- [ ] Debug situations where coverage is reported incorrectly

### PageSpeed Insights
- [ ] Understand what PageSpeed Insights and the Lighthouse extension do
- [ ] Read and understand their reports
- [ ] Analyze the project with Lighthouse and PageSpeed Insights
- [ ] Fix issues identified in the reports

---

## Phase 3 — Architecture, Design Patterns & DFA

Design-first thinking, modeling, and the classic GoF patterns — the conceptual toolkit behind Phase 4's deliverables.

### Understanding of Design First Approach (DFA)
- [ ] Define the design-first approach and its key benefits/drawbacks
- [ ] Compare design-first vs code-first vs agile methodologies
- [ ] Identify tools for creating/maintaining an API spec in a design-first workflow
- [ ] Explain why visual representations (wireframes, UML) matter
- [ ] Explain how design-first enables early stakeholder feedback
- [ ] Explain how to handle requirement changes within a design-first process
- [ ] Identify collaboration roles/stakeholders in design-first work
- [ ] Walk through kicking off a new project using design-first, pre-coding
- [ ] Read the COAX DFA Wiki page / template (`coaxsoft.github.io/coax_dfa`)

### Basic Modeling Techniques (C4 Model, Read-Only)
- [ ] Understand Data Flow Diagram notations: external entity, process, data store, data flow
- [ ] Understand what an ERD is and common tools to build one
- [ ] Understand process modeling: flowcharts and activity diagrams
- [ ] Be able to read C4 UML diagrams at different levels (Context, Container, Component, Code)
- [ ] **Practice:** draw a Data Flow Diagram and an ERD for a real/commercial project
- [ ] **Practice:** read and describe an existing C4 UML diagram set

### Design Patterns Lab (`packages/design-patterns-lab`)

#### State Pattern
- [ ] Define the State pattern and a real-world use case
- [ ] Identify its key implementation elements, advantages, and drawbacks
- [ ] Explain how it eliminates long conditionals/switch statements
- [ ] Explain its relation to the Single Responsibility Principle
- [ ] **Implement:** a digital media player with `State` interface (`play()`, `pause()`, `stop()`)
  - [ ] Concrete states: `PlayingState`, `PausedState`, `StoppedState`
  - [ ] `MediaPlayer` class delegating actions to its current state
  - [ ] Demonstrate state transitions driven by user actions

#### Iterator Pattern
- [ ] Define the Iterator pattern and a real-world use case
- [ ] Explain how it hides underlying collection representation
- [ ] Explain how it supports varying traversal strategies
- [ ] **Implement:** a library management system
  - [ ] `BookCollection` class with a method returning an `Iterator`
  - [ ] `Iterator` interface (`hasNext()`, `next()`)
  - [ ] `BookIterator` implementation tracking position over the collection
  - [ ] Demonstrate iterating books without exposing storage details

#### Prototype Pattern
- [ ] Define the Prototype pattern vs the Factory pattern
- [ ] Explain when object creation cost justifies cloning over instantiation
- [ ] Explain how it supports "composition over inheritance"
- [ ] **Implement:** a game NPC system
  - [ ] `NPC` abstract class with `clone()` and fields (name, health, attack power)
  - [ ] Concrete subclasses (e.g., `Zombie`, `Goblin`) implementing `clone()`
  - [ ] Prototype instances cloned at runtime instead of freshly instantiated

#### Builder Pattern
- [ ] Define the Builder pattern vs the Factory pattern
- [ ] Identify key components/classes and their step-by-step construction role
- [ ] Explain how it improves readability/flexibility for complex objects
- [ ] **Implement:** a restaurant meal ordering system
  - [ ] `Meal` class (main course, side, drink)
  - [ ] `MealBuilder` interface with setter methods and `build()`
  - [ ] Concrete builders (`BurgerMealBuilder`, `PizzaMealBuilder`)
  - [ ] `MealDirector` orchestrating builder calls
  - [ ] Demonstrate building different meal types via the director

#### Abstract Factory Pattern
- [ ] Define Abstract Factory vs Factory Method
- [ ] Explain how it supports loose coupling and families of related objects
- [ ] Explain how it handles adding new product types, and its maintainability trade-offs
- [ ] **Implement:** a cross-platform UI toolkit
  - [ ] `UIElement` interface with `render()`
  - [ ] Concrete Button/Checkbox/Textbox classes per platform (Windows/MacOS/Linux)
  - [ ] `UIFactory` interface (`createButton()`, `createCheckbox()`, `createTextbox()`)
  - [ ] Concrete factories per platform
  - [ ] Demonstrate selecting a factory by platform to render correct UI elements

#### Factory Method Pattern
- [ ] Define Factory Method vs Simple Factory
- [ ] Explain how it supports "programming to an interface, not an implementation"
- [ ] Explain its effect on flexibility/maintainability and complex object creation
- [ ] **Implement:** a drawing application
  - [ ] `Shape` abstract class/interface with `draw()`
  - [ ] Concrete shapes: `Circle`, `Square`, `Rectangle`
  - [ ] `ShapeFactory.getShape(shapeType)` returning the right concrete instance
  - [ ] Demonstrate creating/drawing shapes from user input via the factory

### Model Context Protocol (MCP) Theory
- [ ] Understand the problem MCP solves (standardizing tool integration vs custom glue code)
- [ ] Understand the three core primitives: Tools, Resources, Prompts
- [ ] Understand client-server architecture and transports (stdio, HTTP/SSE)
- [ ] Understand how MCP differs from plain LLM function calling
- [ ] Understand how MCP relates to (and differs from) RAG
- [ ] Know real-world MCP servers (GitHub, filesystem, database, browser, Slack, Jira, etc.)
- [ ] Understand configuration basics (e.g., `claude_desktop_config.json`, Cursor, Copilot)
- [ ] Explain MCP in plain language to a teammate
- [ ] Install and configure at least 2 community MCP servers and demonstrate them working
- [ ] Identify 3 scenarios in this project where MCP would help (e.g., DB, Jira, internal docs access)
- [ ] Explain the difference between a Tool, a Resource, and a Prompt with concrete examples

---

## Phase 4 — Advanced Features, Real-Time & Complex Deliverables

The heaviest phase: real-time communication plus two full DFA + Proof-of-Concept deliverables that must survive adversarial review.

### Websockets
- [ ] Understand what WebSockets are and the handshake process
- [ ] Understand `emit` vs `broadcast` events
- [ ] Implement receiving and emitting events
- [ ] Implement broadcasting events
- [ ] Implement creating/joining rooms
- [ ] Implement emitting events with callbacks
- [ ] Implement WebSocket-based client-server communication
- [ ] Use WebSocket connections for real-time messaging/notifications
- [ ] Implement full bidirectional communication
- [ ] **Practice deliverable:** a simple chat app with:
  - [ ] File attachments support
  - [ ] Group chat / room support

### Shopping Cart with Stock Awareness (`packages/cart-service`)

Design the backend for an e-commerce cart where stock changes constantly (purchases, restocking, discontinuation) and the cart must behave honestly about what can actually be bought.

**Must support:**
- [ ] Add product to cart with chosen quantity
- [ ] Change quantity of a cart item, or remove it
- [ ] View cart with current prices and current availability
- [ ] Initiate checkout — cart transitions into holding stock for payment

**Must always hold true:**
- [ ] Cart never lets a customer reach checkout with an unfulfillable quantity
- [ ] Two customers can never both successfully buy the last unit of a product
- [ ] The price shown at checkout is the price actually charged
- [ ] Cart never silently drops/modifies an item without telling the customer

**Situations the design must explicitly address:**
- [ ] Situation 1 — customer added 3 units yesterday, only 1 remains today: what does the cart show this morning?
- [ ] Situation 2 — two customers each hold the last unit; one checks out first: what happens to the second, and when do they find out?
- [ ] Situation 3 — price changes from $50 → $60 while sitting in a cart: what price is shown, what price is paid?
- [ ] Situation 4 — a product in 8 active carts is discontinued: what happens to those carts/customers?
- [ ] Situation 5 — a cart sits open for 6 weeks: what state is it in on return?

**Deliverables:**
- [ ] DFA document following the COAX template (`coaxsoft.github.io/coax_dfa`) — explain in-doc why any section is skipped, never silently omit
- [ ] Proof-of-Concept: the checkout reservation step (cart → held stock)
  - [ ] Data layer for stock/reservation state
  - [ ] Reservation logic for the "hold stock at checkout" transition
  - [ ] Test: two customers race to reserve the last unit — one succeeds, one gets a clear, specific rejection
  - [ ] Tests proving the race produces the correct outcome on both sides

**Must be defended in review:**
- [ ] Situation 2 handling, against "just subtract stock when they add to cart"
- [ ] Situation 3 handling, against "always charge whatever the current price is"
- [ ] Situation 1 handling, against "let them try and fail at checkout"

### Product Reviews & Ratings (`packages/reviews-service`)

Design the backend for product reviews: star rating (1–5) + optional text, on products actually purchased, with basic staff moderation.

**Must support:**
- [ ] Submit a review (rating + optional text) for a purchased product
- [ ] Edit or delete your own review
- [ ] Product page shows reviews with average rating and total count
- [ ] Staff can hide a review without permanently deleting it

**Must always hold true:**
- [ ] A customer can only review products they've actually bought
- [ ] A customer has at most one review per product
- [ ] The displayed average reflects only visible reviews — never hidden, never deleted
- [ ] A hidden review never appears on the product page

**Situations the design must explicitly address:**
- [ ] Situation 1 — customer reviews, then returns the product next day: what happens to the review?
- [ ] Situation 2 — customer with 5 reviews deletes their account: what happens to reviews and product averages?
- [ ] Situation 3 — a product with 3 reviews is removed from the catalog: what does the customer see in their review history?
- [ ] Situation 4 — customer edits a review from 5★ to 1★: how does the displayed average end up reflecting the new value?

**Deliverables:**
- [ ] DFA document following the COAX template — explain in-doc why any section (e.g. C4, if no architectural change) is skipped
- [ ] Proof-of-Concept: average rating calculation under realistic conditions
  - [ ] Data layer for reviews and visibility state
  - [ ] Read path producing the displayed average
  - [ ] Tests proving correctness across: created → edited (rating changed) → deleted → hidden by staff → unhidden

**Must be defended in review:**
- [ ] Situations 1, 2, 3 handling, against "just delete the review"
- [ ] Average-rating approach, against "compute it on every page load, problem solved"

---

## Phase 5 — Frontend & Security

Deepening Next.js and closing out with application security fundamentals.

### Next.js Advanced (`apps/web`)
- [ ] Understand custom server setup with Next.js — when it's needed vs not
- [ ] Use `next/image` — responsive sizes, priority loading, external image domains
- [ ] Use `next/font` — self-hosting fonts, eliminating layout shift
- [ ] Measure performance with Next.js analytics, Web Vitals, Lighthouse; identify bottlenecks
- [ ] Understand Multi Zones — composing multiple Next.js apps under one domain
- [ ] Understand advanced rendering: ISR, dynamic imports/lazy loading, streaming
- [ ] Use API routes: serverless functions, middleware, edge functions
- [ ] Understand i18n: built-in routing, locale detection, translation strategies
- [ ] Configure per-environment env variables and custom Webpack/Babel/TypeScript setup
- [ ] Implement custom error pages (404, 500) and error boundaries
- [ ] Compare deployment trade-offs: Vercel vs AWS vs self-hosted
- [ ] Set up a custom Express.js server with Next.js
- [ ] Use `next/image`/`next/font` optimizations effectively in the app
- [ ] Measure and improve app performance using Web Vitals
- [ ] Implement ISR for a page needing periodic regeneration
- [ ] Implement backend functionality via API routes
- [ ] Deploy the app to Vercel or AWS

### Code Security Principles
- [ ] Study secure coding practices to prevent SQL injection, XSS, and other common vulnerabilities (OWASP Top 10 as a starting point)
- [ ] Use a static code analysis tool to identify vulnerabilities
- [ ] Ensure secrets (API keys, passwords, credentials) are never committed to the repo
- [ ] Implement robust input validation and sanitize data before processing
- [ ] Understand secure handling of sensitive data (credit card numbers, PII)
- [ ] Practice output encoding to prevent XSS on user-generated content
- [ ] Implement error handling that avoids leaking sensitive information
- [ ] Implement security headers (CSP, X-Frame-Options, etc.)
- [ ] Implement secure session management to prevent session hijacking
- [ ] Keep dependencies updated and monitored for security advisories
- [ ] Answer/defend: input validation & sanitization approach, with an insecure-vs-mitigated example
- [ ] Answer/defend: the Principle of Least Privilege and its importance
- [ ] Answer/defend: what matters when generating error messages
- [ ] Answer/defend: protecting sensitive data even if a DB dump is stolen
- [ ] Answer/defend: what SQL injection is and how to protect against it
- [ ] Answer/defend: risks of outdated libraries, and how to track/fix them
- [ ] Answer/defend: what matters when adding a logger to application actions
- [ ] Answer/defend: Role-Based Access Control (RBAC) vs other access control models, and an implementation approach
- [ ] Answer/defend: why monitoring/logging matters in an RBAC system, and what activities to log

### Cross-Site Request Forgery (CSRF)
- [ ] Explain CSRF and how it differs from XSS
- [ ] Explain how a typical CSRF attack works
- [ ] Explain the risks a successful CSRF attack poses to users
- [ ] Explain how anti-CSRF tokens prevent CSRF
- [ ] Explain how the `SameSite` cookie attribute prevents CSRF
- [ ] Explain how `Referer`/`Origin` headers help mitigate CSRF
- [ ] Explain why state-changing operations are more vulnerable to CSRF
- [ ] Explain why state-changing operations should avoid HTTP GET
- [ ] Explain how confirmation/re-authentication prompts reduce CSRF impact
- [ ] Explain how an attacker might combine XSS and CSRF in one attack

---

## Final Completion Checklist

- [ ] Phase 0 — Foundations & Environment Setup complete
- [ ] Phase 1 — Core Backend Development complete
- [ ] Phase 2 — Testing & Logging Quality complete
- [ ] Phase 3 — Architecture, Design Patterns & DFA complete
- [ ] Phase 4 — Advanced Features, Real-Time & Complex Deliverables complete
  - [ ] Shopping Cart DFA + PoC reviewed and defended
  - [ ] Product Reviews DFA + PoC reviewed and defended
- [ ] Phase 5 — Frontend & Security complete
- [ ] All DFA documents stored under `docs/dfa/` and linked from their respective package README
- [ ] All PoC packages have passing test suites wired into `turbo.json` pipelines
- [ ] Final PDP review scheduled with manager/mentor
