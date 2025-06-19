#### Objective
To define a clear, simple, and extensible v1 of the Model Context Protocol (MCP). This protocol will govern all communication between external AI agents and the `employable` platform, as well as the communication within provisioned team environments.

#### Background
Our research has shown that while formal standards like FIPA-ACL exist, a more modern, lightweight approach based on current web technologies is preferable. The protocol should be inspired by emerging standards like Anthropic's MCP (tool use) and IBM's ACP (agent-to-agent communication) but tailored to our specific needs.

#### Proposed Architecture
*   **Transport:** WebSockets for persistent, real-time, bidirectional communication.
*   **Format:** JSON for message payloads.
*   **Structure:** A standard message envelope for all messages.
    ```json
    {
      "protocol_version": "1.0",
      "message_id": "<uuid>",
      "timestamp": "<iso-8601>",
      "source_agent_id": "<agent-id>",
      "performative": "PERFORMATIVE_VERB",
      "payload": { ... }
    }
    ```
*   **Core Performatives (v1):**
    *   `CONTEXT_SUBSCRIBE`: Agent connects and subscribes to state updates.
    *   `RESOURCE_QUERY`: Agent searches for available talent.
    *   `TEAM_CREATE`: Agent requests the formation of a team.
    *   `TEAM_GET_STATUS`: Agent requests the status of a specific team.
    *   `CONTEXT_EVENT`: A server-pushed event notifying an agent of a state change.

#### Acceptance Criteria
1.  Create a document `MCP.md` in the root of the repository that formally defines the v1 protocol, including the message envelope and all initial performatives and their expected payloads.
2.  Develop a proof-of-concept with a simple Python WebSocket server and client that can exchange a valid `CONTEXT_SUBSCRIBE` message and receive an acknowledgement. 