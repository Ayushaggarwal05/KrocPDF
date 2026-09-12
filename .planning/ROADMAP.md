# Engineering Implementation Roadmap

## Milestone 1: Category Killer (v1.0.0) — [COMPLETED]
- Details archived in [v1.0-ROADMAP.md](file:///d:/Coding/Bus-Driver/.planning/milestones/v1.0-ROADMAP.md)

## Milestone 2: Expanding to PNG: The Transparency Challenge (v2.0) — [COMPLETED]
- Details archived in [v2.0-ROADMAP.md](file:///d:/Coding/Bus-Driver/.planning/milestones/v2.0-ROADMAP.md)

---

## 🚀 Active Milestone: Milestone 3 — Multi-Document Assembly: The Merge PDF Engine (v2.1)

- [ ] **Phase 15: Dual-Engine Merge PDF Architecture & Data Contracts**
  - Define DTOs, Redis schemas, API contracts, and S3 batch key protocols for merging multiple PDFs.
- [ ] **Phase 16: Worker Service PDF Assembly (`pdfcpu`)**
  - Implement Go worker merge job handler using `pdfcpu.MergeCreateFile` with error recovery and memory management.
- [ ] **Phase 17: Backend API Gateway Merge Endpoints & SSE**
  - Implement NestJS presigned batch upload endpoints and Redis Streams dispatcher for multi-PDF merge jobs.
- [ ] **Phase 18: Client-Side Instant WASM / `pdf-lib` Merging Engine**
  - Implement browser-based `localPdfMerger.ts` using `pdf-lib`, drag-and-drop PDF reordering, and instant local assembly.
- [ ] **Phase 19: Full UI Activation & Obsidian/Emerald Tool Page**
  - Activate `/merge-pdf` route, update Navbar/Footer/ToolGrid to mark Merge PDF as live, update JSON-LD / SEO schemas.
- [ ] **Phase 20: Monorepo Verification & E2E Testing**
  - Cross-service verification tests (`tsc`, `lint`, `go test`, E2E multi-PDF merge verification).
