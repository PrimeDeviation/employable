#### Objective
To validate that a MicroVM platform, specifically Fly.io, is a suitable technology for our "MCP Server Factory" model. We need to confirm that we can programmatically launch isolated, secure, and network-addressable agent servers on demand.

#### Background
Our core product feature is provisioning new, isolated MCP servers for each team. Research into Firecracker revealed that its speed, security, and density make it the ideal underlying technology. Platforms like Fly.io are built on Firecracker and provide a high-level API that abstracts away the complexity of managing the underlying hosts and virtualization.

#### Proposed Architecture
1.  **Core `employable` App:** Our main application (database, core API, frontend dashboard) remains on Supabase.
2.  **MCP Provisioning Service:** When a team is created, this service triggers.
3.  **Fly.io API Integration:** The service makes API calls to Fly.io to:
    *   Launch a new Fly Machine (Firecracker microVM)
    *   Provide a standardized Docker image containing our MCP server software
    *   Configure environment variables (team ID, credentials, etc.)
    *   Assign a public IP/DNS (e.g., `team-alpha-mcp.fly.dev`)
4.  **Result:** Return the unique address for the newly provisioned MCP server.

#### Acceptance Criteria
1.  Successfully use the Fly.io CLI (`flyctl`) or API to manually launch a simple "hello world" Docker container as a Fly Machine.
2.  Write a Python script that uses the Fly.io API to programmatically launch and destroy a Fly Machine.
3.  Document the estimated costs and potential limitations of this approach in the issue comments.
4.  Create a simple Docker image template that can serve as the base for our MCP servers. 