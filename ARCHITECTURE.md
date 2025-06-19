# Project Architecture

## Feature Development

All new features **must** be developed using a **Feature-Sliced Design** approach.

- New feature code should be located in a dedicated directory under `frontend/src/features/`. For example, a new "invoicing" feature would live in `frontend/src/features/invoicing/`.
- Each feature directory should be self-contained and include its own `pages`, `components`, `hooks`, etc.

## Legacy Code

Existing legacy code, primarily located in `frontend/src/pages/`, will be gradually migrated to the new feature-sliced structure over time as opportunities arise. No new features should be added to the old structure.

This approach allows for incremental modernization while minimizing the risk of a large-scale, disruptive refactor. 