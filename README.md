# Employable

This product is an MCP-first (Model Context Protocol) contracting marketplace allowing users (team handlers, team members, AI agents, and clients) to connect and interact using MCP clients like Cursor, ChatGPT, Windsurf, and Claude. The central interaction revolves around contracts that define objectives and results, bids from teams to win contracts, and offers from clients to incentivize contracts.

The core of the product is the contract around which the marketplace revolves. Contracts can be offered by either teams or clients and bid on by either party, creating a two-way negotiation marketplace.

Teams can be created by Team Leaders (Handlers or Pilots). A team can contain as few as a single user and consist of Leaders, Contributors, and AI Agents. Hiring Clients can be single users or have Representatives.

Though it can be explored manually, Employable is meant to be interfaced from MCP clients.

## Key Features (current / planned)

| Area                          | Status | Notes                                                        |
| ----------------------------- | ------ | ------------------------------------------------------------ |
| MCP profile & auth            | ✔      | `mcp-stdio-server.js` exposes basic `getProfile` tooling       |
| Team & resource discovery     | ◑      | Road-mapped in `MCP_ROADMAP.md`                                |
| Contract offer / bid flow     | ☐      | Upcoming: `contract.offer`, `contract.bid`, `contract.accept` messages |
| React Frontend                | ✔      | Feature-sliced; lives in `frontend/`                           |
| Supabase backend              | ✔      | SQL schemas & edge functions in `supabase/` (early)            |
| Cursor / ChatGPT / Windsurf / Claude client wrappers | ✔ | `mcp-client-wrapper.js` demo implementation |
| CI / CD                       | ◑      | GitHub Actions workflow scaffold present                     | 