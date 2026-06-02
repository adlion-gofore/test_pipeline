---
title: "Code Examples"
description: "Syntax highlighting and code block examples across multiple languages."
weight: 10
---

## TypeScript

```typescript
import { createApp, ref, computed } from 'vue';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
}

const useUsers = () => {
  const users = ref<User[]>([]);
  const loading = ref(false);

  const admins = computed(() =>
    users.value.filter(u => u.role === 'admin')
  );

  const fetchUsers = async (): Promise<void> => {
    loading.value = true;
    try {
      const res = await fetch('/api/users');
      users.value = await res.json();
    } finally {
      loading.value = false;
    }
  };

  return { users, loading, admins, fetchUsers };
};

export default createApp({
  setup() {
    const { users, loading, fetchUsers } = useUsers();
    fetchUsers();
    return { users, loading };
  },
});
```

## Go

```go
package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "time"
)

type Server struct {
    addr    string
    timeout time.Duration
}

func NewServer(addr string) *Server {
    return &Server{addr: addr, timeout: 30 * time.Second}
}

func (s *Server) Start(ctx context.Context) error {
    mux := http.NewServeMux()
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        fmt.Fprintln(w, "ok")
    })

    srv := &http.Server{Addr: s.addr, Handler: mux, ReadTimeout: s.timeout}

    go func() {
        <-ctx.Done()
        srv.Shutdown(context.Background())
    }()

    log.Printf("listening on %s", s.addr)
    return srv.ListenAndServe()
}
```

## Python

```python
from dataclasses import dataclass, field
from typing import Optional
import httpx
import asyncio


@dataclass
class Config:
    base_url: str
    api_key: str
    timeout: float = 10.0
    retries: int = 3
    headers: dict = field(default_factory=dict)


class APIClient:
    def __init__(self, config: Config) -> None:
        self.config = config
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        self._client = httpx.AsyncClient(
            base_url=self.config.base_url,
            headers={"Authorization": f"Bearer {self.config.api_key}"},
            timeout=self.config.timeout,
        )
        return self

    async def __aexit__(self, *args):
        await self._client.aclose()

    async def get(self, path: str) -> dict:
        for attempt in range(self.config.retries):
            try:
                response = await self._client.get(path)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                if attempt == self.config.retries - 1:
                    raise
```

## SCSS

```scss
@use 'tokens/breakpoints' as *;

.card {
  display: flex;
  flex-direction: column;
  gap: var(--nti-space-4);
  padding: var(--nti-space-6);
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--nti-radius-lg);
  transition: box-shadow 150ms ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--md-sys-color-on-surface);
  }

  &__body {
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface-variant);
    line-height: 1.6;
  }
}

@media (min-width: $breakpoint-md) {
  .card {
    flex-direction: row;
    align-items: flex-start;
  }
}
```

## SQL

```sql
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id)        AS order_count,
    SUM(o.total)       AS lifetime_value,
    MAX(o.created_at)  AS last_order_at
FROM users u
LEFT JOIN orders o
    ON o.user_id = u.id
   AND o.status  = 'completed'
WHERE u.created_at >= NOW() - INTERVAL '90 days'
  AND u.deleted_at IS NULL
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY lifetime_value DESC
LIMIT 50;
```

## Shell

```bash
#!/usr/bin/env bash
set -euo pipefail

IMAGE="registry.example.com/app"
TAG="${1:-latest}"

echo "Building ${IMAGE}:${TAG}"

docker build \
  --platform linux/amd64 \
  --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --tag "${IMAGE}:${TAG}" \
  --tag "${IMAGE}:latest" \
  .

docker push "${IMAGE}:${TAG}"
docker push "${IMAGE}:latest"

echo "Done — pushed ${IMAGE}:${TAG}"
```

## Inline code

Use `npm install` to add dependencies. The `--save-dev` flag marks packages as `devDependencies`. Config lives in `package.json` and lock state in `package-lock.json`.
