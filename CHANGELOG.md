# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added

- Add centralized site configuration system

### Changed

### Fixed

---

## [0.2.0-alpha.2] - 2026-02-01

### Changed

- Restructure layout architecture with (system) route group

---

## [0.2.0-alpha.1] - 2026-02-01

### Added

- Add orchestrating-parallel-work skill for coordinating concurrent agents
- Add developer guide on parallel execution patterns, anti-patterns, and troubleshooting
- Integrate background agent execution with dependency-aware batch scheduling

---

## [0.1.0-alpha.1] - 2026-02-01

### Added

- Integrate PostHog analytics into Next.js application
- Add vectorizing-images skill, logo generation docs, and metadata guide
- Add Replicate MCP image generation skill and sync harness docs
- Add standard pages for errors, legal compliance, and cookie consent
- Add writing-developer-guides skill and restructure all guides
- Implement BetterAuth authentication with Email OTP
- Add documentation drift detection and reconciliation system
- Add /system template documentation hub with Claude Code harness docs
- Add multi-database support to MCP server (PostgreSQL + SQLite)
- Switch to SQLite for local development + add /db:studio command
- Implement design system showcase with interactive components
- Migrate from Radix UI to Base UI (via basecn)
- Add Knip for dead code detection with /app:cleanup command
- Add /app:upgrade command for comprehensive dependency management
- Add /system:learn command for experimental learning workflows
- Add calculation rules and IDE color scheme commands
- Add proactive clarification skill for improved prompt analysis
- Add argument support to git:commit command
- Add path-specific rules system for contextual code guidance
- Add notification sound management commands
- Add background agent execution patterns for parallel workflows
- Integrate Context7 for up-to-date library documentation
- Add release system with changelog automation

### Changed

- Migrate from ClaudeKit to built-in scripts and task tools
- Restructure spec workflow with parallel background agents
- Update Next.js version to 16.1.0 in Technology Stack
- Clarify Explore vs code-search agent usage
- Comprehensive Claude Code harness documentation
- Use claude-code-guide for official Claude Code documentation
- Add Developer Guides section to CLAUDE.md and fix FSD skill reference

### Fixed

- Resolve lint errors in system UI patterns page
- Use better-sqlite3 adapter for Prisma 7 with SQLite
- Resolve Base UI context errors in overlay components
- Upgrade next to 16.1.0 for security patches

---
