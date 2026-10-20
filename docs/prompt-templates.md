## Feature Implementation Prompt

Read AGENTS.md and relevant docs first.

Current project guidance:
- Resident auth frontend pages are already fixed and stable unless the task explicitly says otherwise
- Current active feature focus is showing each resident their own redemption points per program (resident Programs page), then the field evaluation; see `docs/current-progress.md` for the current order
- Do not treat auth UI bug fixing as the default task anymore
- Scope every query to the caller's barangay, and keep the code simple and in the existing style

Task:
[exact task]

Context:
[current module / file / feature]

Requirements:
[list of rules]

Constraints:
[do not rewrite unrelated files]


## Readme Files Update Prompt

Please read the following before making any changes:
- AGENTS.md
- PROGRESS.md
- All README files in the project
- The full git log and recent commits
- The actual codebase to verify what is implemented

Then update the documentation to accurately reflect the 
current state of the project.

Rules:
- Do not change coding rules, tech stack, conventions, 
  or any instructional content in AGENTS.md
- Only update progress tracking, completed features, 
  current focus, and next steps sections
- If no progress tracking section exists, add one
- Base everything only on what actually exists in the 
  codebase and commit history — do not mark something 
  as done unless the code is there and working
- Keep the same writing style, tone, and formatting as 
  the existing documentation
- If a README does not exist yet, create one
- After updating, briefly summarize what changed in 
  the documentation

