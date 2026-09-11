# Database Implementation Walkthrough — HackMate AI

This document summarizes the database schema implementation for HackMate AI. All scripts have been generated in the new `/database` directory in the project workspace.

---

## 1. Directory Structure

The complete database migration pipeline is organized under:
*   [database](file:///E:/HackMate/database)

The directory contains:
*   [001_extensions.sql](file:///E:/HackMate/database/001_extensions.sql): Registers PostgreSQL extensions for UUID and text operations.
*   [002_tables.sql](file:///E:/HackMate/database/002_tables.sql): Instantiates the 34 tables in Third Normal Form (3NF).
*   [003_constraints.sql](file:///E:/HackMate/database/003_constraints.sql): Applies check constraints (valid ranges for scores, status values, and percentage limits).
*   [004_indexes.sql](file:///E:/HackMate/database/004_indexes.sql): Optimizes query execution paths on foreign keys and tags.
*   [005_views.sql](file:///E:/HackMate/database/005_views.sql): Computes real-time data aggregations (leaderboards, sub-sprint analytics).
*   [007_functions.sql](file:///E:/HackMate/database/007_functions.sql): Implements PL/pgSQL database trigger functions.
*   [006_triggers.sql](file:///E:/HackMate/database/006_triggers.sql): Binds PL/pgSQL trigger functions to table mutations.
*   [008_seed_data.sql](file:///E:/HackMate/database/008_seed_data.sql): Seeds base tables (universities, roles, and default events).
*   [009_test_data.sql](file:///E:/HackMate/database/009_test_data.sql): Seeds mock test data corresponding directly to the frontend's mock states.
*   [README.md](file:///E:/HackMate/database/README.md): Setup, configuration, and verification manual.

---

## 2. Key Database Logic Implemented

### A. Team Progress Trigger
Recalculates team progress automatically whenever tasks are added, updated, or deleted under a team workspace.
*   *Function*: `recalculate_team_progress()` inside [007_functions.sql](file:///E:/HackMate/database/007_functions.sql)
*   *Trigger*: `trg_tasks_calc_progress` inside [006_triggers.sql](file:///E:/HackMate/database/006_triggers.sql)

### B. Action Activity Logs Trigger
Automatically logs team actions (e.g. creating tasks, uploading files, or pitching solutions) to the live team activity stream.
*   *Function*: `log_team_activity()` inside [007_functions.sql](file:///E:/HackMate/database/007_functions.sql)
*   *Trigger*: `trg_tasks_activity_log` etc., inside [006_triggers.sql](file:///E:/HackMate/database/006_triggers.sql)

### C. Leaderboard Ranking View
Calculates real-time leaderboard positions partition-by-hackathon using a weighted formula:
$$\text{Overall Score} = (\text{progress\_percentage} \times 0.7) + (\text{health\_score} \times 0.3)$$
*   *View*: `view_leaderboard_rankings` inside [005_views.sql](file:///E:/HackMate/database/005_views.sql)

---

## 3. Database Schema Verification

A step-by-step connection setup and query verification checklist are detailed in the [database README manual](file:///E:/HackMate/database/README.md).
All constraints and foreign key references have been verified for consistency.
