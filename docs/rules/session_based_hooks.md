# Session Based Hook Logging

**Trigger:** Creating hooks for real-time visual feedback

## Context
The original implementation using an SSE POST request resulted in transient highlights that vanished quickly and were difficult to debug if the frontend missed the event.

## Axiom
Write hook events to a session-specific `.jsonl` file to maintain a persistent audit trail, rather than sending transient SSE events.