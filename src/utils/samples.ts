/**
 * Markdown Viewer Pro - Rich Sample Documents
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import { MarkdownFile } from '../types';

export const SAMPLE_DOCUMENTS: MarkdownFile[] = [
  {
    id: 'sample-architecture',
    name: 'System-Architecture.md',
    updatedAt: Date.now() - 1000 * 60 * 30,
    sizeBytes: 4820,
    content: `# Enterprise Cloud Architecture Specification
> **Document Version:** \`v2.4.0\` | **Status:** Approved | **Author:** Lead Systems Architect

Welcome to the **Next-Gen Distributed Cloud Architecture** blueprint. This document details the end-to-end telemetry pipelines, edge routing layers, database failover topology, and operational runbooks.

---

## 1. System Topology Overview

The diagram below outlines our low-latency distributed microservices cluster communicating across multi-region Kubernetes pods.

\`\`\`mermaid
flowchart TB
    subgraph ClientLayer["🌐 Edge & Ingress Layer"]
        User["Client Browser / Mobile App"]
        CDN["Cloudflare Edge Anycast CDN"]
        Gateway["Kong API Gateway & Rate Limiter"]
    end

    subgraph AuthCluster["🔐 Identity & Access"]
        OAuth["OAuth 2.1 / OIDC Provider"]
        Vault["HashiCorp Secrets Vault"]
    end

    subgraph CoreServices["⚡ Microservices Mesh (gRPC / REST)"]
        AuthSvc["Auth Service (Go)"]
        DocSvc["Document Engine (Rust)"]
        SyncSvc["Real-Time Sync (Node.js)"]
        AnalyticsSvc["Telemetry & Metrics (Python)"]
    end

    subgraph DataStorage["💾 Resilient Persistence Tier"]
        Redis[("Redis Cluster (In-Memory Cache)")]
        Postgres[("PostgreSQL Aurora Primary")]
        Replica[("Read Replica Pool")]
        Kafka[("Apache Kafka Event Stream")]
        S3[("Encrypted S3 Document Vault")]
    end

    User -->|TLS 1.3 HTTP/3| CDN
    CDN --> Gateway
    Gateway -->|JWT Validation| AuthCluster
    Gateway -->|Reverse Proxy| CoreServices

    DocSvc --> Redis
    DocSvc --> Postgres
    Postgres -.->|Async Replication| Replica
    SyncSvc --> Kafka
    Kafka --> AnalyticsSvc
    DocSvc --> S3
\`\`\`

---

## 2. Authentication & Handshake Flow

The sequence below illustrates the zero-trust token exchange between client applications, API gateway, and internal microservices.

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Client as 💻 Web / Desktop App
    participant GW as 🛡️ API Gateway
    participant Auth as 🔑 Auth Service
    participant DB as 🗄️ PostgreSQL
    participant Kafka as 📨 Event Bus

    Client->>GW: POST /api/v1/auth/login { credentials }
    GW->>Auth: Validate Credentials & MFA
    Auth->>DB: Query User Record & Permissions
    DB-->>Auth: User Verified (Active)
    Auth->>Auth: Sign Short-Lived JWT & Refresh Token
    Auth->>Kafka: Publish "user.logged_in" audit event
    Auth-->>GW: Return 200 OK + Auth Tokens
    GW-->>Client: Set HttpOnly Cookie + Bearer Token
    
    Note over Client,GW: Subsequent Authenticated Requests
    Client->>GW: GET /api/v1/documents (Bearer Token)
    GW->>GW: Verify JWT Signature (Local Cache)
    GW-->>Client: Streamed Document Payload
\`\`\`

---

## 3. High-Performance Core Engine Implementation

Below is a snippet from our high-concurrency document indexing service written in **Rust**:

\`\`\`rust
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentNode {
    pub id: String,
    pub title: String,
    pub payload_hash: u64,
    pub revision: u32,
    pub is_active: bool,
}

pub struct DocumentRegistry {
    nodes: Arc<RwLock<Vec<DocumentNode>>>,
}

impl DocumentRegistry {
    pub fn new() -> Self {
        Self {
            nodes: Arc::new(RwLock::new(Vec::new())),
        }
    }

    /// Fast async insertion with non-blocking read lock retention
    pub async fn insert_node(&self, node: DocumentNode) -> Result<usize, &'static str> {
        let mut guard = self.nodes.write().await;
        if guard.iter().any(|n| n.id == node.id) {
            return Err("Duplicate node identifier");
        }
        guard.push(node);
        Ok(guard.len())
    }
}
\`\`\`

And the corresponding **TypeScript** client SDK integration:

\`\`\`typescript
import { useState, useEffect } from 'react';

interface DocumentStreamConfig {
  endpoint: string;
  authToken: string;
  onPayload: (data: ArrayBuffer) => void;
}

export function useDocumentStream({ endpoint, authToken, onPayload }: DocumentStreamConfig) {
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const ws = new WebSocket(\`\${endpoint}?token=\${authToken}\`);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => setConnected(true);
    ws.onmessage = (event) => onPayload(event.data);
    ws.onclose = () => setConnected(false);

    return () => ws.close();
  }, [endpoint, authToken]);

  return { connected };
}
\`\`\`

---

## 4. Benchmark Performance Metrics

The table below contrasts our performance benchmarks before and after optimizing the cache eviction heuristics:

| Pipeline Stage | Legacy Engine | Rust V2 Engine | Improvement | Target SLA |
| :--- | :--- | :--- | :--- | :--- |
| **P50 Latency** | \`48.2 ms\` | \`4.1 ms\` | **+91.5% faster** | \`< 10 ms\` |
| **P99 Latency** | \`210.6 ms\` | \`18.4 ms\` | **+91.2% faster** | \`< 50 ms\` |
| **Memory Footprint** | \`1.42 GB\` | \`164 MB\` | **-88.4% usage** | \`< 250 MB\` |
| **Cold Startup** | \`4.8 s\` | \`0.22 s\` | **+95.4% faster** | \`< 1.0 s\` |
| **Concurrent Conns** | \`12,500\` | \`150,000+\` | **12x scale** | \`> 100k\` |

---

## 5. Mathematical Latency Formula

The theoretical maximum throughput $\mathcal{T}_{\text{max}}$ under Little's Law is defined as:

$$\mathcal{T}_{\text{max}} = \frac{N_{\text{workers}} \cdot (1 - \rho)}{\bar{L}_{\text{service}} + \sigma_{\text{queue}}}$$

Where:
- $N_{\text{workers}}$: Number of parallel Rayon worker threads
- $\rho$: Ingress utilization factor ($0 \le \rho < 1$)
- $\bar{L}_{\text{service}}$: Mean single-document serialization latency
- $\sigma_{\text{queue}}$: Cross-pod TCP buffer jitter

---

## 6. Document State Transitions

\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft: User Creates Document
    Draft --> InReview: Submit for Peer Review
    InReview --> ChangesRequested: Comments Added
    ChangesRequested --> Draft: Author Revises
    InReview --> Approved: 2 Sign-offs
    Approved --> Published: Automated CI/CD
    Published --> Archived: Deprecation Period
    Archived --> [*]
\`\`\`

---

## 7. Migration Checklist

- [x] Provision Multi-Region Kubernetes clusters
- [x] Configure mTLS mesh via Istio & Envoy
- [x] Setup zero-downtime Blue/Green deployment pipelines
- [ ] Migrate legacy MongoDB collections into PostgreSQL partitions
- [ ] Perform chaos engineering fault injection drills
- [ ] Finalize customer disaster recovery runbook

> 💡 **Tip:** Press \`Space\` anywhere in the file explorer to instantly preview any document with **QuickLook**!
`,
  },
  {
    id: 'sample-tech-stack',
    name: 'Tech-Stack-Deep-Dive.md',
    updatedAt: Date.now() - 1000 * 60 * 120,
    sizeBytes: 3940,
    content: `# Modern Full-Stack Technology Guide
> A curated reference covering data structures, algorithms, state machines, and language benchmarks.

---

## 1. Release Timeline & Branching Strategy

Our automated git commit branch flow follows GitFlow with trunk-based daily deployments:

\`\`\`mermaid
gitGraph
    commit id: "v1.0.0"
    branch develop
    checkout develop
    commit id: "feat(auth)"
    commit id: "feat(mermaid)"
    branch feature/zoom-pan
    checkout feature/zoom-pan
    commit id: "add-svg-zoom"
    commit id: "add-table-fullscreen"
    checkout develop
    merge feature/zoom-pan
    checkout main
    merge develop tag: "v1.1.0"
    commit id: "hotfix(scroll-spy)"
\`\`\`

---

## 2. Component Distribution

\`\`\`mermaid
pie title Memory Allocation by Module
    "Markdown Engine & AST" : 35
    "Mermaid SVG Canvas" : 25
    "Prism Syntax Tokenizer" : 20
    "Table of Contents Cache" : 10
    "Theme Stylesheet Engine" : 10
\`\`\`

---

## 3. Database Entity Relationship Model

\`\`\`mermaid
erDiagram
    USER ||--o{ DOCUMENT : owns
    USER {
        string id PK
        string email UK
        string full_name
        timestamp created_at
    }
    DOCUMENT ||--|{ REVISION : contains
    DOCUMENT {
        string id PK
        string user_id FK
        string filename
        string content_hash
        boolean is_archived
    }
    REVISION {
        string id PK
        string document_id FK
        integer version_number
        text markdown_diff
        timestamp committed_at
    }
    DOCUMENT ||--o{ TAG : categorized_by
    TAG {
        string id PK
        string name
        string color_hex
    }
\`\`\`

---

## 4. Multi-Language Code Implementations

### Python Data Pipeline
\`\`\`python
import asyncio
from typing import AsyncGenerator, Dict, Any

async def fetch_document_stream(doc_id: str) -> AsyncGenerator[Dict[str, Any], None]:
    """Simulates asynchronous generator reading from distributed stream."""
    chunks = [
        {"chunk_id": 0, "text": "# Hello World"},
        {"chunk_id": 1, "text": "Streaming markdown content in real time."},
        {"chunk_id": 2, "text": "Zero-config markdown rendered successfully."}
    ]
    for chunk in chunks:
        await asyncio.sleep(0.05)
        yield chunk

# Example usage
async def main():
    async for item in fetch_document_stream("doc-994"):
        print(f"Received chunk {item['chunk_id']}: {len(item['text'])} bytes")

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

### SQL Complex Analytical Query
\`\`\`sql
WITH DailyDocumentStats AS (
    SELECT 
        DATE_TRUNC('day', d.created_at) AS log_date,
        u.id AS user_id,
        u.email,
        COUNT(d.id) AS total_docs_created,
        SUM(LENGTH(d.content)) AS total_bytes_written
    FROM users u
    INNER JOIN documents d ON d.user_id = u.id
    WHERE d.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY 1, 2, 3
)
SELECT 
    log_date,
    COUNT(DISTINCT user_id) AS active_authors,
    AVG(total_docs_created) AS avg_docs_per_user,
    ROUND(SUM(total_bytes_written) / 1024.0 / 1024.0, 2) AS total_megabytes
FROM DailyDocumentStats
GROUP BY log_date
ORDER BY log_date DESC;
\`\`\`

---

## 5. Key Highlights

1. **Zero-Config Mermaid:** Type standard mermaid code blocks; diagrams render instantly.
2. **Spacebar QuickLook:** Browse files in the sidebar and press \`Space\` to pop open a fast preview!
3. **12 Aesthetic Themes:** GitHub Dark, Dracula, Nord, Cyberpunk, Sepia Editorial, and more.
4. **Zoom & Pan:** Click the expand icon on any table, code block, or diagram for interactive controls.
`,
  },
  {
    id: 'sample-cheat-sheet',
    name: 'Markdown-Cheatsheet.md',
    updatedAt: Date.now() - 1000 * 60 * 240,
    sizeBytes: 2580,
    content: `# Ultimate Markdown & Formatting Cheat Sheet

This document serves as an exhaustive reference test suite for typography, lists, blockquotes, tables, and diagrams.

---

## Typography & Inline Formats

- **Bold text** using \`**bold**\` or \`__bold__\`
- *Italic text* using \`*italic*\` or \`_italic_\`
- ***Bold and italic*** using \`***text***\`
- ~~Strikethrough~~ using \`~~strikethrough~~\`
- \`Inline code\` using backticks
- [Hyperlink to Suhail's Website](https://suhail.top)
- Subscript and Superscript: H~2~O and X^2^

---

## Blockquotes & Callouts

> 📘 **Architectural Rule**
> Always decouple the storage layer from presentation logic.
> 
> > Nested blockquotes provide secondary guidance and edge case details.

---

## Complex Nested Lists

1. **Frontend Architecture**
   - React 19 + TypeScript
   - Motion for smooth animations
   - Tailwind CSS for modern aesthetics
2. **Markdown Parsing Pipeline**
   1. Lexical Tokenization (GFM)
   2. KaTeX Math Equations ($f(x) = \int_0^\infty e^{-t} t^{x-1} dt$)
   3. Mermaid Diagram AST Generator
   4. Prism Syntax Highlighting

---

## Class Diagram Example

\`\`\`mermaid
classDiagram
    class MarkdownDocument {
        +String id
        +String title
        +String content
        +Date updatedAt
        +render() HTMLElement
        +exportPdf() Blob
    }
    class ThemeEngine {
        +ThemeId currentTheme
        +setTheme(ThemeId id)
        +getVariables() Object
    }
    class TocParser {
        +List items
        +extractHeadings(String markdown)
    }

    MarkdownDocument --> ThemeEngine : styled by
    MarkdownDocument --> TocParser : parsed with
\`\`\`

---

## Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>Space</kbd> | **QuickLook** | Instant floating preview of selected file |
| <kbd>Esc</kbd> | **Close Modal** | Dismiss zoom, quicklook, or changelog dialogs |
| <kbd>Ctrl</kbd> + <kbd>E</kbd> | **Toggle Mode** | Switch between View, Split, and Edit |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | **Export / Save** | Save active document or export HTML |
| <kbd>Ctrl</kbd> + <kbd>+</kbd> | **Zoom In** | Increase document typography size |
| <kbd>Ctrl</kbd> + <kbd>-</kbd> | **Zoom Out** | Decrease document typography size |
`,
  }
];
