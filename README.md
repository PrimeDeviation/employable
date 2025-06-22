# Employable

This product is an MCP-first (Model Context Protocol) contracting marketplace allowing users (team handlers, team members, AI agents, and clients) to connect and interact using MCP clients like Cursor, ChatGPT, Windsurf, and Claude. The central interaction revolves around offers and bids that define project objectives and proposals, creating a two-way negotiation marketplace.

The core of the product is the offer/bid system around which the marketplace revolves. Offers can be created by either teams (offering services) or clients (seeking teams), and both parties can bid on each other's offers, creating a dynamic two-way marketplace.

Teams can be created by Team Leaders (Handlers or Pilots). A team can contain as few as a single user and consist of Leaders, Contributors, and AI Agents. Hiring Clients can be single users or have Representatives.

Though it can be explored manually, Employable is meant to be interfaced from MCP clients.

## Key Features (current / planned)

| Area                          | Status | Notes                                                        |
| ----------------------------- | ------ | ------------------------------------------------------------ |
| MCP profile & auth            | ✔      | Supabase Edge Function exposes `getProfile`, `getMyProfile`, `updateMyProfile` |
| MCP offer & bid system        | ✔      | Full MCP integration: `browseOffers`, `getOfferDetail`, `createOffer` |
| Team & resource discovery     | ✔      | MCP functions: `browseResources`, `getResourceDetail` |
| Offer creation & management   | ✔      | Client offers (seeking teams) and team offers (offering services) |
| Bid submission & management   | ✔      | Users can bid on offers with proposals, budgets, timelines |
| Comment-based negotiation     | ✔      | Accept/decline bids with comments, submit new bids based on feedback |
| React Frontend                | ✔      | Feature-sliced architecture; lives in `frontend/` with offer/bid management |
| Supabase backend              | ✔      | Complete SQL schemas, RLS policies, and edge functions in `supabase/` |
| MCP Client Integration        | ✔      | Direct HTTP connection via Cursor's streamable-http protocol |
| CI / CD                       | ◑      | GitHub Actions workflow scaffold present                     |

## Current Functionality

### Offer System
- **Client Offers**: Organizations can post offers seeking teams with specific skills, objectives, and requirements
- **Team Offers**: Teams can post offers showcasing their services, expertise, and availability
- **Offer Management**: Create, browse, and manage offers with detailed specifications

### Bidding & Negotiation
- **Bid Submission**: Users can submit detailed proposals with budgets and timelines
- **Comment-based Negotiation**: Offer creators can accept/decline bids with explanatory comments
- **Iterative Process**: Bidders can submit new bids based on feedback, enabling smooth negotiation

### MCP Integration
- **Profile Management**: Get and update user profiles via MCP
- **Offer Browsing**: Browse available offers with filtering and search
- **Resource Discovery**: Find consultants and teams with detailed profiles
- **Offer Creation**: Create new offers directly through MCP clients

### User Management
- **Authentication**: Secure user authentication via Supabase
- **Profiles**: Comprehensive user profiles with skills, experience, and availability
- **Team Management**: Create and manage teams with multiple roles 