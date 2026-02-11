# Casual Duo Flow (Success + Recovery)

Goal: Start quickly, switch turns confidently, recover from mistakes without losing trust.

```mermaid
flowchart TD
  A[Open app link] --> B[Preset list visible]
  B --> C[Select preset]
  C --> D[Tap Start]
  D --> E[Timer view - adaptive 80/20]
  E --> F[Tap active zone to switch turns]
  F --> E
  E --> G[Accidental tap occurs]
  G --> H[Tap Undo]
  H --> E
  E --> I[Pause via inactive strip]
  I --> J[Paused 50/50 view]
  J --> E
  E --> K[Game ends (time zero)]
```
