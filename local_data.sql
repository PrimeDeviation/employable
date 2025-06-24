SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '3f9cc0b6-3479-4580-b024-819ec013ecd1', '{"action":"user_signedup","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-06-20 16:18:20.740208+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd1dde277-e479-449e-abab-7eb84e9728cf', '{"action":"login","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-20 16:18:20.745538+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eddbdfbc-f10e-47b3-b3f1-a97891bbb5ac', '{"action":"user_recovery_requested","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-20 16:18:20.757179+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f5b7b6d-d5f2-4ef7-8f74-2fa1c2b03e3e', '{"action":"login","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-20 16:18:27.266699+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd4929c9b-8f7b-4ff2-8bce-90d6b67ada6c', '{"action":"user_signedup","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-06-20 16:22:13.849105+00', ''),
	('00000000-0000-0000-0000-000000000000', '61a39713-6505-41bb-b8f5-5e19aa895d64', '{"action":"login","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-20 16:22:13.852599+00', ''),
	('00000000-0000-0000-0000-000000000000', '8291bb5d-22e4-4ca6-9516-e686cb11e379', '{"action":"user_recovery_requested","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-20 16:22:13.85888+00', ''),
	('00000000-0000-0000-0000-000000000000', '08db9afd-be8e-4847-877d-dbef4199f1f0', '{"action":"login","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-20 16:22:18.917396+00', ''),
	('00000000-0000-0000-0000-000000000000', '484bfb93-c526-4a4d-b84a-286cd886c200', '{"action":"token_refreshed","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-20 21:14:15.647321+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c5e5f1d-a3d5-4b95-9fb5-082fd582e349', '{"action":"token_revoked","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-20 21:14:15.648132+00', ''),
	('00000000-0000-0000-0000-000000000000', '325a7979-1372-46d8-bea0-2905ba9a8347', '{"action":"token_refreshed","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-20 21:23:57.231782+00', ''),
	('00000000-0000-0000-0000-000000000000', '0cf307c7-fe80-4400-9fcd-a213e9b351c3', '{"action":"token_revoked","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-20 21:23:57.23241+00', ''),
	('00000000-0000-0000-0000-000000000000', '2d9e620a-4384-41f4-9582-e7897e949cc2', '{"action":"user_recovery_requested","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-20 21:24:00.8963+00', ''),
	('00000000-0000-0000-0000-000000000000', '118cf28c-f2f7-4ac2-9c92-a6aa9cfed6fe', '{"action":"login","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-20 21:24:08.257655+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b3dddf19-5202-4c79-b520-6302a7471914', '{"action":"token_refreshed","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-20 22:12:47.789145+00', ''),
	('00000000-0000-0000-0000-000000000000', '50861ce0-842d-490a-b3b9-98db918c7121', '{"action":"token_revoked","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-20 22:12:47.789882+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ec0921f-1f30-4f01-a9e4-16ee1beca861', '{"action":"token_refreshed","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-20 22:22:40.396276+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ab2f3c0a-c2f8-4c63-a70b-84fbae5518b5', '{"action":"token_revoked","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-20 22:22:40.39707+00', ''),
	('00000000-0000-0000-0000-000000000000', '7b858240-ca8a-47b2-b78f-2a9158b4935d', '{"action":"token_refreshed","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-20 23:11:18.598539+00', ''),
	('00000000-0000-0000-0000-000000000000', '83c22d1e-5a18-42b4-9042-338e19e3e9fa', '{"action":"token_revoked","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-20 23:11:18.599055+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cfe51497-a099-49c5-a43a-a49193b46618', '{"action":"token_refreshed","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 00:12:17.094667+00', ''),
	('00000000-0000-0000-0000-000000000000', 'baa262c9-d2b7-472d-9210-f13cb6b8ab78', '{"action":"token_revoked","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 00:12:17.095209+00', ''),
	('00000000-0000-0000-0000-000000000000', '0dc2f4fc-ab54-4a10-88f2-94e3077008ea', '{"action":"user_recovery_requested","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-21 00:29:21.822177+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f8d88f3a-21f8-4d10-8d98-e385ff681372', '{"action":"login","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-21 00:29:26.264675+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e5d3fff-d123-44bc-a82d-322915efdeef', '{"action":"user_recovery_requested","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-21 00:31:49.178593+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aa6952b0-583b-42de-bd4b-082d987bb76c', '{"action":"login","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-21 00:31:53.936757+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b7bc971a-63ab-40eb-9a5e-d387be4ca96d', '{"action":"user_signedup","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-06-21 00:34:22.546125+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c795ea52-7abd-48d4-ba78-1366ad00e187', '{"action":"login","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-21 00:34:22.550172+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fd1d7c58-bfda-4ac1-8ea0-30d5dcbb0f27', '{"action":"user_recovery_requested","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-21 00:34:22.556099+00', ''),
	('00000000-0000-0000-0000-000000000000', '39743459-343d-441f-83e8-16acda7abee8', '{"action":"token_refreshed","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 00:34:29.224012+00', ''),
	('00000000-0000-0000-0000-000000000000', '69f0e52d-dbce-4f70-8247-45615829f385', '{"action":"token_revoked","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 00:34:29.22465+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6c7ddac-3309-4421-b7d3-0cbd6171c0af', '{"action":"login","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-21 00:34:33.366532+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af023ef4-2ca0-4da5-b64a-712d31f1b85d', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 01:33:48.699328+00', ''),
	('00000000-0000-0000-0000-000000000000', '1a3372cd-269b-479d-83f0-1c3254ce66c1', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 01:33:48.701004+00', ''),
	('00000000-0000-0000-0000-000000000000', '93e1113c-eeca-445e-a544-f02e2dce7c28', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 03:49:49.274588+00', ''),
	('00000000-0000-0000-0000-000000000000', '3db63e62-51b0-4306-9707-0a20057acd57', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 03:49:49.275514+00', ''),
	('00000000-0000-0000-0000-000000000000', '2e7b1438-6c92-4c33-8e68-47ee3bd7d689', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 17:26:24.282137+00', ''),
	('00000000-0000-0000-0000-000000000000', '5dfdbed1-1817-488c-9d4b-d95fbd20fafa', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 17:26:24.282868+00', ''),
	('00000000-0000-0000-0000-000000000000', '33fe99e7-c1dc-4235-bff2-f694989652b1', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 20:17:09.322185+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e8e6de9-fd09-4d14-8600-c8ed230144fd', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 20:17:09.322754+00', ''),
	('00000000-0000-0000-0000-000000000000', '5c09e06b-3796-47bb-a259-ade0543ea063', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 21:18:24.808448+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bae69752-284b-4da1-9821-7e3ed4c9f471', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-21 21:18:24.809029+00', ''),
	('00000000-0000-0000-0000-000000000000', '30c2c31e-a10c-4d53-963b-c0f9d87c46fc', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 01:03:09.728172+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eafd29f3-56a3-4dcd-a9cc-92a540363e30', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 01:03:09.728903+00', ''),
	('00000000-0000-0000-0000-000000000000', '5580e31f-365a-4652-b3ea-512fd5638fcf', '{"action":"user_recovery_requested","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-22 01:34:59.490719+00', ''),
	('00000000-0000-0000-0000-000000000000', '49516135-d502-4e34-a950-ad96f558b36a', '{"action":"login","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-22 01:35:03.917644+00', ''),
	('00000000-0000-0000-0000-000000000000', '4864d08f-561d-4081-b6ff-c87478cf5d38', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 02:08:58.867181+00', ''),
	('00000000-0000-0000-0000-000000000000', '37174902-0a68-437b-ae35-ff6da32011fd', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 02:08:58.868048+00', ''),
	('00000000-0000-0000-0000-000000000000', '70175a65-e8d7-4ed5-bb6a-194ad86bc6ba', '{"action":"user_signedup","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-06-22 02:29:03.98873+00', ''),
	('00000000-0000-0000-0000-000000000000', '76e26e62-1b60-4fd1-800d-8c9b22b99a11', '{"action":"login","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-22 02:29:03.992185+00', ''),
	('00000000-0000-0000-0000-000000000000', '3af72a62-eb1b-4a9b-8dc9-8a66c4d28d50', '{"action":"user_recovery_requested","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-06-22 02:29:03.998529+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e2a02ebb-2d0a-4fb1-a725-ed65cd842e3d', '{"action":"login","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-22 02:29:15.431884+00', ''),
	('00000000-0000-0000-0000-000000000000', '88ba2a71-1df9-4999-8eec-76d9e7adcbeb', '{"action":"token_refreshed","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 02:33:34.820635+00', ''),
	('00000000-0000-0000-0000-000000000000', '72c264d7-3b38-4fbb-aca1-87fccfd92360', '{"action":"token_revoked","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 02:33:34.822882+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f84b50ad-6a6f-471a-af83-68b20c5febff', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 03:07:32.872104+00', ''),
	('00000000-0000-0000-0000-000000000000', '0bda183d-e77c-49c6-9642-05a780cab3f6', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 03:07:32.8732+00', ''),
	('00000000-0000-0000-0000-000000000000', '9542f198-8ed9-463e-ba2d-8bfd36ef5b9c', '{"action":"user_recovery_requested","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-22 03:08:17.445477+00', ''),
	('00000000-0000-0000-0000-000000000000', '790ce5e3-d3e1-48f5-9324-593382a10c8a', '{"action":"login","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-22 03:08:22.489338+00', ''),
	('00000000-0000-0000-0000-000000000000', '2944baeb-b338-41b8-9a32-0e1439859d00', '{"action":"token_refreshed","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 06:15:48.968249+00', ''),
	('00000000-0000-0000-0000-000000000000', '106c3687-f3bb-48c9-8c63-a1f0adee9e14', '{"action":"token_revoked","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 06:15:48.968842+00', ''),
	('00000000-0000-0000-0000-000000000000', '49fb12cd-b6e4-4d24-9a55-b9dfac5e76c2', '{"action":"token_refreshed","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 17:11:09.264917+00', ''),
	('00000000-0000-0000-0000-000000000000', '9793e978-b4c3-425c-b9da-356767e4d9da', '{"action":"token_revoked","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 17:11:09.265959+00', ''),
	('00000000-0000-0000-0000-000000000000', '684de630-da98-4d37-8134-3db791ebdd4c', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 22:58:56.565731+00', ''),
	('00000000-0000-0000-0000-000000000000', '1b542be9-7347-4b7e-9622-35edd62f0d50', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-22 22:58:56.56639+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a910a739-f60f-4d95-97a6-f50ca1e4d594', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 00:13:16.141172+00', ''),
	('00000000-0000-0000-0000-000000000000', '4fa1a7f1-f73f-4db2-8559-0a34b421480e', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 00:13:16.14275+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b942c413-afc0-4dc6-8a4b-60bd22b0789a', '{"action":"token_refreshed","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 00:29:40.057409+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ae8a7c52-4ae1-42cb-8656-9204321b67f3', '{"action":"token_revoked","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 00:29:40.05803+00', ''),
	('00000000-0000-0000-0000-000000000000', '2b936160-9ba3-4796-93dc-67e0d54279a0', '{"action":"token_refreshed","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 01:02:10.44892+00', ''),
	('00000000-0000-0000-0000-000000000000', '4374b499-6bea-4ff1-a9f1-05fe831b6986', '{"action":"token_revoked","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 01:02:10.450617+00', ''),
	('00000000-0000-0000-0000-000000000000', '910d5160-ee76-4b2b-9c31-ab2e33750101', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 01:12:45.660919+00', ''),
	('00000000-0000-0000-0000-000000000000', '77c6b538-29ab-4ded-9e38-8279bdf76d54', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 01:12:45.661471+00', ''),
	('00000000-0000-0000-0000-000000000000', '77ae8f0b-b0c8-4767-a378-7fc42b9e7cee', '{"action":"token_refreshed","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 18:48:40.47081+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c477c23-7e3b-467b-bbe9-5abbbe79e284', '{"action":"token_revoked","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 18:48:40.471754+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c97babb-78f6-4c6b-8ed5-fa6f2ae89052', '{"action":"user_recovery_requested","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-23 19:09:20.639377+00', ''),
	('00000000-0000-0000-0000-000000000000', '1fbb49d3-56cc-49b5-ab68-c3fe003d8e42', '{"action":"login","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-23 19:09:33.069271+00', ''),
	('00000000-0000-0000-0000-000000000000', '26ba3bf4-8f12-4266-b940-524f199c4e0d', '{"action":"user_recovery_requested","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-23 19:11:39.355851+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2e21c8e-577f-4d20-8228-43bc5a619900', '{"action":"login","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-23 19:11:50.552012+00', ''),
	('00000000-0000-0000-0000-000000000000', '81e187b7-c6a8-4ff8-bbdb-7828ead57df1', '{"action":"token_refreshed","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 19:47:29.358967+00', ''),
	('00000000-0000-0000-0000-000000000000', '8889c594-5f0b-4698-af4a-f7eeaaae6d93', '{"action":"token_revoked","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 19:47:29.359561+00', ''),
	('00000000-0000-0000-0000-000000000000', '16a3fb9b-38c4-4335-b0a7-470ad6985c09', '{"action":"token_refreshed","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 20:24:50.069052+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f2ce2bbe-3683-4945-b439-183f36582081', '{"action":"token_revoked","actor_id":"f215102d-9e2a-4e74-bb7f-af0240ef1687","actor_username":"lan.laucirica@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 20:24:50.069784+00', ''),
	('00000000-0000-0000-0000-000000000000', '48f20d65-b367-497b-a342-deb3c423d5e1', '{"action":"token_refreshed","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 01:27:56.507541+00', ''),
	('00000000-0000-0000-0000-000000000000', '8627e00d-b549-454c-a5f6-3126228836da', '{"action":"token_revoked","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 01:27:56.5089+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e1d5b7d8-f48a-4eae-ba83-1f68a93b4bfc', '{"action":"user_recovery_requested","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"user"}', '2025-06-23 05:52:42.276581+00', ''),
	('00000000-0000-0000-0000-000000000000', '49d44162-d52d-4b67-88e8-8c9583806416', '{"action":"login","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"account"}', '2025-06-23 05:54:42.501603+00', ''),
	('00000000-0000-0000-0000-000000000000', '386e3a38-ba06-4f5c-b1eb-e2aa25023551', '{"action":"user_recovery_requested","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-06-23 05:55:03.318592+00', ''),
	('00000000-0000-0000-0000-000000000000', '5d66a1ee-72a2-4a76-8ecf-a1d035dbd194', '{"action":"login","actor_id":"69462fa4-4411-45b6-a52c-3e02026a0d91","actor_username":"reno.denada@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-23 05:55:07.936182+00', ''),
	('00000000-0000-0000-0000-000000000000', '8167162f-3132-46ed-9085-b6cdabc3af96', '{"action":"token_refreshed","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 18:48:40.470812+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd4c200cb-077c-4103-ac89-ce65bd9aa4fc', '{"action":"token_revoked","actor_id":"9610a812-c32e-4ee3-910c-0ec8254360c9","actor_username":"lan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 18:48:40.471721+00', ''),
	('00000000-0000-0000-0000-000000000000', '8001383a-820d-4994-961f-016fc679c846', '{"action":"token_refreshed","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 20:24:50.06873+00', ''),
	('00000000-0000-0000-0000-000000000000', '18096006-ec48-47c5-b750-88d1f81d4e3b', '{"action":"token_revoked","actor_id":"ec26d65b-1189-475e-b0ba-2febf37231bc","actor_username":"sullivan@primedeviation.com","actor_via_sso":false,"log_type":"token"}', '2025-06-23 20:24:50.069393+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '69462fa4-4411-45b6-a52c-3e02026a0d91', 'authenticated', 'authenticated', 'reno.denada@gmail.com', '$2a$10$JzW6fitCQnZ32C4bNyn5i.aAmXaQ3JYOUdo4kZ42PbrwicHTRUs4q', '2025-06-22 02:29:03.989123+00', NULL, '', NULL, '', '2025-06-23 05:55:03.319279+00', '', '', NULL, '2025-06-23 05:55:07.937656+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "69462fa4-4411-45b6-a52c-3e02026a0d91", "email": "reno.denada@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-06-22 02:29:03.982886+00', '2025-06-23 19:47:29.360968+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9610a812-c32e-4ee3-910c-0ec8254360c9', 'authenticated', 'authenticated', 'lan@primedeviation.com', '$2a$10$ob3YGT2GYz92r24jgYTVAu4yEHa832xhRbOrwctzzo9Wdi19KTale', '2025-06-20 16:18:20.741301+00', NULL, '', NULL, '', '2025-06-23 05:52:42.277147+00', '', '', NULL, '2025-06-23 05:54:42.503313+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "9610a812-c32e-4ee3-910c-0ec8254360c9", "email": "lan@primedeviation.com", "email_verified": true, "phone_verified": false}', NULL, '2025-06-20 16:18:20.731379+00', '2025-06-23 18:48:40.473914+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ec26d65b-1189-475e-b0ba-2febf37231bc', 'authenticated', 'authenticated', 'sullivan@primedeviation.com', '$2a$10$H8Nh.eAQ08MgVQV69PXLae3rf9NkRrf/eg2M2SOPgR8MLL7Tq2qXK', '2025-06-21 00:34:22.546569+00', NULL, '', NULL, '', '2025-06-23 19:11:39.356391+00', '', '', NULL, '2025-06-23 19:11:50.553798+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "ec26d65b-1189-475e-b0ba-2febf37231bc", "email": "sullivan@primedeviation.com", "email_verified": true, "phone_verified": false}', NULL, '2025-06-21 00:34:22.542166+00', '2025-06-23 20:24:50.071676+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', 'authenticated', 'authenticated', 'lan.laucirica@primedeviation.com', '$2a$10$o7xVvbik/P0/L3Y6qt93HOyle0UMlVTpIMmWo2Y6va6EnBPKxiC1.', '2025-06-20 16:22:13.849518+00', NULL, '', NULL, '', '2025-06-23 19:09:20.640075+00', '', '', NULL, '2025-06-23 19:09:33.070756+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f215102d-9e2a-4e74-bb7f-af0240ef1687", "email": "lan.laucirica@primedeviation.com", "email_verified": true, "phone_verified": false}', NULL, '2025-06-20 16:22:13.844351+00', '2025-06-23 20:24:50.072052+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('9610a812-c32e-4ee3-910c-0ec8254360c9', '9610a812-c32e-4ee3-910c-0ec8254360c9', '{"sub": "9610a812-c32e-4ee3-910c-0ec8254360c9", "email": "lan@primedeviation.com", "email_verified": false, "phone_verified": false}', 'email', '2025-06-20 16:18:20.73808+00', '2025-06-20 16:18:20.738105+00', '2025-06-20 16:18:20.738105+00', '5fe29fb3-3f1b-4586-849e-d6274f0becb7'),
	('f215102d-9e2a-4e74-bb7f-af0240ef1687', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', '{"sub": "f215102d-9e2a-4e74-bb7f-af0240ef1687", "email": "lan.laucirica@primedeviation.com", "email_verified": false, "phone_verified": false}', 'email', '2025-06-20 16:22:13.847785+00', '2025-06-20 16:22:13.84781+00', '2025-06-20 16:22:13.84781+00', 'cb9d27af-d5c2-43df-8269-6ef652d74a4c'),
	('ec26d65b-1189-475e-b0ba-2febf37231bc', 'ec26d65b-1189-475e-b0ba-2febf37231bc', '{"sub": "ec26d65b-1189-475e-b0ba-2febf37231bc", "email": "sullivan@primedeviation.com", "email_verified": false, "phone_verified": false}', 'email', '2025-06-21 00:34:22.544556+00', '2025-06-21 00:34:22.544592+00', '2025-06-21 00:34:22.544592+00', 'b1ef8177-8351-4079-9c29-065e2a7fcd2e'),
	('69462fa4-4411-45b6-a52c-3e02026a0d91', '69462fa4-4411-45b6-a52c-3e02026a0d91', '{"sub": "69462fa4-4411-45b6-a52c-3e02026a0d91", "email": "reno.denada@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-06-22 02:29:03.9869+00', '2025-06-22 02:29:03.986923+00', '2025-06-22 02:29:03.986923+00', 'e03f7a2e-3713-4b2e-916a-214d9892c806');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('bbca336b-090a-495e-8d76-9f26c9f161ed', '9610a812-c32e-4ee3-910c-0ec8254360c9', '2025-06-20 16:18:20.746138+00', '2025-06-20 16:18:20.746138+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('5aafadb1-3de1-4f20-9bbb-ec8fe84e17f3', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', '2025-06-20 16:22:13.853158+00', '2025-06-20 16:22:13.853158+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('6fdcf565-875b-4d4f-b3ca-d89c612f7220', '69462fa4-4411-45b6-a52c-3e02026a0d91', '2025-06-22 02:29:15.43323+00', '2025-06-23 01:02:10.455288+00', NULL, 'aal1', NULL, '2025-06-23 01:02:10.455252', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('78690cc6-8d2c-4cae-a4a3-6a91a949b510', '9610a812-c32e-4ee3-910c-0ec8254360c9', '2025-06-20 16:18:27.268017+00', '2025-06-20 21:23:57.234432+00', NULL, 'aal1', NULL, '2025-06-20 21:23:57.234389', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('82702d52-fc0b-4e3c-8f7d-41140f287387', 'ec26d65b-1189-475e-b0ba-2febf37231bc', '2025-06-21 00:34:33.36815+00', '2025-06-23 01:12:45.663593+00', NULL, 'aal1', NULL, '2025-06-23 01:12:45.66356', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('86710257-19a6-48fe-af45-cb9fd34136e2', '9610a812-c32e-4ee3-910c-0ec8254360c9', '2025-06-22 03:08:22.491329+00', '2025-06-23 01:27:56.511179+00', NULL, 'aal1', NULL, '2025-06-23 01:27:56.511145', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('a2e0f106-6c1d-4123-b9c6-9110d0c70b83', '9610a812-c32e-4ee3-910c-0ec8254360c9', '2025-06-20 21:24:08.259088+00', '2025-06-21 00:12:17.097186+00', NULL, 'aal1', NULL, '2025-06-21 00:12:17.097151', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('29a59e3b-e65a-4f1f-96c0-6ac30f311e64', '9610a812-c32e-4ee3-910c-0ec8254360c9', '2025-06-21 00:29:26.266257+00', '2025-06-21 00:29:26.266257+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('2d6524be-83c7-4c0b-ba70-a91981cf7ae4', '9610a812-c32e-4ee3-910c-0ec8254360c9', '2025-06-21 00:31:53.938237+00', '2025-06-21 00:31:53.938237+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('2e73ea87-515c-405b-b9c7-3bdcec87c203', 'ec26d65b-1189-475e-b0ba-2febf37231bc', '2025-06-21 00:34:22.550646+00', '2025-06-21 00:34:22.550646+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('8616e162-d4ec-436f-bf0c-2a5473c6af14', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', '2025-06-20 16:22:18.918995+00', '2025-06-21 00:34:29.227297+00', NULL, 'aal1', NULL, '2025-06-21 00:34:29.227262', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('ea37ea5b-f3ea-4542-b8d1-a97ee61d4839', '9610a812-c32e-4ee3-910c-0ec8254360c9', '2025-06-23 05:54:42.50335+00', '2025-06-23 18:48:40.474723+00', NULL, 'aal1', NULL, '2025-06-23 18:48:40.474683', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('090c9f8a-e326-442b-bc1f-90147efcb9aa', '69462fa4-4411-45b6-a52c-3e02026a0d91', '2025-06-23 05:55:07.937716+00', '2025-06-23 19:47:29.361752+00', NULL, 'aal1', NULL, '2025-06-23 19:47:29.361718', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('01c09bce-5f53-4315-ab66-e8c9ab8e21d0', 'ec26d65b-1189-475e-b0ba-2febf37231bc', '2025-06-23 19:11:50.553842+00', '2025-06-23 20:24:50.072791+00', NULL, 'aal1', NULL, '2025-06-23 20:24:50.072753', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('63be834d-ab8f-4771-a75a-e677daea8c43', '69462fa4-4411-45b6-a52c-3e02026a0d91', '2025-06-22 02:29:03.992662+00', '2025-06-22 02:29:03.992662+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('646ad69c-775a-4eea-8ec5-904242f555dc', '9610a812-c32e-4ee3-910c-0ec8254360c9', '2025-06-22 01:35:03.919146+00', '2025-06-22 02:33:34.825244+00', NULL, 'aal1', NULL, '2025-06-22 02:33:34.82521', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('5db5ade4-2a98-401c-b5cb-4815bb7b8ad4', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', '2025-06-23 19:09:33.070791+00', '2025-06-23 20:24:50.072924+00', NULL, 'aal1', NULL, '2025-06-23 20:24:50.072889', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '172.18.0.1', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('bbca336b-090a-495e-8d76-9f26c9f161ed', '2025-06-20 16:18:20.749462+00', '2025-06-20 16:18:20.749462+00', 'password', 'f5310716-b943-4512-bb0f-fa517c65d843'),
	('78690cc6-8d2c-4cae-a4a3-6a91a949b510', '2025-06-20 16:18:27.270146+00', '2025-06-20 16:18:27.270146+00', 'otp', 'a438ecff-f267-42d0-824e-a1d9eb90aa2f'),
	('5aafadb1-3de1-4f20-9bbb-ec8fe84e17f3', '2025-06-20 16:22:13.85462+00', '2025-06-20 16:22:13.85462+00', 'password', '03520315-fe0d-4e02-936a-dd7175a71b49'),
	('8616e162-d4ec-436f-bf0c-2a5473c6af14', '2025-06-20 16:22:18.92065+00', '2025-06-20 16:22:18.92065+00', 'otp', 'c8ae26c6-2b4a-4e3a-96e0-41ff18f6203f'),
	('a2e0f106-6c1d-4123-b9c6-9110d0c70b83', '2025-06-20 21:24:08.260437+00', '2025-06-20 21:24:08.260437+00', 'otp', 'd9ef4761-023e-44ff-83c7-811c25602137'),
	('29a59e3b-e65a-4f1f-96c0-6ac30f311e64', '2025-06-21 00:29:26.267768+00', '2025-06-21 00:29:26.267768+00', 'otp', '30f5480d-4746-4d42-ad5d-27c6d3bcd603'),
	('2d6524be-83c7-4c0b-ba70-a91981cf7ae4', '2025-06-21 00:31:53.939816+00', '2025-06-21 00:31:53.939816+00', 'otp', '6a3a0570-e7cb-41b5-a40b-0d8251256294'),
	('2e73ea87-515c-405b-b9c7-3bdcec87c203', '2025-06-21 00:34:22.551961+00', '2025-06-21 00:34:22.551961+00', 'password', '9df978cb-7c25-471c-ab37-9540dd746f05'),
	('82702d52-fc0b-4e3c-8f7d-41140f287387', '2025-06-21 00:34:33.370035+00', '2025-06-21 00:34:33.370035+00', 'otp', 'bfe23da7-8a82-4e2f-86ac-f1a36f8710de'),
	('646ad69c-775a-4eea-8ec5-904242f555dc', '2025-06-22 01:35:03.924649+00', '2025-06-22 01:35:03.924649+00', 'otp', '74223a33-6c33-43c2-baa9-0df1a8289391'),
	('63be834d-ab8f-4771-a75a-e677daea8c43', '2025-06-22 02:29:03.994524+00', '2025-06-22 02:29:03.994524+00', 'password', '564b99bb-d601-45e5-ae35-0b488bb21ffc'),
	('6fdcf565-875b-4d4f-b3ca-d89c612f7220', '2025-06-22 02:29:15.434632+00', '2025-06-22 02:29:15.434632+00', 'otp', '72fb3423-0294-46ed-b7a4-6bbd509a7a6c'),
	('86710257-19a6-48fe-af45-cb9fd34136e2', '2025-06-22 03:08:22.492986+00', '2025-06-22 03:08:22.492986+00', 'otp', 'e427cad6-8182-4833-89ac-3db22ba33e6f'),
	('ea37ea5b-f3ea-4542-b8d1-a97ee61d4839', '2025-06-23 05:54:42.505939+00', '2025-06-23 05:54:42.505939+00', 'otp', '70479d9f-8201-4612-8710-1b0d6630f757'),
	('090c9f8a-e326-442b-bc1f-90147efcb9aa', '2025-06-23 05:55:07.939266+00', '2025-06-23 05:55:07.939266+00', 'otp', '260fcf63-9858-490b-957d-38d412478dfd'),
	('5db5ade4-2a98-401c-b5cb-4815bb7b8ad4', '2025-06-23 19:09:33.074047+00', '2025-06-23 19:09:33.074047+00', 'otp', 'b556c355-a2e3-46b3-a356-d0d66fbc7f1b'),
	('01c09bce-5f53-4315-ab66-e8c9ab8e21d0', '2025-06-23 19:11:50.555482+00', '2025-06-23 19:11:50.555482+00', 'otp', '71307f6e-9f09-4fd3-94ce-2b088228a6b5');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 1, 'lcl3zjwayfpd', '9610a812-c32e-4ee3-910c-0ec8254360c9', false, '2025-06-20 16:18:20.747762+00', '2025-06-20 16:18:20.747762+00', NULL, 'bbca336b-090a-495e-8d76-9f26c9f161ed'),
	('00000000-0000-0000-0000-000000000000', 3, '3jkdxrsmqgik', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', false, '2025-06-20 16:22:13.853706+00', '2025-06-20 16:22:13.853706+00', NULL, '5aafadb1-3de1-4f20-9bbb-ec8fe84e17f3'),
	('00000000-0000-0000-0000-000000000000', 4, 'ktqriy2tdt6t', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', true, '2025-06-20 16:22:18.919598+00', '2025-06-20 21:14:15.648646+00', NULL, '8616e162-d4ec-436f-bf0c-2a5473c6af14'),
	('00000000-0000-0000-0000-000000000000', 2, 'ulym6o4coso4', '9610a812-c32e-4ee3-910c-0ec8254360c9', true, '2025-06-20 16:18:27.268869+00', '2025-06-20 21:23:57.232839+00', NULL, '78690cc6-8d2c-4cae-a4a3-6a91a949b510'),
	('00000000-0000-0000-0000-000000000000', 6, '2zitf7vpv6tu', '9610a812-c32e-4ee3-910c-0ec8254360c9', false, '2025-06-20 21:23:57.233099+00', '2025-06-20 21:23:57.233099+00', 'ulym6o4coso4', '78690cc6-8d2c-4cae-a4a3-6a91a949b510'),
	('00000000-0000-0000-0000-000000000000', 5, 'voybwuy5g7s3', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', true, '2025-06-20 21:14:15.650351+00', '2025-06-20 22:12:47.790428+00', 'ktqriy2tdt6t', '8616e162-d4ec-436f-bf0c-2a5473c6af14'),
	('00000000-0000-0000-0000-000000000000', 7, 'yagzdmvtxnbb', '9610a812-c32e-4ee3-910c-0ec8254360c9', true, '2025-06-20 21:24:08.259701+00', '2025-06-20 22:22:40.397758+00', NULL, 'a2e0f106-6c1d-4123-b9c6-9110d0c70b83'),
	('00000000-0000-0000-0000-000000000000', 8, 'kaw22fz2egc4', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', true, '2025-06-20 22:12:47.790715+00', '2025-06-20 23:11:18.59949+00', 'voybwuy5g7s3', '8616e162-d4ec-436f-bf0c-2a5473c6af14'),
	('00000000-0000-0000-0000-000000000000', 9, 'i2l2j3cw3kfy', '9610a812-c32e-4ee3-910c-0ec8254360c9', true, '2025-06-20 22:22:40.398101+00', '2025-06-21 00:12:17.095665+00', 'yagzdmvtxnbb', 'a2e0f106-6c1d-4123-b9c6-9110d0c70b83'),
	('00000000-0000-0000-0000-000000000000', 11, '43jhyq6wn2cw', '9610a812-c32e-4ee3-910c-0ec8254360c9', false, '2025-06-21 00:12:17.095932+00', '2025-06-21 00:12:17.095932+00', 'i2l2j3cw3kfy', 'a2e0f106-6c1d-4123-b9c6-9110d0c70b83'),
	('00000000-0000-0000-0000-000000000000', 12, 'tjfw46xeqej5', '9610a812-c32e-4ee3-910c-0ec8254360c9', false, '2025-06-21 00:29:26.266865+00', '2025-06-21 00:29:26.266865+00', NULL, '29a59e3b-e65a-4f1f-96c0-6ac30f311e64'),
	('00000000-0000-0000-0000-000000000000', 13, 'zvnd3vf7xt6w', '9610a812-c32e-4ee3-910c-0ec8254360c9', false, '2025-06-21 00:31:53.938908+00', '2025-06-21 00:31:53.938908+00', NULL, '2d6524be-83c7-4c0b-ba70-a91981cf7ae4'),
	('00000000-0000-0000-0000-000000000000', 14, 's3dlioweh2o5', 'ec26d65b-1189-475e-b0ba-2febf37231bc', false, '2025-06-21 00:34:22.551166+00', '2025-06-21 00:34:22.551166+00', NULL, '2e73ea87-515c-405b-b9c7-3bdcec87c203'),
	('00000000-0000-0000-0000-000000000000', 10, '7q7a7kwsfgvp', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', true, '2025-06-20 23:11:18.599736+00', '2025-06-21 00:34:29.225152+00', 'kaw22fz2egc4', '8616e162-d4ec-436f-bf0c-2a5473c6af14'),
	('00000000-0000-0000-0000-000000000000', 15, 'iracxwkxpamu', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', false, '2025-06-21 00:34:29.225442+00', '2025-06-21 00:34:29.225442+00', '7q7a7kwsfgvp', '8616e162-d4ec-436f-bf0c-2a5473c6af14'),
	('00000000-0000-0000-0000-000000000000', 16, 'tidvhzq5ywkd', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-21 00:34:33.369108+00', '2025-06-21 01:33:48.701779+00', NULL, '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 17, 'py3vkrqgmvik', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-21 01:33:48.70207+00', '2025-06-21 03:49:49.276115+00', 'tidvhzq5ywkd', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 18, 'm6jnlberv3n4', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-21 03:49:49.276382+00', '2025-06-21 17:26:24.283354+00', 'py3vkrqgmvik', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 19, 'p67fbdnsicx3', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-21 17:26:24.283609+00', '2025-06-21 20:17:09.323238+00', 'm6jnlberv3n4', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 20, 'zbsg4qbex2fa', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-21 20:17:09.323475+00', '2025-06-21 21:18:24.809556+00', 'p67fbdnsicx3', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 21, 'lwdmlzyv67al', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-21 21:18:24.809802+00', '2025-06-22 01:03:09.729858+00', 'zbsg4qbex2fa', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 22, 'lqvxcigugfzy', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-22 01:03:09.730207+00', '2025-06-22 02:08:58.869002+00', 'lwdmlzyv67al', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 25, 'szt6mlaje46n', '69462fa4-4411-45b6-a52c-3e02026a0d91', false, '2025-06-22 02:29:03.993741+00', '2025-06-22 02:29:03.993741+00', NULL, '63be834d-ab8f-4771-a75a-e677daea8c43'),
	('00000000-0000-0000-0000-000000000000', 23, 'souowhy2wfwm', '9610a812-c32e-4ee3-910c-0ec8254360c9', true, '2025-06-22 01:35:03.921656+00', '2025-06-22 02:33:34.823399+00', NULL, '646ad69c-775a-4eea-8ec5-904242f555dc'),
	('00000000-0000-0000-0000-000000000000', 27, 'jba52yzxlh3d', '9610a812-c32e-4ee3-910c-0ec8254360c9', false, '2025-06-22 02:33:34.823668+00', '2025-06-22 02:33:34.823668+00', 'souowhy2wfwm', '646ad69c-775a-4eea-8ec5-904242f555dc'),
	('00000000-0000-0000-0000-000000000000', 24, 'asaftwlz6eqt', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-22 02:08:58.869416+00', '2025-06-22 03:07:32.873807+00', 'lqvxcigugfzy', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 29, 'aezetrm2jeuq', '9610a812-c32e-4ee3-910c-0ec8254360c9', true, '2025-06-22 03:08:22.492044+00', '2025-06-22 06:15:48.969331+00', NULL, '86710257-19a6-48fe-af45-cb9fd34136e2'),
	('00000000-0000-0000-0000-000000000000', 30, 'hgei7bpogix6', '9610a812-c32e-4ee3-910c-0ec8254360c9', true, '2025-06-22 06:15:48.969588+00', '2025-06-22 17:11:09.266764+00', 'aezetrm2jeuq', '86710257-19a6-48fe-af45-cb9fd34136e2'),
	('00000000-0000-0000-0000-000000000000', 28, 'uqz5zzrsvgpu', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-22 03:07:32.874469+00', '2025-06-22 22:58:56.567004+00', 'asaftwlz6eqt', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 32, 'uc2vjtsotonf', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-22 22:58:56.567349+00', '2025-06-23 00:13:16.143517+00', 'uqz5zzrsvgpu', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 31, '2u2kkcubttxs', '9610a812-c32e-4ee3-910c-0ec8254360c9', true, '2025-06-22 17:11:09.267381+00', '2025-06-23 00:29:40.059173+00', 'hgei7bpogix6', '86710257-19a6-48fe-af45-cb9fd34136e2'),
	('00000000-0000-0000-0000-000000000000', 26, 'towzsoerj277', '69462fa4-4411-45b6-a52c-3e02026a0d91', true, '2025-06-22 02:29:15.433799+00', '2025-06-23 01:02:10.451459+00', NULL, '6fdcf565-875b-4d4f-b3ca-d89c612f7220'),
	('00000000-0000-0000-0000-000000000000', 35, 'gtlci4ntenwe', '69462fa4-4411-45b6-a52c-3e02026a0d91', false, '2025-06-23 01:02:10.453491+00', '2025-06-23 01:02:10.453491+00', 'towzsoerj277', '6fdcf565-875b-4d4f-b3ca-d89c612f7220'),
	('00000000-0000-0000-0000-000000000000', 33, 'ovdcvuoqgqsw', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-23 00:13:16.144037+00', '2025-06-23 01:12:45.661988+00', 'uc2vjtsotonf', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 36, 'ui54dl3d6w4j', 'ec26d65b-1189-475e-b0ba-2febf37231bc', false, '2025-06-23 01:12:45.662305+00', '2025-06-23 01:12:45.662305+00', 'ovdcvuoqgqsw', '82702d52-fc0b-4e3c-8f7d-41140f287387'),
	('00000000-0000-0000-0000-000000000000', 34, 'qqzbv7m3knje', '9610a812-c32e-4ee3-910c-0ec8254360c9', true, '2025-06-23 00:29:40.059656+00', '2025-06-23 01:27:56.509444+00', '2u2kkcubttxs', '86710257-19a6-48fe-af45-cb9fd34136e2'),
	('00000000-0000-0000-0000-000000000000', 37, '4vznl3wkelio', '9610a812-c32e-4ee3-910c-0ec8254360c9', false, '2025-06-23 01:27:56.509838+00', '2025-06-23 01:27:56.509838+00', 'qqzbv7m3knje', '86710257-19a6-48fe-af45-cb9fd34136e2'),
	('00000000-0000-0000-0000-000000000000', 39, 'lzpiywh42kyh', '69462fa4-4411-45b6-a52c-3e02026a0d91', true, '2025-06-23 05:55:07.938379+00', '2025-06-23 18:48:40.472382+00', NULL, '090c9f8a-e326-442b-bc1f-90147efcb9aa'),
	('00000000-0000-0000-0000-000000000000', 38, 't5kzxy32dpsu', '9610a812-c32e-4ee3-910c-0ec8254360c9', true, '2025-06-23 05:54:42.505014+00', '2025-06-23 18:48:40.472772+00', NULL, 'ea37ea5b-f3ea-4542-b8d1-a97ee61d4839'),
	('00000000-0000-0000-0000-000000000000', 41, 'fucbowattcsp', '9610a812-c32e-4ee3-910c-0ec8254360c9', false, '2025-06-23 18:48:40.47311+00', '2025-06-23 18:48:40.47311+00', 't5kzxy32dpsu', 'ea37ea5b-f3ea-4542-b8d1-a97ee61d4839'),
	('00000000-0000-0000-0000-000000000000', 40, 'bgbnkficbvml', '69462fa4-4411-45b6-a52c-3e02026a0d91', true, '2025-06-23 18:48:40.472771+00', '2025-06-23 19:47:29.360023+00', 'lzpiywh42kyh', '090c9f8a-e326-442b-bc1f-90147efcb9aa'),
	('00000000-0000-0000-0000-000000000000', 44, 'qa736tmnfvvf', '69462fa4-4411-45b6-a52c-3e02026a0d91', false, '2025-06-23 19:47:29.360272+00', '2025-06-23 19:47:29.360272+00', 'bgbnkficbvml', '090c9f8a-e326-442b-bc1f-90147efcb9aa'),
	('00000000-0000-0000-0000-000000000000', 43, 'xewxosmd6oqr', 'ec26d65b-1189-475e-b0ba-2febf37231bc', true, '2025-06-23 19:11:50.554555+00', '2025-06-23 20:24:50.070141+00', NULL, '01c09bce-5f53-4315-ab66-e8c9ab8e21d0'),
	('00000000-0000-0000-0000-000000000000', 42, 'zmgleu4w4wt6', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', true, '2025-06-23 19:09:33.073179+00', '2025-06-23 20:24:50.070663+00', NULL, '5db5ade4-2a98-401c-b5cb-4815bb7b8ad4'),
	('00000000-0000-0000-0000-000000000000', 45, '2cjs4kro5twd', 'ec26d65b-1189-475e-b0ba-2febf37231bc', false, '2025-06-23 20:24:50.070634+00', '2025-06-23 20:24:50.070634+00', 'xewxosmd6oqr', '01c09bce-5f53-4315-ab66-e8c9ab8e21d0'),
	('00000000-0000-0000-0000-000000000000', 46, '5vmzm6he4q5p', 'f215102d-9e2a-4e74-bb7f-af0240ef1687', false, '2025-06-23 20:24:50.071013+00', '2025-06-23 20:24:50.071013+00', 'zmgleu4w4wt6', '5db5ade4-2a98-401c-b5cb-4815bb7b8ad4');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

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
--

SELECT pg_catalog.setval('"public"."bids_id_seq"', 3, true);


--
-- Name: contract_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."contract_comments_id_seq"', 1, false);


--
-- Name: contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."contracts_id_seq"', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."messages_id_seq"', 1, false);


--
-- Name: offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."offers_id_seq"', 11, true);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."resources_id_seq"', 8, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."teams_id_seq"', 7, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
