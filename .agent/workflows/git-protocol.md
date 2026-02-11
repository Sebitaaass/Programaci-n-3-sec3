---
description: Git Flow Strategy and Branching Rules
---

# Git Flow Strategy

Every contribution must follow this simplified Git Flow.

## Branches
- `main`: Stable and functional code ONLY.
- `feature/users`: Login, Register, and User Management.
- `feature/productos`: Products listing, detail, and Admin CRUD.
- `feature/cart`: Shopping cart logic and UI.

## Workflow Rules
1. **Branching**: Always branch out from `main`.
2. **Commits**: Use descriptive subjects.
3. **Pushing**: Push your feature branch to remote.
4. **Pull Requests**: Create a PR from `feature/*` to `main`.
5. **No direct commits to main**: Never edit `main` directly.

// turbo-all
## Branch Switching Example
To start a new product feature:
```powershell
git checkout main
git pull origin main
git checkout -b feature/productos
```
