INSERT INTO "public"."offers" ("id", "title", "description", "offer_type", "created_by", "budget_min", "budget_max", "budget_type", "status", "visibility", "location_preference", "timezone_preference", "tags", "expires_at", "created_at", "updated_at") VALUES
	(1, 'MCP Integration Specialist Needed', 'Looking for an expert to help integrate Model Context Protocol (MCP) into our AI agent marketplace. Need someone with experience in protocol design and agent communication.

## Project Objectives
1. Implement MCP protocol endpoints
2. Create seamless agent-to-agent communication
3. Build robust authentication system
4. Ensure scalable architecture

## Required Skills
• TypeScript/JavaScript
• Protocol Design
• AI Agent Development
• Supabase/PostgreSQL
• REST APIs

## Budget Information
Budget Range: $5000 - $15000
Budget Type: fixed', 'client_offer', '9610a812-c32e-4ee3-910c-0ec8254360c9', 5000.00, 15000.00, 'fixed', 'active', 'public', NULL, NULL, NULL, NULL, '2025-06-20 22:25:55.620431+00', '2025-06-20 22:25:55.620431+00'),
	(2, 'Website Redesign Project', 'Looking for a talented team to redesign our company website with modern UI/UX, responsive design, and improved performance. The site needs to be SEO optimized and mobile-first.', 'client_offer', '9610a812-c32e-4ee3-910c-0ec8254360c9', 8000.00, 15000.00, 'fixed', 'active', 'public', NULL, NULL, NULL, NULL, '2025-06-22 01:23:10.85401+00', '2025-06-22 01:23:10.85401+00'),
	(3, 'Expert React Development Team', 'Professional React development team with 5+ years experience building scalable web applications. We specialize in modern React patterns, TypeScript, and performance optimization.', 'team_offer', '9610a812-c32e-4ee3-910c-0ec8254360c9', NULL, NULL, NULL, 'active', 'public', NULL, NULL, NULL, NULL, '2025-06-22 01:23:17.901703+00', '2025-06-22 01:23:17.901703+00'),
	(4, 'Mobile App Development Project', 'We need a cross-platform mobile app for our e-commerce business. The app should include user authentication, product catalog, shopping cart, payment integration, and push notifications.', 'client_offer', '9610a812-c32e-4ee3-910c-0ec8254360c9', 20000.00, 35000.00, 'fixed', 'active', 'public', NULL, NULL, NULL, NULL, '2025-06-22 01:24:33.270422+00', '2025-06-22 01:24:33.270422+00'),
	(5, 'Full-Stack Python Development Team', 'Experienced Python development team specializing in Django, FastAPI, and data science applications. We build scalable backend systems, APIs, and machine learning solutions with 7+ years of combined experience.', 'team_offer', '9610a812-c32e-4ee3-910c-0ec8254360c9', NULL, NULL, NULL, 'active', 'public', NULL, NULL, NULL, NULL, '2025-06-22 01:24:40.046712+00', '2025-06-22 01:24:40.046712+00'),
	(11, 'Test', 'Test

## Services Offered


## Team Information
Team Size: Flexible
Experience Level: Mid-level', 'team_offer', 'ec26d65b-1189-475e-b0ba-2febf37231bc', 100000.00, 1000000.00, 'negotiable', 'active', 'public', NULL, NULL, NULL, NULL, '2025-06-22 02:29:44.142095+00', '2025-06-22 02:29:44.142095+00');


--
-- Data for Name: bids; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bids" ("id", "offer_id", "bidder_id", "proposal", "proposed_budget", "proposed_timeline", "why_choose_us", "approach", "questions", "status", "created_at", "updated_at") VALUES
	(3, 11, '9610a812-c32e-4ee3-910c-0ec8254360c9', 'Test', 1000000.00, '1 week', 'We are the best', NULL, NULL, 'rejected', '2025-06-22 02:30:14.222799+00', '2025-06-22 03:15:32.958985+00');


--
-- Data for Name: bid_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bid_responses" ("id", "bid_id", "responder_id", "new_status", "response_comment", "created_at") VALUES
	(1, 3, 'ec26d65b-1189-475e-b0ba-2febf37231bc', 'rejected', 'Need it sooner', '2025-06-22 03:15:32.980194+00');


--
-- Data for Name: client_offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."client_offers" ("offer_id", "objectives", "success_criteria", "deliverables", "timeline", "start_date", "deadline", "estimated_duration", "required_skills", "preferred_skills", "project_type", "technical_requirements", "team_size_preference", "experience_level", "communication_style", "project_management_style") VALUES
	(2, '{"Create modern, responsive website design","Improve site performance and loading speed","Implement SEO best practices","Ensure mobile-first responsive design"}', NULL, NULL, NULL, NULL, NULL, NULL, '{React,CSS,JavaScript,SEO,"UI/UX Design"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(4, '{"Build cross-platform mobile app (iOS/Android)","Implement secure user authentication system","Create intuitive product browsing and search","Integrate payment processing (Stripe/PayPal)","Add push notification system"}', NULL, NULL, NULL, NULL, NULL, NULL, '{"React Native",JavaScript,"Mobile UI/UX","Payment Integration","Push Notifications","API Development"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "updated_at", "username", "full_name", "avatar_url", "website", "company_name", "hourly_rate", "availability", "github_url", "linkedin_url", "bio", "role", "created_at", "theme", "mcp_enabled", "skills", "stripe_customer_id") VALUES
	('9610a812-c32e-4ee3-910c-0ec8254360c9', '2025-06-23 19:08:24.389+00', 'lan@primedeviation.com', 'Lan Laucirica', NULL, 'https://primedeviation.com', 'Prime Deviation Technologies Inc', NULL, 'available', NULL, NULL, 'Testing MCP integration - Lan Laucirica is a veteran software engineer and entrepreneur with over 20 years of experience building scalable, AI-driven systems. He leads Prime Deviation where he architects the employable-agents MCP marketplace, enabling seamless human-AI collaboration in hybrid marketplaces.', 'admin', '2025-06-20 16:18:20.731379+00', 'system', true, NULL, NULL),
	('f215102d-9e2a-4e74-bb7f-af0240ef1687', '2025-06-23 19:10:05.389+00', 'lan.laucirica@primedeviation.com', 'Julian Indovina', NULL, 'https://primedeviaition.com', 'Prime Deviation', NULL, 'available', NULL, NULL, NULL, 'admin', '2025-06-20 16:22:13.844139+00', 'system', false, NULL, NULL),
	('ec26d65b-1189-475e-b0ba-2febf37231bc', '2025-06-23 19:12:28.47+00', 'sullivan@primedeviation.com', 'Sullivan Meyer', NULL, 'https://primedeviation.comi', 'Prime Deviation', NULL, 'available', NULL, NULL, NULL, NULL, '2025-06-21 00:34:22.541953+00', 'system', true, NULL, NULL),
	('69462fa4-4411-45b6-a52c-3e02026a0d91', '2025-06-23 06:04:38.17+00', 'reno.denada@gmail.com', 'Reno DeNada', NULL, NULL, NULL, NULL, 'available', NULL, NULL, NULL, NULL, '2025-06-22 02:29:03.982593+00', 'system', false, NULL, NULL);


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."resources" ("id", "name", "role", "skills", "location", "profile_id", "work_history", "projects", "portfolio_urls") VALUES
	(1, 'Jane Doe', 'Frontend Developer', '{React,TypeScript,Tailwind}', 'Remote', NULL, NULL, NULL, NULL),
	(7, 'reno.denada@gmail.com', 'Consultant', '{}', 'Remote', '69462fa4-4411-45b6-a52c-3e02026a0d91', NULL, NULL, NULL),
	(8, 'Lan Laucirica', 'Consultant', '{}', 'Remote', '9610a812-c32e-4ee3-910c-0ec8254360c9', NULL, NULL, NULL),
	(5, 'lan.laucirica@primedeviation.com', 'Consultant', '{}', 'Remote', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', NULL, NULL, NULL),
	(6, 'sullivan@primedeviation.com', 'Consultant', '{}', 'Remote', 'ec26d65b-1189-475e-b0ba-2febf37231bc', NULL, NULL, NULL);


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: contract_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: mcp_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."mcp_tokens" ("id", "user_id", "name", "token_hash", "created_at", "expires_at", "last_used_at", "is_active") VALUES
	('32b2c0f3-1741-40db-9c44-74575acd20e3', '9610a812-c32e-4ee3-910c-0ec8254360c9', 'Test', 'jwt_32b2c0f3-1741-40db-9c44-74575acd20e3', '2025-06-20 16:24:24.317636+00', '2026-06-20 16:24:24.317636+00', NULL, true);


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."teams" ("id", "owner_id", "name", "created_at", "description", "skills", "location", "remote_work", "team_size", "hourly_rate_min", "hourly_rate_max", "availability", "website", "public_profile", "updated_at") VALUES
	(6, '9610a812-c32e-4ee3-910c-0ec8254360c9', 'PrimeD', '2025-06-23 00:45:17.197803+00', 'By aligning humans with AI agents in complementary and synergistic ways, our products enable symbiogenesis of the two. The result is a new type of intelligent agent with capabilities beyond the sum of its parts. 

By tightly integrating AI agents with human executive pilots, we create a hybrid agent. The capabilities of the hybrid intelligence expand as a function of the capabilities of the contributing agents. This gives humanity a path to directly benefit from the exponential advancement of technology, rather than being subsumed and replaced.', '{}', '', true, NULL, 200.00, NULL, 'available', 'https://primedeviation.com', true, '2025-06-23 19:15:13.436552+00'),
	(7, '9610a812-c32e-4ee3-910c-0ec8254360c9', 'Lan Laucirica', '2025-06-23 19:15:51.699085+00', 'I''m a software engineering leader and contributor focusing on AI products and infrastructure, MLOps, DevOps, and SRE.', '{"AI Agents","AI Infrastructure",MLOps,DevOps,AIOps,SRE,"GenAI Apps."}', '', true, 1, 100.00, NULL, 'available', 'https://primedeviation.com', true, '2025-06-23 19:19:25.231149+00');


--
-- Data for Name: team_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."team_invitations" ("id", "team_id", "inviter_id", "invitee_email", "status", "created_at", "expires_at", "accepted_at", "declined_at") VALUES
	('ddbab038-a981-4b86-a756-1a531906e791', 6, '9610a812-c32e-4ee3-910c-0ec8254360c9', 'reno.denada@gmail.com', 'accepted', '2025-06-23 01:14:11.114122+00', '2025-06-30 01:14:11.114122+00', '2025-06-23 01:24:12.040602+00', NULL),
	('b951c30c-3566-4ba3-a85d-e4958ca65026', 6, '9610a812-c32e-4ee3-910c-0ec8254360c9', 'lan.laucirica@primedeviation.com', 'accepted', '2025-06-23 19:10:21.134127+00', '2025-06-30 19:10:21.134127+00', '2025-06-23 19:10:28.675438+00', NULL),
	('6667df0e-d3f1-45d5-98a5-d860f5124ed9', 6, '9610a812-c32e-4ee3-910c-0ec8254360c9', 'sullivan@primedeviation.com', 'accepted', '2025-06-23 19:13:05.7017+00', '2025-06-30 19:13:05.7017+00', '2025-06-23 19:13:17.671073+00', NULL);


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."team_members" ("team_id", "user_id") VALUES
	(6, '9610a812-c32e-4ee3-910c-0ec8254360c9'),
	(6, '69462fa4-4411-45b6-a52c-3e02026a0d91'),
	(6, 'f215102d-9e2a-4e74-bb7f-af0240ef1687'),
	(6, 'ec26d65b-1189-475e-b0ba-2febf37231bc'),
	(7, '9610a812-c32e-4ee3-910c-0ec8254360c9');


--
-- Data for Name: team_offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."team_offers" ("offer_id", "services_offered", "service_categories", "team_size", "team_composition", "methodology", "experience_level", "years_experience", "portfolio_examples", "client_testimonials", "specializations", "certifications", "technologies_expertise", "current_availability", "capacity", "onboarding_process", "communication_approach", "quality_assurance") VALUES
	(3, '{"React development","TypeScript implementation","Performance optimization","Code review and mentoring","Testing and QA"}', NULL, 3, NULL, NULL, 'senior', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(5, '{"Django web development","FastAPI microservices","Data science and ML","Database design and optimization","DevOps and deployment","API design and documentation"}', NULL, 4, NULL, NULL, 'expert', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 46, true);


--
-- Name: bid_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."bid_responses_id_seq"', 1, true);


--
-- Name: bids_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
