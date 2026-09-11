# Software Requirement Analysis (SRA) & Database Planning Blueprint

## 1. Project Understanding & Page-by-Page Analysis

This section analyzes the frontend layout of HackMate AI to define the backend and database requirements for every user interface.

---

### A. Landing Page (`index.html`)
*   **Purpose**: Introduce HackMate AI, show countdown limits, display active workspace summaries, and redirect users to dashboards, logins, or register portals.
*   **User Actions**:
    *   Click "Launch Team Workspace" $\rightarrow$ Redirects to `student/dashboard.html`.
    *   Click "Admin Login" $\rightarrow$ Redirects to `auth/login.html`.
    *   Click "Setup New Team Workspace" $\rightarrow$ Redirects to `auth/register.html`.
*   **Input Data**: Active user session details (retrieved from localStorage).
*   **Output Data**: Hackathon metadata, time limits, and live activity statistics.
*   **Backend Requirements**: Public GET endpoints to fetch active hackathon summaries and live platform logs.
*   **Database Requirements**: Read access to `hackathons`, `teams`, and `activity_logs`.
*   **Future Machine Learning Opportunity**: Dynamic landing page suggestions based on student skills and university affiliation.

---

### B. Authentication Pages (`auth/login.html` & `auth/register.html`)
*   **Purpose**: Manage user registration, credential validation, and active login sessions.
*   **User Actions**:
    *   Input email/password to log in.
    *   Fast-track login using the demo workspace mock button.
    *   Create a new account with email, name, and role.
*   **Input Data**: Form fields (`full_name`, `email`, `password`, `university_id`, `department_id`).
*   **Output Data**: Access token (JWT) and refresh token.
*   **Backend Requirements**:
    *   POST `/api/v1/auth/register` (creates user, hashes password).
    *   POST `/api/v1/auth/login` (validates credentials, returns JWT tokens).
*   **Database Requirements**: Write access to `users`, `user_roles_join`, and `sessions`.
*   **Future Machine Learning Opportunity**: Anomaly detection to flag suspicious login patterns (IP/User-Agent mismatches).

---

### C. Student Dashboard (`student/dashboard.html`)
*   **Purpose**: The central workspace hub displaying hackathon status, sprint objectives, system health metrics, and team progress.
*   **User Actions**:
    *   View countdown timer.
    *   Monitor active sprint completion percentages.
    *   Read the team's latest activity logs.
*   **Input Data**: Active user token, active team ID.
*   **Output Data**: Computed sprint progress, team metrics, and notifications.
*   **Backend Requirements**: Aggregate endpoint returning team analytics, current sprint velocity, and notifications.
*   **Database Requirements**: Reads `teams`, `tasks`, `notifications`, and `activity_logs`.
*   **Future Machine Learning Opportunity**: Predictive warnings indicating if a team is at risk of missing a submission deadline based on task completion velocity.

---

### D. Profiles (`student/profile.html`)
*   **Purpose**: Display user achievements, experience points (XP), certificates, and skills.
*   **User Actions**:
    *   Update name, bio, and social links.
    *   Add or remove skill tags.
*   **Input Data**: Profile edit forms (LinkedIn URL, GitHub URL, skills arrays).
*   **Output Data**: User profile details.
*   **Backend Requirements**: GET and PUT endpoints for user profile management.
*   **Database Requirements**: Read/Write access to `users` and read access to `badge_awards`.
*   **Future Machine Learning Opportunity**: Recommended learning pathways based on current skills and missing team roles.

---

### E. Team Management (`student/team.html`)
*   **Purpose**: Manage team rosters, invite new members, view pending invites, and view available talent.
*   **User Actions**:
    *   Send out invitations via email.
    *   Accept/decline incoming invitations.
    *   Kick members from the roster (Team Leader only).
*   **Input Data**: Email invitations, suggested roles.
*   **Output Data**: Active roster lists and search results for available talent.
*   **Backend Requirements**: Endpoints for team CRUD, invite management, and user searches.
*   **Database Requirements**: Read/Write access to `teams`, `team_members`, and `team_invitations`.
*   **Future Machine Learning Opportunity**: Suggest team compositions based on skills compatibility and working style profiles.

---

### F. Problem & Solution Lab (`student/problem-solution-lab.html`)
*   **Purpose**: Define the project's core problem statement, track user pain points, and pitch solution concepts.
*   **User Actions**:
    *   Update the core problem statement.
    *   Add pain points.
    *   Pitch a new solution concept (title, description, pros/cons).
*   **Input Data**: Markdown text, pros/cons arrays.
*   **Output Data**: Problem statement details, pain points, and pitched concepts.
*   **Backend Requirements**: CRUD endpoints for problem statements, pain points, and solution concepts.
*   **Database Requirements**: Read/Write access to `problem_statements`, `pain_points`, and `solution_concepts`.
*   **Future Machine Learning Opportunity**: AI-powered duplicate detection to alert teams if a similar problem has already been pitched in the active hackathon.

---

### G. Voting Board
*   **Purpose**: Tally votes and rank pitched solution concepts to select the leading project.
*   **User Actions**:
    *   Submit a rating (1-5 stars) and a comment on a concept.
*   **Input Data**: Concept ID, numerical rating, review comment.
*   **Output Data**: Ranked solution list, average scores, and comments.
*   **Backend Requirements**: POST `/api/v1/votes` (calculates weighted rating averages).
*   **Database Requirements**: Read/Write access to `idea_votes` and updates to `solution_concepts.average_score`.
*   **Future Machine Learning Opportunity**: Sentiment analysis on voting comments to flag underlying disagreements or alignment issues.

---

### H. Discussion Board (`student/discussion-board.html`)
*   **Purpose**: Sub-sprint chat channels for real-time team communication.
*   **User Actions**:
    *   Create chat channels.
    *   Send messages and add reactions.
*   **Input Data**: Message string, channel ID, emoji reaction.
*   **Output Data**: Stream of chat messages.
*   **Backend Requirements**: WebSocket connections and endpoints for channel listing and history.
*   **Database Requirements**: Read/Write access to `discussion_channels` and `messages`.
*   **Future Machine Learning Opportunity**: Automated thread summarization to generate daily stand-up summaries for team members.

---

### I. Task Board (`student/task-board.html`)
*   **Purpose**: Kanban task board to manage sprint objectives.
*   **User Actions**:
    *   Create tasks with details (status, assignee, priority, deadline).
    *   Drag and drop tasks between columns.
    *   Add comments under task cards.
*   **Input Data**: Task properties, text comments.
*   **Output Data**: Kanban board layout.
*   **Backend Requirements**: CRUD endpoints for tasks and task comments.
*   **Database Requirements**: Read/Write access to `tasks`, `task_assignments`, and `task_comments`.
*   **Future Machine Learning Opportunity**: Automatic task breakdown (AI Copilot) based on the project description.

---

### J. Project Workspace (`student/project-workspace.html`)
*   **Purpose**: Manage project files and notes in a nested file tree.
*   **User Actions**:
    *   Create directories and documents.
    *   Write notes using a markdown text editor.
*   **Input Data**: Folder titles, file titles, markdown text.
*   **Output Data**: Workspace folder structure and document contents.
*   **Backend Requirements**: CRUD endpoints for folders and documents.
*   **Database Requirements**: Read/Write access to `workspace_folders` and `workspace_files`.
*   **Future Machine Learning Opportunity**: Auto-tagging and categorization of uploads to build the Knowledge Hub.

---

### K. Architecture Planning (`student/architecture.html`)
*   **Purpose**: Build, inspect, and version control SVG architecture system flowcharts.
*   **User Actions**:
    *   Create, view, and update system diagram SVG nodes.
*   **Input Data**: SVG XML payload.
*   **Output Data**: SVG file preview.
*   **Backend Requirements**: Endpoints to save and version control SVG payloads.
*   **Database Requirements**: Read/Write access to `architecture_files`.
*   **Future Machine Learning Opportunity**: Automated architecture validation to check if the diagram matches technologies listed in the project tasks.

---

### L. Pitch Studio (`student/pitch-studio.html`)
*   **Purpose**: Manage presentation slide files, track checklists, and view feedback from judges.
*   **User Actions**:
    *   Upload slide deck files.
    *   Check off task items.
    *   View evaluation feedback from judges.
*   **Input Data**: Presentation file binaries, checklist updates.
*   **Output Data**: Upload success confirmation and checklist progress.
*   **Backend Requirements**: Endpoints for file uploads, checklist updates, and judge feedback.
*   **Database Requirements**: Read/Write access to `presentations`, `presentation_versions`, `pitch_checklists`, and `judge_reviews`.
*   **Future Machine Learning Opportunity**: Pitch optimization recommendations, analyzing slides for clarity and completeness based on winning historic pitches.

---

### M. Team Insights (`student/team-insights.html`)
*   **Purpose**: View contribution graphs, track task completion rates, and show technology distributions.
*   **User Actions**:
    *   Inspect charts displaying task workloads, sprint speeds, and member contributions.
*   **Input Data**: Filter queries (e.g. select sprint windows).
*   **Output Data**: JSON coordinates for chart rendering.
*   **Backend Requirements**: Aggregation endpoint summarizing team contributions, sprint velocities, and tech stack usage.
*   **Database Requirements**: Read-only queries on `tasks`, `team_members`, and `workspace_files`.
*   **Future Machine Learning Opportunity**: Anomaly detection to identify team imbalances or potential burn-out risk.

---

### N. Hackathon Library (`student/hackathon-library.html`)
*   **Purpose**: Searchable archive of past winning projects and educational guides.
*   **User Actions**:
    *   Search archives using keywords, year, technology, or awards.
*   **Input Data**: Search strings, category filters.
*   **Output Data**: List of matching project cards.
*   **Backend Requirements**: Search endpoints with filters and categorization.
*   **Database Requirements**: Read-only queries on `archived_projects` and `knowledge_hub_articles`.
*   **Future Machine Learning Opportunity**: Semantic search queries using vector embeddings to find relevant past projects.

---

### O. Settings Page (`student/settings.html`)
*   **Purpose**: Configure notification preferences, profile visibility, and theme selection.
*   **User Actions**:
    *   Toggle email/push notifications.
    *   Select UI theme preference (light/dark).
*   **Input Data**: Toggle booleans and select values.
*   **Output Data**: Settings saved successfully notification.
*   **Backend Requirements**: PUT endpoints for settings management.
*   **Database Requirements**: Read/Write access to `settings`.
*   **Future Machine Learning Opportunity**: Smart notification routing, learning when users are most active to batch non-critical notifications.

---

### P. Admin Portal (`admin/admin.html`)
*   **Purpose**: Coordinator dashboard to create hackathons, monitor teams, publish notices, and review submissions.
*   **User Actions**:
    *   Create a hackathon event.
    *   Verify and grade project submissions using check-list forms.
    *   Publish global announcements.
*   **Input Data**: Event details, announcement text, review rubrics.
*   **Output Data**: Confirmation notifications and status lists.
*   **Backend Requirements**: Endpoints for event creation, grading submissions, and broadcasting announcements.
*   **Database Requirements**: Read/Write access to `hackathons`, `judge_reviews`, `notifications`, and `users`.
*   **Future Machine Learning Opportunity**: Automatic project scoring support, comparing submission artifacts to historical averages to flag outliers for review.

---

## 2. User Roles & Permissions Matrix

This section defines the access control matrix for HackMate AI.

```text
                  [ SYSTEM ACCESS LEVEL ]
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
[ Platform Ops ]       [ Evaluation ]          [ Collaboration ]
- Super Admin          - Faculty               - Team Leader
                       - Organizer             - Team Member
                       - Mentor
```

### Roles and Operations
1.  **Super Admin**: Complete read/write permissions on all tables. Authorized to configure system settings, verify university domains, and override configurations.
2.  **Organizer**: Read/Write permissions on `hackathons` and `badges`. Restricted from editing team-specific folders or voting on concepts.
3.  **Faculty**: Read/Write permissions on `judge_reviews`. Read access on `teams` and `projects`. Cannot edit team workspace files.
4.  **Mentor**: Read access on assigned `teams` and `projects`. Write permissions on `task_comments` for advisory feedback.
5.  **Team Leader**: Full read/write access inside their team's workspace. Can invite members, edit the problem statement, and submit the project.
6.  **Team Member**: Write permissions on `tasks`, `solution_concepts`, `votes`, and `messages`. Cannot modify team settings or submit the project.

---

## 3. Business Rules

These core rules enforce business logic constraints at the backend layer:

1.  **Team Size Limits**:
    *   Teams are limited to a maximum of 6 members.
    *   The database rejects member additions when `team_members` count reaches 6.
2.  **Team Leadership**:
    *   Each team must have exactly one leader (`teams.leader_id`).
    *   If the leader leaves the team, leadership must be assigned to an active member.
3.  **Registration Domains**:
    *   Users registering as Students or Faculty must use an email matching their university's domain suffix.
4.  **Voting Limits**:
    *   Users can only vote on solution concepts proposed within their own team.
    *   Each member is allowed exactly one vote per concept (submitting a new vote updates their previous rating).
5.  **Task Assignments**:
    *   Tasks can only be assigned to members of the team.
6.  **Submission Lockout**:
    *   Project submissions are disabled once the hackathon countdown reaches zero.
7.  **File Upload Constraints**:
    *   Individual file sizes cannot exceed 50MB. Only `.pdf`, `.pptx`, `.png`, and `.svg` files are accepted.
8.  **Roster Exclusivity**:
    *   A student can belong to only one active team per hackathon.

---

## 4. Complete Application Workflow

This diagram outlines the student's journey through a hackathon:

```text
[1. User Registration]  ──► Validate email domain, hash password, insert to 'users'
          │
[2. Profile Setup]     ──► Save user skills, bio, and social links
          │
[3. Team Creation]     ──► Create workspace, assign Team Leader role
          │
[4. Invite Process]    ──► Send invites, acceptances update 'team_members' status
          │
[5. Problem Framing]   ──► Write problem statement and validate user pain points
          │
[6. Solution Ideation] ──► Pitch solution concepts with pros and cons
          │
[7. Concept Selection] ──► Cast votes, calculate averages, select leading concept
          │
[8. Project Setup]     ──► Initialize task boards and repository connections
          │
[9. Sprint Execution]  ──► Update task statuses and check off slide checklists
          │
[10. Submission]       ──► Upload final presentation before deadline
          │
[11. Evaluation]       ──► Faculty review submissions and enter grades
          │
[12. Archive]          ──► Event status changes to archived; project moves to library
```

---

## 5. Module Analysis & Database Needs

This section details the inputs, outputs, database requirements, and business logic for each module.

---

### A. Dashboard Module
*   **Purpose**: Central status console.
*   **Inputs**: User identity, Active Team ID.
*   **Outputs**: Active sprint tasks, remaining time, system logs, and progress indicators.
*   **Database Needs**: Read access to `hackathons`, `teams`, `tasks`, and `activity_logs`.
*   **Business Logic**:
    *   Compute progress as: $\frac{\text{Completed Tasks}}{\text{Total Tasks}} \times 100$.
    *   Filter and return the 10 most recent activity logs for the team.

---

### B. Profile Module
*   **Purpose**: User resume and portfolio display.
*   **Inputs**: Skill arrays, bio details, and social links.
*   **Outputs**: User metadata, experience points (XP), and badges.
*   **Database Needs**: Read/Write access to `users` and read access to `badge_awards`.
*   **Business Logic**:
    *   Prevent email updates (linked directly to the account username).
    *   Ensure skill strings do not contain special characters.

---

### C. Teams Module
*   **Purpose**: Roster management.
*   **Inputs**: Email addresses, suggested team roles.
*   **Outputs**: Roster lists and invitation status.
*   **Database Needs**: Read/Write access to `teams`, `team_members`, and `team_invitations`.
*   **Business Logic**:
    *   Validate that invited emails are registered on the platform.
    *   Verify team size constraint (max 6) before sending invitations.

---

### D. Problem & Solution Lab Module
*   **Purpose**: Project ideation and scoping.
*   **Inputs**: Markdown text for problem statements, pain point descriptions, and solution concept forms.
*   **Outputs**: Scoped project details.
*   **Database Needs**: Read/Write access to `problem_statements`, `pain_points`, and `solution_concepts`.
*   **Business Logic**:
    *   Limit pain points to a maximum of 10 per workspace.

---

### E. Voting Board Module
*   **Purpose**: Concept selection.
*   **Inputs**: Concept ID, star rating (1-5), and comments.
*   **Outputs**: Weighted ratings and comments feed.
*   **Database Needs**: Read/Write access to `idea_votes` and updates to `solution_concepts.average_score`.
*   **Business Logic**:
    *   Update the solution concept's `average_score` upon new vote submissions.

---

### F. Discussion Board Module
*   **Purpose**: Real-time team communication.
*   **Inputs**: Chat messages and emoji reactions.
*   **Outputs**: Live chat stream.
*   **Database Needs**: Read/Write access to `discussion_channels` and `messages`.
*   **Business Logic**:
    *   Load the latest 50 messages on channel entry, lazy-loading older messages on scroll.

---

### G. Task Board Module
*   **Purpose**: Agile task management.
*   **Inputs**: Task details (status, assignees, deadlines, priorities).
*   **Outputs**: Kanban layout updates.
*   **Database Needs**: Read/Write access to `tasks`, `task_assignments`, and `task_comments`.
*   **Business Logic**:
    *   Ensure task deadlines fall before the hackathon's end date.
    *   Trigger recalculation of team progress when a task status changes to `completed`.

---

### H. Project Workspace Module
*   **Purpose**: Workspace file management.
*   **Inputs**: Folder structures, file uploads, and markdown document text.
*   **Outputs**: Navigation tree and document contents.
*   **Database Needs**: Read/Write access to `workspace_folders` and `workspace_files`.
*   **Business Logic**:
    *   Implement folder hierarchy structures.
    *   Save document versions to track edits.

---

### I. Pitch Studio Module
*   **Purpose**: Final submission and review prep.
*   **Inputs**: Slide deck files and checklist updates.
*   **Outputs**: Submission status and checklist progress.
*   **Database Needs**: Read/Write access to `presentations`, `presentation_versions`, `pitch_checklists`, and `judge_reviews`.
*   **Business Logic**:
    *   Validate file extensions on slide deck uploads (accept only `.pdf`, `.pptx`).

---

### J. Team Insights Module
*   **Purpose**: Team productivity charts.
*   **Inputs**: Team ID, active sprint filter.
*   **Outputs**: Aggregated workloads and contribution percentages.
*   **Database Needs**: Read access to `tasks`, `team_members`, and `workspace_files`.
*   **Business Logic**:
    *   Calculate contribution points: $\text{completed\_tasks} \times 10 + \text{files\_created} \times 5$.

---

### K. Hackathon Library Module
*   **Purpose**: Public archive of past projects.
*   **Inputs**: Search query strings.
*   **Outputs**: Matching project listings.
*   **Database Needs**: Read-only access to `archived_projects`.
*   **Business Logic**:
    *   Return only projects with an `archived` status.

---

### L. Admin Portal Module
*   **Purpose**: Administrator panel.
*   **Inputs**: Hackathon parameters, global announcement notices, and scoring rubrics.
*   **Outputs**: Dynamic lists of teams, users, and projects.
*   **Database Needs**: Read/Write access to `hackathons`, `judge_reviews`, and `notifications`.
*   **Business Logic**:
    *   Require an `Admin` or `Organizer` role to create events or publish announcements.

---

## 6. Data Flow Architecture

The diagram below maps the lifecycle of a user request to update a task:

```text
 [1. Client Browser]     ──► Drag & drop task card to 'completed' column
          │
 [2. Frontend API client]──► Send PUT request: '/api/v1/tasks/{id}' with payload: {"status": "completed"}
          │
 [3. Backend API Gateway]──► Decode JWT, verify role, validate payload against Pydantic schema
          │
 [4. Task Service Logic] ──► Verify task ownership and check that the user is on the team.
          │                  Update task record and recalculate team progress.
          │
 [5. Neon DB Transaction]──► Update 'tasks' table, calculate and update 'teams.progress_percentage'.
          │                  Log changes in 'activity_logs'. Commit transaction.
          │
 [6. Response Routing]   ──► Return updated task and team progress in JSON response (200 OK)
          │
 [7. UI Updates]         ──► Update UI state with new task positions and team progress bar.
```

---

## 7. Database Schema Design (PostgreSQL for Neon)

---

### A. Directory & Identity Tables

#### 1. universities
*   **Purpose**: Register universities to restrict domain registrations.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR, Unique, Not Null)
    *   `email_domain` (VARCHAR, Unique, Not Null)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: B-Tree index on `email_domain`.

#### 2. departments
*   **Purpose**: Group users by study department.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `university_id` (UUID, Foreign Key $\rightarrow$ `universities.id`, ON DELETE CASCADE)
    *   `name` (VARCHAR, Not Null)
*   **Indexes**: Index on `university_id`.

#### 3. users
*   **Purpose**: User accounts, profile data, and XP scores.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `email` (VARCHAR, Unique, Indexed, Not Null)
    *   `hashed_password` (VARCHAR, Not Null)
    *   `full_name` (VARCHAR, Not Null)
    *   `avatar_url` (VARCHAR, Nullable)
    *   `university_id` (UUID, Foreign Key $\rightarrow$ `universities.id`, ON DELETE RESTRICT)
    *   `department_id` (UUID, Foreign Key $\rightarrow$ `departments.id`, ON DELETE RESTRICT)
    *   `skills` (TEXT[], Default '{}')
    *   `xp_score` (INTEGER, Default 0)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)
    *   `deleted_at` (TIMESTAMPTZ, Nullable)
*   **Indexes**: B-Tree index on `email`. Partial index on `email` where `deleted_at IS NULL`.
*   **Validation Rules**: Email must match the associated university's domain suffix.
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
*   **Purpose**: User authorization roles.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR, Unique, Not Null)
    *   `permissions` (JSONB, Default '{}')
*   **Indexes**: Unique index on `name`.

#### 5. user_roles_join
*   **Purpose**: Many-to-many relationship mapping users to roles.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `role_id` (UUID, Foreign Key $\rightarrow$ `roles.id`, ON DELETE CASCADE)
*   **Indexes**: Composite index on (`user_id`, `role_id`).

#### 6. sessions
*   **Purpose**: Manage user login session states and refresh tokens.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `refresh_token` (VARCHAR, Unique, Not Null)
    *   `user_agent` (VARCHAR)
    *   `ip_address` (VARCHAR)
    *   `expires_at` (TIMESTAMPTZ, Not Null)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

---

### B. Hackathon & Workspaces Tables

#### 7. hackathons
*   **Purpose**: Active and archived hackathon events.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR, Not Null)
    *   `tagline` (VARCHAR)
    *   `description` (TEXT)
    *   `start_date` (TIMESTAMPTZ, Not Null)
    *   `end_date` (TIMESTAMPTZ, Not Null)
    *   `status` (VARCHAR, Default 'upcoming') - `upcoming`, `active`, `archived`
    *   `categories` (TEXT[], Default '{}')
    *   `sponsors` (JSONB, Default '[]')
*   **Validation Rules**: `end_date` must occur after `start_date`.

#### 8. teams
*   **Purpose**: Collaborative workspaces for teams.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR, Not Null)
    *   `avatar` (VARCHAR, Default 'BC')
    *   `hackathon_id` (UUID, Foreign Key $\rightarrow$ `hackathons.id`, ON DELETE RESTRICT)
    *   `leader_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE RESTRICT)
    *   `progress_percentage` (INTEGER, Default 0)
    *   `health_score` (INTEGER, Default 100)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `deleted_at` (TIMESTAMPTZ, Nullable)
*   **Indexes**: Unique composite index on (`hackathon_id`, `name`) where `deleted_at IS NULL` to prevent duplicate team names.

#### 9. team_members
*   **Purpose**: Roster of users in teams.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `role_in_team` (VARCHAR, Not Null)
    *   `availability_percentage` (INTEGER, Default 100)
*   **Indexes**: Unique index on (`team_id`, `user_id`) to prevent duplicate memberships.

#### 10. team_invitations
*   **Purpose**: Log of team invitations.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `email` (VARCHAR, Not Null)
    *   `suggested_role` (VARCHAR)
    *   `status` (VARCHAR, Default 'pending') - `pending`, `accepted`, `declined`
    *   `expires_at` (TIMESTAMPTZ, Not Null)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

---

### C. Ideation & Lab Tables

#### 11. problem_statements
*   **Purpose**: Core problem statement defined by the team.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Unique, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `core_statement` (TEXT, Not Null)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)

#### 12. pain_points
*   **Purpose**: User pain points associated with the problem statement.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `problem_statement_id` (UUID, Foreign Key $\rightarrow$ `problem_statements.id`, ON DELETE CASCADE)
    *   `text` (TEXT, Not Null)
    *   `votes_count` (INTEGER, Default 0)

#### 13. solution_concepts
*   **Purpose**: Pitched solution concepts.
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

#### 14. idea_votes
*   **Purpose**: Member votes on pitched solution concepts.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `concept_id` (UUID, Foreign Key $\rightarrow$ `solution_concepts.id`, ON DELETE CASCADE)
    *   `voter_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `rating` (NUMERIC(2,1), Not Null) - Range: 1.0 to 5.0
    *   `comment` (TEXT, Nullable)
*   **Indexes**: Unique index on (`concept_id`, `voter_id`) to limit users to a single vote per concept.

---

### D. Chat & Discussion Tables

#### 15. discussion_channels
*   **Purpose**: Workspace chat channels.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `name` (VARCHAR, Not Null)
    *   `topic` (VARCHAR)
*   **Indexes**: Unique composite index on (`team_id`, `name`).

#### 16. messages
*   **Purpose**: Chat messages.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `channel_id` (UUID, Foreign Key $\rightarrow$ `discussion_channels.id`, ON DELETE CASCADE)
    *   `sender_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `text` (TEXT, Not Null)
    *   `reactions` (JSONB, Default '[]')
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: Index on (`channel_id`, `created_at DESC`) for fast channel loads.

---

### E. Task Management Tables

#### 17. tasks
*   **Purpose**: Kanban task board cards.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `title` (VARCHAR, Not Null)
    *   `description` (TEXT)
    *   `status` (VARCHAR, Default 'todo') - `todo`, `in_progress`, `completed`
    *   `priority` (VARCHAR, Default 'medium') - `low`, `medium`, `high`
    *   `deadline` (TIMESTAMPTZ)
    *   `progress_percentage` (INTEGER, Default 0)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)
*   **Validation Rules**: `progress_percentage` must be between 0 and 100.

#### 18. task_assignments
*   **Purpose**: Many-to-many relationship mapping users to tasks.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `task_id` (UUID, Foreign Key $\rightarrow$ `tasks.id`, ON DELETE CASCADE)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
*   **Indexes**: Composite index on (`task_id`, `user_id`).

#### 19. task_comments
*   **Purpose**: Comments left on task cards.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `task_id` (UUID, Foreign Key $\rightarrow$ `tasks.id`, ON DELETE CASCADE)
    *   `author_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `text` (TEXT, Not Null)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

---

### F. Documents & Files Tables

#### 20. documents
*   **Purpose**: Workspace notes and documents.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `title` (VARCHAR, Not Null)
    *   `folder_name` (VARCHAR, Default 'Root')
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)

#### 21. document_versions
*   **Purpose**: Version history for documents.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `document_id` (UUID, Foreign Key $\rightarrow$ `documents.id`, ON DELETE CASCADE)
    *   `version_number` (INTEGER, Not Null)
    *   `content` (TEXT, Not Null)
    *   `author_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `file_path` (VARCHAR, Nullable)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: Composite index on (`document_id`, `version_number DESC`).

#### 22. meeting_notes
*   **Purpose**: Documented team sync meetings.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `title` (VARCHAR, Not Null)
    *   `content` (TEXT, Not Null)
    *   `meeting_date` (DATE, Not Null)
    *   `author_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

#### 23. architecture_files
*   **Purpose**: Vector SVG diagrams of system architectures.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `title` (VARCHAR, Not Null)
    *   `svg_data` (TEXT, Not Null)
    *   `uploader_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

#### 24. presentations
*   **Purpose**: Uploaded pitch decks.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Unique, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `file_name` (VARCHAR, Not Null)
    *   `file_size_bytes` (INTEGER, Not Null)
    *   `current_version` (INTEGER, Default 1)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

#### 25. presentation_versions
*   **Purpose**: Version history for pitch decks.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `presentation_id` (UUID, Foreign Key $\rightarrow$ `presentations.id`, ON DELETE CASCADE)
    *   `version_number` (INTEGER, Not Null)
    *   `file_path` (VARCHAR, Not Null)
    *   `uploader_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

---

### G. Analytics, Reviews & System Tables

#### 26. notifications
*   **Purpose**: Manage user alerts.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `title` (VARCHAR, Not Null)
    *   `message` (TEXT, Not Null)
    *   `link_url` (VARCHAR)
    *   `is_read` (BOOLEAN, Default False)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: B-Tree index on (`user_id`, `is_read`).

#### 27. activity_logs
*   **Purpose**: Log of team activity.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `action_description` (VARCHAR, Not Null)
    *   `event_type` (VARCHAR)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: Index on (`team_id`, `created_at DESC`).

#### 28. badges
*   **Purpose**: Award badges.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `name` (VARCHAR, Unique, Not Null)
    *   `description` (TEXT)
    *   `icon_url` (VARCHAR)
    *   `xp_required` (INTEGER, Default 0)

#### 29. badge_awards
*   **Purpose**: Many-to-many relationship mapping users to awarded badges.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `badge_id` (UUID, Foreign Key $\rightarrow$ `badges.id`, ON DELETE CASCADE)
    *   `awarded_at` (TIMESTAMPTZ, Default Current Time)

#### 30. judge_reviews
*   **Purpose**: Final project evaluation reviews.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Foreign Key $\rightarrow$ `teams.id`, ON DELETE CASCADE)
    *   `reviewer_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE RESTRICT)
    *   `scoring_rubric` (JSONB, Not Null)
    *   `final_score` (NUMERIC(5,2), Not Null)
    *   `feedback_comments` (TEXT)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)

#### 31. settings
*   **Purpose**: Individual settings preferences.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Unique, Foreign Key $\rightarrow$ `users.id`, ON DELETE CASCADE)
    *   `theme_preference` (VARCHAR, Default 'light')
    *   `is_email_notify` (BOOLEAN, Default True)
    *   `is_push_notify` (BOOLEAN, Default True)

#### 32. audit_logs
*   **Purpose**: Audit trail for database changes.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Nullable, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `action` (VARCHAR, Not Null)
    *   `table_name` (VARCHAR, Not Null)
    *   `record_id` (UUID, Not Null)
    *   `before_state` (JSONB, Nullable)
    *   `after_state` (JSONB, Nullable)
    *   `ip_address` (VARCHAR)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)

---

### H. Library & Archive Tables

#### 33. archived_projects
*   **Purpose**: Searchable index of completed hackathon projects.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `team_id` (UUID, Unique, Foreign Key $\rightarrow$ `teams.id`, ON DELETE SET NULL)
    *   `title` (VARCHAR, Not Null)
    *   `hackathon_name` (VARCHAR, Not Null)
    *   `award_won` (VARCHAR, Nullable)
    *   `problem_summary` (TEXT)
    *   `solution_summary` (TEXT)
    *   `technology_stack` (TEXT[], Default '{}')
    *   `github_url` (VARCHAR)
    *   `demo_video_url` (VARCHAR)
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
*   **Indexes**: GIN Index on `technology_stack`.

#### 34. knowledge_hub_articles
*   **Purpose**: Educational guides and reference material.
*   **Columns**:
    *   `id` (UUID, Primary Key)
    *   `title` (VARCHAR, Not Null)
    *   `summary` (TEXT)
    *   `content` (TEXT, Not Null)
    *   `author_id` (UUID, Foreign Key $\rightarrow$ `users.id`, ON DELETE SET NULL)
    *   `tags` (TEXT[], Default '{}')
    *   `created_at` (TIMESTAMPTZ, Default Current Time)
    *   `updated_at` (TIMESTAMPTZ, Default Current Time)

---

## 8. Entity-Relationship Conceptual Model

This diagram outlines the relationships and cardinalities between core tables:

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

---

## 9. File Storage Strategy

To ensure high performance and database scalability, physical file payloads are kept separate from PostgreSQL.

```text
               [ DIRECT FILE UPLOAD LIFECYCLE ]
               
  1. File Upload Request   ──► Generate secure S3 pre-signed upload URL
          │
  2. Direct Cloud Upload   ──► Upload file binary directly from browser to cloud storage bucket
          │
  3. Confirm Upload        ──► Send file metadata (file size, cloud URL) back to the backend API
          │
  4. Write DB Metadata     ──► Save file metadata to 'document_versions' or 'presentation_versions'
```

*   **Cloud Object Storage Bucket**: All files are uploaded directly to cloud buckets (e.g. AWS S3 or Google Cloud Storage) using secure, pre-signed upload URLs. This keeps file upload traffic from bogging down backend server performance.
*   **Structured Storage Paths**:
    *   *Documentation*: `hackathons/{hackathon_id}/teams/{team_id}/documents/{uuid_filename}.pdf`
    *   *Presentations*: `hackathons/{hackathon_id}/teams/{team_id}/presentations/v{version_number}_{uuid_filename}.pptx`
    *   *Diagram Assets*: `hackathons/{hackathon_id}/teams/{team_id}/architecture/{uuid_filename}.svg`
*   **Database References**: The database stores only file metadata (`file_path`, `file_size_bytes`, `uploader_id`, `created_at`) inside `document_versions` and `presentation_versions` tables, linking back to the physical assets in the cloud.

---

## 10. Security Architecture

1.  **Password Encryption**:
    *   Passwords are encrypted using **Argon2id** (with a minimum configuration of $m=65536, t=3, p=4$) before being saved to the database. Plaintext passwords are never logged or stored.
2.  **JWT Authentication**:
    *   Access tokens (valid for 15 minutes) are sent via HTTP headers for authentication.
    *   Refresh tokens (valid for 7 days) are stored in HTTP-Only, Secure, SameSite cookies to mitigate Cross-Site Scripting (XSS) risks.
3.  **Role-Based Access Control (RBAC)**:
    *   Middleware checks the user's role and workspace membership before allowing access to resources, preventing horizontal privilege escalation.
4.  **Data Isolation**:
    *   All queries are scoped using `team_id` or `user_id` parameters to ensure teams cannot access other teams' workspaces.
5.  **Soft Deletes**:
    *   Critical tables (`users`, `teams`, `tasks`, `documents`) use a `deleted_at` timestamp. This flags records as deleted without physically removing them, supporting recovery and maintaining historical analytics.
6.  **Audit Logs**:
    *   The `audit_logs` table records every administrative write action, capturing the before and after states in `jsonb` format to maintain a complete history of changes.

---

## 11. Performance & Scalability Strategy

1.  **Database Indexing**:
    *   B-Tree indexes are applied on all foreign keys (`user_id`, `team_id`, `hackathon_id`) to optimize join queries.
    *   Composite indexes are used on columns that are frequently queried together (e.g., `(channel_id, created_at DESC)` for message feeds).
2.  **Caching Layer**:
    *   Redis is utilized to cache active WebSocket connections, system logs, and voting averages to reduce read traffic to the primary PostgreSQL database.
3.  **Pagination**:
    *   Endpoints returning list data (like messages or logs) use cursor-based pagination to ensure fast, consistent response times regardless of dataset size.
4.  **Connection Pooling**:
    *   FastAPI uses Neon's connection pooler (PGBouncer) to manage database connections efficiently and prevent resource exhaustion under high loads.

---

## 12. Machine Learning Data Schema Preparation

To support future ML models (like student-team matchmaking and AI task generators), the database structure stores structured features from day one:

---

### A. Team Recommendation & Skill Matching Pipeline
*   **Target ML Model**: Suggests available students to incomplete teams based on skill compatibility and role needs.
*   **Required Database Fields**:
    *   `users.skills` (array of skill strings)
    *   `users.xp_score` (experience score)
    *   `team_members.role_in_team` (role distribution)
    *   `archived_projects.technology_stack` (historical team stack profiles)
*   **Target Variable**: Successful team join actions (when an invitation is accepted).

---

### B. Project Success & Innovation Predictor
*   **Target ML Model**: Predicts team performance and scoring outcomes based on team composition, skills, and progress metrics.
*   **Required Database Fields**:
    *   `users.xp_score` (experience score)
    *   `teams.progress_percentage` (task completion rates)
    *   `idea_votes.rating` (voting averages)
    *   `judge_reviews.final_score` (final grades assigned by judges)
*   **Target Variable**: `judge_reviews.final_score` (numerical value between 0.0 and 100.0).

---

## 13. System Development Roadmap

---

### Phase 1: Business Analysis & Scope
*   **Objectives**: Finalize functional specifications and outline security configurations.
*   **Deliverables**: Completed SRA blueprint.
*   **Learning Goals**: Understand how database constraints map to business rules.

---

### Phase 2: Database Design
*   **Objectives**: Model the relational schema and configure migration pipelines.
*   **Deliverables**: ERDs and schema definitions.
*   **Dependencies**: Phase 1 completion.
*   **Learning Goals**: Learn database normalization (3NF) and index planning.

---

### Phase 3: Project Setup
*   **Objectives**: Setup backend folder structures and configure database connections.
*   **Deliverables**: Core repository configuration files and migration directories.
*   **Dependencies**: Phase 2 completion.
*   **Learning Goals**: Learn directory structures and connection pooling patterns.

---

### Phase 4: Authentication
*   **Objectives**: Setup user authentication and authorization logic.
*   **Deliverables**: Registration and login endpoints, password encryption, and JWT handlers.
*   **Dependencies**: Phase 3 completion.
*   **Learning Goals**: Implement secure password hashing and stateless token verification.

---

### Phase 5: Database Implementation
*   **Objectives**: Build PostgreSQL tables and run migrations.
*   **Deliverables**: Tables created in Neon database.
*   **Dependencies**: Phase 4 completion.
*   **Learning Goals**: Work with Alembic migrations and SQLAlchemy database models.

---

### Phase 6: Core APIs
*   **Objectives**: Build CRUD endpoints for teams, workspaces, and tasks.
*   **Deliverables**: API routers for basic workspace and task management.
*   **Dependencies**: Phase 5 completion.
*   **Learning Goals**: Build REST APIs with request validation.

---

### Phase 7: Frontend Integration
*   **Objectives**: Connect frontend interfaces to backend API endpoints.
*   **Deliverables**: Dynamic dashboard, team settings, and workspace portals.
*   **Dependencies**: Phase 6 completion.
*   **Learning Goals**: Work with asynchronous fetch requests and frontend state updates.

---

### Phase 8: Machine Learning
*   **Objectives**: Implement student-team matchmaking and task suggestions.
*   **Deliverables**: Matching recommendations and task suggestion features.
*   **Dependencies**: Phase 7 completion.
*   **Learning Goals**: Work with classification models and TF-IDF similarity.

---

### Phase 9: Testing
*   **Objectives**: Write unit, integration, and security tests.
*   **Deliverables**: Automated test suite.
*   **Dependencies**: Phase 7 completion.
*   **Learning Goals**: Implement unit tests and performance testing.

---

### Phase 10: Production Deployment
*   **Objectives**: Deploy backend to production environments.
*   **Deliverables**: Live production deployment with automated CI/CD pipelines.
*   **Dependencies**: Phase 9 completion.
*   **Learning Goals**: Learn containerization and cloud database management.
