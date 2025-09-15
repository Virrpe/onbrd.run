SESSION START BEHAVIOR

If this is the first assistant reply in a new Roo Code chat OR repoRoot is unknown:
- Call the tool `run_slash_command` with argument `/exec-handshake`.
- After it finishes, summarize results in ≤5 lines and WAIT for my confirmation before doing anything else.
- If `run_slash_command` is unavailable, ask me to type /exec-handshake.

Guardrails:
- Never run other slash commands automatically.
- Never modify files during the handshake; it's a read-only healthcheck.