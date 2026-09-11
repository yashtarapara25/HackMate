# HackMate AI — Neon PostgreSQL Database Architecture & Schema Blueprint

This document defines the production-ready, highly scalable, and normalized **PostgreSQL** database architecture designed for **Neon Serverless Database**, tailored for the HackMate AI platform.

---

## 1. Project Understanding & Data Lifecycle

HackMate AI bridges team building, ideation, tasks, and file resources inside a unified student workspace. In this platform, data undergoes transitions starting from individual student profiles, moving through active hackathon stages, team formation, project iterations, and finishing in a permanent, searchable resource archive.

```text
       [ University & Department Directory ]
                        │
                  [ User Profiles ]
                        │ (Registers)
             [ Hackathon Selection ]
                        │
                [ Team Formation ] <─────── [ Member Invitations ]
                        │ (Creates)
           [ Workspace Initialization ]
                        │
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
[Problem Lab]     [Task Board]     [Discussion Board]
      │                 │                 │
[Solution Pitches]  [Kanban Cards]   [WebSocket Channels]
      │                 │                 │
  [Voting]        [Contributions]     [Messages]
      │                 │                 │
      └─────────────────┼─────────────────┘
                        ▼
               [ Project Artifacts ]
          (UML Design, Docs, Slide Decks)
                        │ (Submits)
                 [ Faculty Review ]
           (Rubric Scoring & Evaluations)
                        │
                 [ Project Archive ]
          (Searchable past projects library)
```

---

## 2. Module Analysis

The platform requires a modular data schema to feed each client-side frontend view:

1.  **Landing Page**: Reads active hackathons, countdowns, and sponsor lists.
2.  **Authentication**: Writes new user credentials, verifies password hashes, and manages active login session states.
3.  **Dashboard**: Aggregates and returns active team data, current task completion percentages, and system-wide notifications.
4.  **Profile**: Reads and writes student resumes, skill sets, awarded platform badges, and portfolio links.
5.  **Teams**: Manages workspace membership directories, team profiles, and invites.
6.  **Problem & Solution Lab**: Captures core problem scopes, logs pain points, and accepts pitched concept forms.
7.  **Voting Board**: Handles rating values (0-5 stars) and logs comments on pitched ideas.
8.  **Discussion Board**: Loads chat channels, routes messages, and handles emoji reaction states.
9.  **Task Board**: Manages Kanban columns, assigns developers to tasks, and records progress percentages.
10. **Project Workspace**: Models Notion-style nested folders, file assets, and markdown contents.
11. **Team Insights**: Provides data aggregates representing sprint speed, code contributions, and tech stacks.
12. **Pitch Studio**: Logs slide deck files and stores checklist statuses (completed/remaining).
13. **Hackathon Library**: Hosts public folders of completed hackathon projects for historical search.
14. **Notifications**: Tracks unread flags and routes trigger payloads to users.
15. **Settings**: Handles preferences (e.g. system theme settings, email triggers).
16. **Admin Panel**: Provides audit feeds, hackathon registration setups, and grading metrics for organizers.

---

## 3. User Roles & Permissions Matrix

This roles schema ensures secure access controls at the database level.

| Role | Target Directory | Allowed Database Permissions | Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Platform Configuration | Full read/write on all system tables | Can create organizer accounts, configure server integrations, and override data scopes. |
| **Hackathon Organizer** | Event Registry | Read/Write on `hackathons`, `badges`, `knowledge_hub_articles` | Manages event dates, custom badges, and publishes guide documents. |
| **Faculty** | Submissions Review | Read on `teams`; Read/Write on `judge_reviews` | Scores projects based on compile checks, design rubrics, and logs reviews. |
| **Mentor** | Workspace Guidance | Read on `teams` / `projects`; Read/Write on `task_comments` | Inspects workspace logs, reviews system architectures, and leaves advice comments. |
| **Student Team Leader** | Workspace Administration | Full write on `teams`, `team_invitations`, `problem_statements` | Can edit team titles, invite members, edit problem scopes, and modify project paths. |
| **Student Team Member** | Workspace Collaboration | Write on `tasks`, `solution_concepts`, `votes`, `messages` | Participates in coding tasks, pitches ideas, chat, and votes on project solutions. |

---

## 4. Neon Database Setup Strategy

This design uses specific features of **Neon PostgreSQL** to ensure high performance and developer velocity.

### A. Core Architecture Decisions
*   **UUID v4 Primary Keys**: Used instead of standard integers. This prevents URL ID scanning vulnerabilities and facilitates clean data merging during testing branches.
*   **Timestamps with Timezones (`timestamptz`)**: Applied globally. Defaults to `CURRENT_TIMESTAMP` on creation, with custom triggers updating the `updated_at` column.
*   **Soft Deletes**: Tables containing critical user data implement a `deleted_at` timestamp. When a project is deleted, the record is flagged, allowing recovery.
*   **Audit Logging**: The `audit_logs` table records every administrative write action, saving before-and-after states in `jsonb` fields.
*   **Case Conventions**: All table names are plural and lowercase (e.g., `users`, `tasks`). Columns are written in `snake_case`.

### B. Neon Serverless Optimizations
*   **Branching**: Take advantage of Neon's instant branching to create separate database environments for staging, local testing, and pull requests.
*   **Autoscaling**: Connection pooling is configured via PGBouncer (built into Neon) to prevent connection leaks from asynchronous FastAPI workers.
*   **Indexes**: Crucial foreign keys and lookup parameters use index mappings to speed up complex queries.

---

## 5. Normalized Relational Table Design

---

### A. Core Directory & Identity Tables

#### 1. universities
*   **Purpose**: Records schools participating in the hackathons to restrict email logins.
*   **Columns**:
    *   `id` (UUID, Primary Key) - Auto-generated UUID.
    *   `name` (VARCHAR, Not Null) - e.g. "Stanford University"
    *   `email_domain` (VARCHAR, Not Null, Unique) - e.g. "stanford.edu"
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: Unique index on `email_domain`.
*   **Validation**: Domain must be structured as a valid suffix (regex: `^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$`).

#### 2. departments
*   **Purpose**: Classifies student studies within universities.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `university_id` (UUID, Foreign Key $\rightarrow$ `universities.id`, ON DELETE CASCADE)
    *   `name` (VARCHAR, Not Null) - e.g. "Computer Science"
*   **Relationships**: Many Departments $\rightarrow$ One University.

#### 3. users
*   **Purpose**: Manages system credentials, profile info, and experience scores.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `email` (VARCHAR, Unique, Indexed, Not Null)
    *   `hashed_password` (VARCHAR, Not Null) - Bcrypt password representation
    *   `full_name` (VARCHAR, Not Null)
    *   `avatar_url` (VARCHAR, Nullable)
    *   `university_id` (UUID, Foreign Key $\rightarrow$ `universities.id`, ON DELETE RESTRICT)
    *   `department_id` (UUID, Foreign Key $\rightarrow$ `departments.id`, ON DELETE RESTRICT)
    *   `skills` (TEXT[], Default '{}') - Array of tags (e.g., `["Python", "React"]`)
    *   `xp_score` (INTEGER, Default 0) - Gamification score
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)
    *   `deleted_at` (TIMESTAMPTZ, Nullable)
*   **Example Record**:
    ```json
    {
      "id": "e9a03f4a-81a1-432d-9477-d35272a8c3d1",
      "email": "alex@bytecraft.io",
      "full_name": "Alex Rivers",
      "university_id": "aa14fe4c-d198-4c12-888e-64dfd236aa08",
      "department_id": "b34e5651-d4ea-4c91-a1e6-c1dfd4e6aa02",
      "skills": ["React", "Node.js", "System Design"],
      "xp_score": 940,
      "created_at": "2026-07-16T09:00:00Z"
    }
    ```

#### 4. roles
*   **Purpose**: Stores authorization names and permission matrices.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR, Unique, Not Null) - e.g. `student`, `faculty`
    *   `permissions` (JSONB, Default '{}') - Permissions object (e.g. `{"can_grade": false, "can_pitch": true}`)
*   **Indexes**: Unique index on `name`.

#### 5. user_roles_join
*   **Purpose**: Many-to-many lookup table linking users to system roles.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `role_id` (UUID, Foreign Key $\rightarrow$ `roles.id`, ON DELETE CASCADE)
*   **Indexes**: Composite index on (`user_id`, `role_id`).

#### 6. sessions
*   **Purpose**: Stores active login tokens to support token refresh and session revocation.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `refresh_token` (VARCHAR, Unique, Not Null)
    *   `user_agent` (VARCHAR)
    *   `ip_address` (VARCHAR)
    *   `expires_at` (TIMESTAMPTZ, Not Null)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

---

### B. Hackathon & Team Workspace Tables

#### 7. hackathons
*   **Purpose**: Stores events, deadlines, category tags, and sponsors.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR, Not Null)
    *   `tagline` (VARCHAR)
    *   `description` (TEXT)
    *   `start_date` (TIMESTAMPTZ, Not Null)
    *   `end_date` (TIMESTAMPTZ, Not Null)
    *   `status` (VARCHAR, Default 'upcoming') - `upcoming`, `active`, `archived`
    *   `categories` (TEXT[], Default '{}') - e.g. `["AI", "FinTech"]`
    *   `sponsors` (JSONB, Default '[]') - Sponsor names and logo paths
*   **Validation**: `end_date` must occur after `start_date`.

#### 8. teams
*   **Purpose**: Workspace containers for team members.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR, Not Null)
    *   `avatar` (VARCHAR, Default 'BC') - 2-character avatar string
    *   `hackathon_id` (UUID, Foreign Key $\rightarrow$ `hackathons.id`, ON DELETE RESTRICT)
    *   `leader_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE RESTRICT)
    *   `progress_percentage` (INTEGER, Default 0)
    *   `health_score` (INTEGER, Default 100)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `deleted_at` (TIMESTAMPTZ, Nullable)
*   **Indexes**: Composite index on (`hackathon_id`, `name`) to prevent duplicate team names inside the same hackathon.

#### 9. team_members
*   **Purpose**: Many-to-many relationship mapping users to teams.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `role_in_team` (VARCHAR, Not Null) - e.g. "Fullstack Developer"
    *   `availability_percentage` (INTEGER, Default 100)
*   **Indexes**: Unique index on (`team_id`, `user_id`) to prevent a user from joining a team multiple times.

#### 10. team_invitations
*   **Purpose**: Logs invitations sent to students.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `email` (VARCHAR, Not Null) - Recipient email
    *   `suggested_role` (VARCHAR)
    *   `status` (VARCHAR, Default 'pending') - `pending`, `accepted`, `declined`
    *   `expires_at` (TIMESTAMPTZ, Not Null)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

---

### C. Problem & Solution Lab Tables

#### 11. problem_statements
*   **Purpose**: Stores the team's defined problem statement.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Unique, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `core_statement` (TEXT, Not Null)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)
*   **Constraints**: Unique constraint on `team_id` enforces a single active problem statement per team.

#### 12. pain_points
*   **Purpose**: Logs observed user pain points under the problem statement.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `problem_statement_id` (UUID, Foreign Key $\rightarrow$ `problem_statements.id`, ON DELETE CASCADE)
    *   `text` (TEXT, Not Null)
    *   `votes_count` (INTEGER, Default 0)

#### 13. solution_concepts
*   **Purpose**: Solution pitches submitted by team members.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `author_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `title` (VARCHAR, Not Null)
    *   `description` (TEXT, Not Null)
    *   `pros` (TEXT[], Default '{}')
    *   `cons` (TEXT[], Default '{}')
    *   `average_score` (NUMERIC(3,2), Default 0.00)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: Index on `team_id` to quickly load a team's solution concepts.

#### 14. idea_votes
*   **Purpose**: Star ratings and feedback submitted on solution concepts.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `concept_id` (UUID, Foreign Key $\rightarrow$ `solution_concepts.id`, ON DELETE CASCADE)
    *   `voter_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `rating` (NUMERIC(2,1), Not Null) - Range: 1.0 to 5.0
    *   `comment` (TEXT, Nullable)
*   **Indexes**: Unique index on (`concept_id`, `voter_id`) ensures each member votes only once per concept.

---

### D. Chat & Discussion Tables

#### 15. discussion_channels
*   **Purpose**: Stores sub-channels (e.g. general, backend, frontend) inside a team's workspace.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `name` (VARCHAR, Not Null) - e.g. "general"
    *   `topic` (VARCHAR)
*   **Indexes**: Unique composite index on (`team_id`, `name`).

#### 16. messages
*   **Purpose**: Log of chat messages.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `channel_id` (UUID, Foreign Key $\rightarrow$ `discussion_channels.id`, ON DELETE CASCADE)
    *   `sender_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `text` (TEXT, Not Null)
    *   `reactions` (JSONB, Default '[]') - Array of reaction emojis and user counts
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: Index on (`channel_id`, `created_at DESC`) to speed up channel history loads.

---

### E. Task Management Tables

#### 17. tasks
*   **Purpose**: Stores Kanban task cards.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `title` (VARCHAR, Not Null)
    *   `description` (TEXT)
    *   `status` (VARCHAR, Default 'todo') - `todo`, `in_progress`, `completed`
    *   `priority` (VARCHAR, Default 'medium') - `low`, `medium`, `high`
    *   `deadline` (TIMESTAMPTZ)
    *   `progress_percentage` (INTEGER, Default 0) - Completion status (0 to 100)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)
*   **Validation**: Enforce `progress_percentage` limits (0 to 100).

#### 18. task_assignments
*   **Purpose**: Many-to-many relationship mapping users to tasks.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `task_id` (UUID, Foreign Key $\rightarrow$ `tasks.id`, ON DELETE CASCADE)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
*   **Indexes**: Composite index on (`task_id`, `user_id`).

#### 19. task_comments
*   **Purpose**: Comments left by team members on task cards.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `task_id` (UUID, Foreign Key $\rightarrow$ `tasks.id`, ON DELETE CASCADE)
    *   `author_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `text` (TEXT, Not Null)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

---

### F. Document & Workspace Tables

#### 20. documents
*   **Purpose**: Files and notes stored in the workspace file tree.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `title` (VARCHAR, Not Null)
    *   `folder_name` (VARCHAR, Default 'Root')
    *   `is_archived` (BOOLEAN, Default False)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)

#### 21. document_versions
*   **Purpose**: Tracks document history and edits over time.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `document_id` (UUID, Foreign Key $\rightarrow$ `documents.id`, ON DELETE CASCADE)
    *   `version_number` (INTEGER, Not Null)
    *   `content` (TEXT, Not Null)
    *   `author_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `file_path` (VARCHAR, Nullable) - Used for binary files (e.g. PDFs)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: Composite index on (`document_id`, `version_number DESC`).

#### 22. meeting_notes
*   **Purpose**: Stores markdown summaries of team sync meetings.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `title` (VARCHAR, Not Null)
    *   `content` (TEXT, Not Null)
    *   `meeting_date` (DATE, Not Null)
    *   `author_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

#### 23. architecture_files
*   **Purpose**: SVG data of team design blueprints.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `title` (VARCHAR, Not Null)
    *   `svg_data` (TEXT, Not Null)
    *   `uploader_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

#### 24. presentations
*   **Purpose**: Tracks presentation slides prepared for judging.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Unique, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `file_name` (VARCHAR, Not Null)
    *   `file_size_bytes` (INTEGER, Not Null)
    *   `current_version` (INTEGER, Default 1)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

#### 25. presentation_versions
*   **Purpose**: Tracks version history of presentation slide decks.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `presentation_id` (UUID, Foreign Key $\rightarrow$ `presentations.id`, ON DELETE CASCADE)
    *   `version_number` (INTEGER, Not Null)
    *   `file_path` (VARCHAR, Not Null) - Path to cloud object storage
    *   `uploader_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

---

### G. Analytics, Reviews & System Logs

#### 26. notifications
*   **Purpose**: Tracks app alerts and updates for users.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `title` (VARCHAR, Not Null)
    *   `message` (TEXT, Not Null)
    *   `link_url` (VARCHAR)
    *   `is_read` (BOOLEAN, Default False)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: Index on (`user_id`, `is_read`) to quickly return unread counts.

#### 27. activity_logs
*   **Purpose**: Feeds the real-time project monitor dashboard.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `action_description` (VARCHAR, Not Null) - e.g. "Sophia Chen added task 'Setup variables'"
    *   `event_type` (VARCHAR) - e.g. `task_creation`, `file_upload`
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

#### 28. badges
*   **Purpose**: System gamification rewards.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR, Unique, Not Null)
    *   `description` (TEXT)
    *   `icon_url` (VARCHAR)
    *   `xp_required` (INTEGER, Default 0)

#### 29. badge_awards
*   **Purpose**: Tracks badges awarded to users (many-to-many mapping).
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `badge_id` (UUID, Foreign Key $\rightarrow$ `badges.id`, ON DELETE CASCADE)
    *   `awarded_at` (TIMESTAMPTZ, Default Current Time)

#### 30. judge_reviews
*   **Purpose**: Stores project evaluations submitted by organizers and faculty.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `reviewer_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE RESTRICT)
    *   `scoring_rubric` (JSONB, Not Null) - Stores specific category grades (e.g. `{"innovation": 9, "feasibility": 8}`)
    *   `final_score` (NUMERIC(5,2), Not Null) - Weighted average score (0 to 100)
    *   `feedback_comments` (TEXT)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)

#### 31. settings
*   **Purpose**: Persists individual user application preferences.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Unique, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `theme_preference` (VARCHAR, Default 'light')
    *   `is_email_notify` (BOOLEAN, Default True)
    *   `is_push_notify` (BOOLEAN, Default True)

#### 32. audit_logs
*   **Purpose**: High-security audit log capturing all administrative data changes.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Nullable, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `action` (VARCHAR, Not Null) - e.g. `update_user_role`
    *   `table_name` (VARCHAR, Not Null)
    *   `record_id` (UUID, Not Null)
    *   `before_state` (JSONB, Nullable) - Database values before the operation
    *   `after_state` (JSONB, Nullable) - Database values after the operation
    *   `ip_address` (VARCHAR)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

---

## 6. Entity-Relationship Model (Conceptual Relationships)

```text
  ┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
  │   universities  │1           *│   departments   │1           *│      users      │
  │  ─────────────  ├────────────►│  ─────────────  ├────────────►│  ─────────────  │
  │   id (PK)       │             │   id (PK)       │             │   id (PK)       │
  └─────────────────┘             │   university_id │             │   university_id │
                                  └─────────────────┘             │   department_id │
                                                                  └────────┬────────┘
                                                                           │1
                                                                           │
                                                                           │*
  ┌─────────────────┐             ┌─────────────────┐             ┌────────▼────────┐
  │    hackathons   │1           *│      teams      │1           *│   team_members  │
  │  ─────────────  ├────────────►│  ─────────────  │◄────────────┤  ─────────────  │
  │   id (PK)       │             │   id (PK)       │             │   id (PK)       │
  └────────┬────────┘             │   hackathon_id  │             │   team_id       │
           │                      │   leader_id     │             │   user_id       │
           │1                     └────────┬────────┘             └─────────────────┘
           │                               │
           │*                              ├──────────────────────────────┐
  ┌────────▼────────┐                      │1                             │1
  │  team_invites   │                      │                              │
  │  ─────────────  │                      │*                             │*
  │   id (PK)       │             ┌────────▼────────┐            ┌────────▼────────┐
  │   team_id       │             │      tasks      │            │solution_concepts│
  └─────────────────┘             │  ─────────────  │            │  ─────────────  │
                                  │   id (PK)       │            │   id (PK)       │
                                  │   team_id       │            │   team_id       │
                                  └────────┬────────┘            └────────┬────────┘
                                           │                              │
                                           │1                             │1
                                           │                              │
                                           │*                             │*
                                  ┌────────▼────────┐            ┌────────▼────────┐
                                  │  task_comments  │            │    idea_votes   │
                                  │  ─────────────  │            │  ─────────────  │
                                  │   id (PK)       │            │   id (PK)       │
                                  │   task_id       │            │   concept_id    │
                                  └─────────────────┘            │   voter_id      │
                                                                 └─────────────────┘
```

### Explanation of Cardinality

1.  **One University $\rightarrow$ Many Users**: A university has many enrolled students; a user registers with one university email suffix.
2.  **One User $\rightarrow$ Many Team Memberships (Many-to-Many via `team_members`)**: A user can join multiple teams across different hackathons over time.
3.  **One Hackathon $\rightarrow$ Many Teams**: An event hosts multiple competing teams.
4.  **One Team $\rightarrow$ One Problem Statement**: A team develops exactly one project problem statement.
5.  **One Problem Statement $\rightarrow$ Many Pain Points**: A problem statement contains multiple validated pain points.
6.  **One Team $\rightarrow$ Many Solution Concepts**: A team brainstorms and pitches multiple solution ideas.
7.  **One Solution Concept $\rightarrow$ Many Votes**: Each pitched idea is rated by team members.
8.  **One Team $\rightarrow$ Many Tasks**: A team workspace contains multiple Kanban task cards.
9.  **One Task $\rightarrow$ Many Assigned Users (Many-to-Many via `task_assignments`)**: Multiple team members can cooperate on a single task.

---

## 7. Data Flow Lifecycle

This lifecycle tracks state changes and database updates during a hackathon:

```text
[1. Registration] ──> INSERTS to 'users' and maps system roles in 'user_roles_join'
         │
[2. Invitation]   ──> INSERTS to 'team_invitations' (Status: 'pending')
         │
[3. Accept Invite]──> UPDATES 'team_invitations' (Status: 'accepted')
         │            INSERTS record into 'team_members'
         │
[4. Setup Lab]    ──> INSERTS core 'problem_statements'
         │            INSERTS related 'pain_points'
         │
[5. Brainstorm]   ──> INSERTS solutions into 'solution_concepts'
         │
[6. Vote & Select]──> INSERTS ratings into 'idea_votes'
         │            UPDATES 'solution_concepts' (Calculates 'average_score')
         │            Set the concept with highest average as "Leading Solution Concept"
         │
[7. Plan Kanban]  ──> INSERTS tasks into 'tasks'
         │            INSERTS mapping records into 'task_assignments'
         │
[8. Update Tasks] ──> UPDATES 'tasks' (Status: 'in_progress' -> 'completed')
         │            Triggers recalculation of 'teams.progress_percentage'
         │
[9. File Uploads] ──> INSERTS version control records into 'document_versions'
         │
[10. Submission]  ──> INSERTS score rubrics and feedback into 'judge_reviews'
         │
[11. Archive]     ──> UPDATES 'hackathons' status to 'archived'
                      Enables public read searches on teams, files, and project assets
```

---

## 8. Normalization Strategy

To ensure data integrity, prevent duplicate records, and support high transaction rates, the database is normalized to **Third Normal Form (3NF)**:

*   **First Normal Form (1NF) Compliance**:
    *   Every column contains only atomic (indivisible) values.
    *   No repeating groups of columns exist.
    *   All tables have a designated Primary Key (`id` UUID v4).
*   **Second Normal Form (2NF) Compliance**:
    *   1NF is met.
    *   All non-key columns depend entirely on the primary key, rather than a subset of it.
    *   Many-to-many relations are separated into dedicated lookup tables (`user_roles_join`, `team_members`, `task_assignments`) to avoid duplicate fields.
*   **Third Normal Form (3NF) Compliance**:
    *   2NF is met.
    *   No non-key column depends on another non-key column (no transitive dependencies).
    *   For example, student details are not stored directly in `team_members`. Instead, the table stores only the `user_id`, referencing the `users` table. Similarly, the `users` table references the `university_id` and `department_id` to prevent redundant storage of university details.

---

## 9. Machine Learning Readiness Schema

To support future ML models (like student-team matchmaking and AI task generators), the database structure stores structured features from day one:

```text
                    [ DATABASE ML RAW DATA FEATURES ]
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
[Skill Features]          [Interactive Features]      [Evaluations Features]
- user.skills             - task.progress_percentage  - solution_concepts.average_score
- user.xp_score           - activity_logs.event_type  - judge_reviews.scoring_rubric
- team_members.role_in_team                           - hackathons.categories
```

1.  **Skills Profiling**: User profiles store an array of structured tags (`users.skills`) and earned experience scores (`users.xp_score`). This data acts as the primary input feature for matchmaking recommendations.
2.  **Team Diversity Metrics**: By mapping `team_members.role_in_team`, the recommendation system can identify missing skills on a team (e.g. if a team has 3 developers but no designer) and suggest matching candidates.
3.  **Project Category Classification**: Past projects are tagged with `hackathons.categories`, allowing the system to recommend resources and project structures to new teams.
4.  **Task & Effort Tracking**: Storing task updates (`tasks.progress_percentage` and timestamps) logs data on team velocity, helping predict project completion rates.
5.  **Quality & Scoring History**: Storing judge scores (`judge_reviews.scoring_rubric` and `solution_concepts.average_score`) helps train models to identify high-potential project ideas based on team composition.

---

## 10. Database Development Roadmap

```text
[Phase 1: Setup]     ──► Configure Neon connection pools, PGBouncer, and Alembic migrations.
                              │
[Phase 2: Directory] ──► Create core directories ('universities', 'departments', 'roles').
                              │
[Phase 3: Identity]  ──► Create 'users', 'user_roles_join', and 'sessions' tables.
                              │
[Phase 4: Workspace] ──► Create 'hackathons', 'teams', 'team_members', and 'team_invitations'.
                              │
[Phase 5: Ideation]  ──► Create 'problem_statements', 'pain_points', 'solution_concepts', 'idea_votes'.
                              │
[Phase 6: Task Board]──► Create 'tasks', 'task_assignments', and 'task_comments' tables.
                              │
[Phase 7: Documents] ──► Create 'documents', 'document_versions', and 'architecture_files'.
                              │
[Phase 8: Audit/Log] ──► Create 'notifications', 'activity_logs', and 'audit_logs'.
                              │
[Phase 9: Reviews]   ──► Create 'judge_reviews', 'settings', and 'badge_awards'.
                              │
[Phase 10: Tuning]   ──► Write triggers, optimize indexes, and run scale tests on Neon.
```
