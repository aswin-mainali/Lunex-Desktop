# Safety rules

Low-risk commands return mock success or safe responses. Medium and high-risk commands require confirmation, except local task/reminder creation from an explicit user text or voice command because it is non-destructive and stored only in Lunex SQLite. Critical commands are blocked. Destructive actions are not implemented in v1.

Wake phrase and double clap are activation-only signals and never execute routed commands.
