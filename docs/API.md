# API Reference

JSON over HTTPS. Errors: `{ "error": string, "details"?: [{ path, message }] }` with status 400/401/403/404/409/413/415/422/429/500.
Admin endpoints require the `admin_session` httpOnly cookie (from `POST /api/auth/login`) and the listed permission; mutating requests must come from the same origin (CSRF check).

## Public (rate limited per IP)
| Method & path | Body / query | Notes |
|---|---|---|
| `GET /api/vehicles` | filters: `q brand model category minPrice maxPrice minYear maxYear maxMileage fuel transmission body minCc maxCc condition city availability origin`, `sort` (`newest\|price-asc\|price-desc\|mileage-asc\|year-desc`), `page` | 12 per page; published only |
| `POST /api/leads` | `{ name, phone, email?, message?, vehicleId?, type: INQUIRY\|SELL_CAR\|CONTACT\|FINANCE, website:"" }` | 8/min. Repeat contacts append an Inquiry to the open Lead. `website` is a honeypot |
| `POST /api/test-drives` | `{ name, phone, email?, vehicleId?, preferredDate, preferredTime?, message? }` | 6/min. Also creates a CRM lead |
| `POST /api/newsletter` | `{ email }` | 5/min |
| `GET /sitemap.xml`, `/robots.txt` | | Dynamic |

## Auth
| `POST /api/auth/login` | `{ email, password }` | 20/min/IP + 8 failures/15 min per email+IP lockout |
| `POST /api/auth/logout` | | |

## Admin (permission in brackets)
| Path | Methods | Permission |
|---|---|---|
| `/api/admin/vehicles` | `GET ?q&status&page`, `POST` | vehicles |
| `/api/admin/vehicles/:id` | `GET`, `PUT`, `DELETE` (soft), `PATCH {action: publish\|unpublish\|feature\|unfeature\|available\|reserved\|sold\|duplicate}` | vehicles |
| `/api/admin/r/:resource` and `/:id` | `GET`, `POST`, `GET/PUT/DELETE :id` for `brands categories features testimonials faqs blog pages sections nav subscribers` | per resource (brands→brands, categories→categories, features→vehicles, subscribers→leads, others→cms) |
| `/api/admin/reorder` | `POST { resource, ids[] }` for sections, nav, testimonials, faqs, brands, categories | as resource |
| `/api/admin/leads` | `GET ?q&status&type&assignee&page`, `?export=csv` | leads |
| `/api/admin/leads/:id` | `GET`, `PATCH { status?, assigneeId?, note? }`, `DELETE` | leads |
| `/api/admin/testdrives` | `GET ?status`, `PATCH ?id= { status?, internalNotes? }` | testdrives |
| `/api/admin/media` | `GET ?q&folder`, `POST multipart (files[], folder)` | media |
| `/api/admin/media/:id` | `PATCH { alt, folder }`, `DELETE` | media |
| `/api/admin/settings` | `GET`, `PUT` (partial) | settings |
| `/api/admin/users`, `/:id` | `GET POST PUT DELETE` | users (Super Admin) |
| `/api/admin/staff` | `GET` | leads |

Uploads: JPEG/PNG/WebP/AVIF ≤ 10 MB, verified by content, re-encoded to WebP (≤ 2000 px) + 480×320 thumbnail.
