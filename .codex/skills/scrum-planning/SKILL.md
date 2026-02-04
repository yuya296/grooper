---
name: scrum-planning
description: Create Scrum planning PBIs and docs under docs/features. Use when the user asks to plan work, split backlog items, or says phrases like "PBI作って", "スクラムのプランニングして", or "Backlog切って". Produces PBI folders with spec.md, todo.md, and test.md without implementing code.
---

# Scrum Planning

## Overview

Create and maintain PBI folders under `docs/features/pbi-0000-hoge` with three files: `spec.md`, `todo.md`, and `test.md`. Enforce value-per-PBI, correct ordering, and no implementation without user approval.

## Workflow

### 1) Understand the request

- Restate the requested outcome in one sentence.
- Identify the smallest user-visible value that can be shipped.
- If the request is too large, propose a split into multiple PBIs.
- If a PBI cannot deliver standalone value, reject it and suggest a value-bearing alternative.

### 2) Propose PBI list

- Create a numbered list of candidate PBIs with short titles and one-line value statements.
- If there are dependencies, assign numbers so dependency order is preserved (no reverse numbering).
- If no dependencies, order by perceived importance (highest value first).
- Ask for confirmation before writing any files.

### 3) Create PBI folders and files (after approval only)

- Determine next PBI number by scanning `docs/features/` for existing `pbi-####-*` directories and picking the next available number.
- Use 4-digit zero padding for PBI numbers.
- Use a short kebab-case slug for the folder name.
- Create:
  - `docs/features/pbi-####-slug/spec.md`
  - `docs/features/pbi-####-slug/todo.md`
  - `docs/features/pbi-####-slug/test.md`
- Base file contents on the templates in `assets/templates/`.
- Keep `todo.md` as a checklist and update it as work progresses (only after user approval to implement).

### 4) Guardrails

- Never implement code without explicit user approval.
- If the request is too large, propose a split before any file creation.
- Do not create a PBI that cannot deliver standalone value.
- Respect ordering: dependencies must have lower numbers; independent items sorted by importance.

## Output Expectations

- Always present the PBI proposal first, then ask for confirmation.
- Use concrete file paths when listing created artifacts.
- Keep text concise and in Japanese unless the user requests otherwise.

## Resources

### assets/templates/

- `spec.md`: Requirement and acceptance criteria
- `todo.md`: Task checklist with updates section
- `test.md`: CLI/Browser test plan suitable for Codex autonomy
