# CLAUDE.md — The Crafty Nest

> Read this file completely before writing any code. It is the single source of truth for this project.

---

## Project Overview

Kuwait-only e-commerce store selling magnetic educational activity kits for children aged 2–8.
Six SKUs, each priced at **9.500 KWD**. All products ship within Kuwait only.

- **Currency:** KWD — 3 decimal places always (e.g. `9.500`, not `9.5`)
- **Language:** Arabic (RTL) — all UI is Arabic-first
- **No VAT** — Kuwait has no VAT
- **Supabase project:** `wxkhfwcltolenulunpix` (URL: `https://wxkhfwcltolenulunpix.supabase.co`)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router (`app/` directory) |
| Language | TypeScript strict mode |
| Styling | Tailwind CSS + shadcn/ui (`components/ui/` — DO NOT MODIFY) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Validation | Zod v4 (see Zod notes below) |
| Client state | Zustand with `persist` middleware |
| Payments | MyFatoorah v2 API (KNET + Visa/Mastercard) + COD |
| Auth | Supabase phone OTP (+965 Kuwait numbers only) |
| Proxy/Middleware | `proxy.ts` (Next.js 15 replacement for `middleware.ts`) |

---

## Project Structure

```
app/
  (store)/          # Public storefront — products, cart, checkout, track
  (admin)/          # Admin panel — dashboard, orders, inventory, reports, discounts
  (auth)/           # Auth — /login (phone OTP)
  api/
    orders/         # POST — create order
    payment/
      initiate/     # POST — create MyFatoorah payment session
      verify/       # GET  — verify payment, mark order paid
components/
  ui/               # shadcn/ui — DO NOT MODIFY
  shared/           # SiteHeader, CartIcon, LogoutButton
  admin/            # AdminSidebar, OrderStatusButtons, StockAdjustButton, DiscountToggle
  auth/             # LoginForm
  store/            # AddToCartButton
lib/
  supabase/
    server.ts       # createClient() for Server Components / API routes
    client.ts       # createClient() for Client Components
    middleware.ts   # updateSession() called from proxy.ts
  stores/
    cart-store.ts   # Zustand cart (persisted to localStorage as 'crafty-nest-cart')
  data/
    kuwait-areas.ts # 97 delivery areas across 6 governorates + fee logic
  validators/
    checkout-schema.ts  # Zod schemas for checkout form
  myfatoorah.ts     # executePayment() + getPaymentStatus()
types/
  supabase.ts       # Manually typed placeholder (see Known Issues)
supabase/
  migrations/
    0001_initial_schema.sql  # Full schema — run this first
    0002_seed_data.sql       # Real products, inventory, 19 promo codes, delivery zones
proxy.ts            # Next.js 15 middleware (named export `proxy`, not `middleware`)
```

---

## Coding Conventions

- ES modules only — never `require()`
- Named exports only — no default exports except Next.js page/layout files
- Functional components only — no class components
- `'use client'` only when truly needed — server components are the default
- `const` by default; `let` only when reassignment is needed
- Async/await — never `.then()` chains
- Never use `any` — use proper types or `unknown`
- Never use `select('*')` in Supabase — always name columns explicitly
- Never bypass RLS — all access control lives in Supabase policies

---

## Supabase Patterns

```typescript
// Server Components / API routes
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Known Issue — Supabase Type Generation

`types/supabase.ts` is a **manually maintained placeholder** — NOT auto-generated.
The auto-generated types are incompatible with `@supabase/supabase-js@2.105.4` until
the Supabase CLI is linked. As a workaround:

- Both `server.ts` and `client.ts` pass `any` as the Database generic: `createServerClient<any>(...)`
- Client-side `.update()` calls require `as never` cast: `.update({ status: 'confirmed' } as never)`
- To fix permanently: `npx supabase gen types typescript --project-id wxkhfwcltolenulunpix > types/supabase.ts`

---

## Database Schema (Key Tables)

| Table | Purpose |
|---|---|
| `products` | Product registry (`name_ar`, `name_en`, `slug`, `age_min`, `age_max`) |
| `product_variants` | SKU variants (`sku`, `price_kwd`, `product_id`) |
| `inventory` | Stock levels (`quantity_on_hand`, `quantity_reserved`, `low_stock_threshold`) |
| `orders` | Orders (`status`, `payment_method`, `payment_status`, `total_kwd`, `address_snapshot jsonb`) |
| `order_items` | Line items (`product_snapshot jsonb`, `quantity`, `unit_price_kwd`, `total_kwd`) |
| `discount_codes` | Promo codes (`code`, `type`, `value`, `times_used`, `max_uses`, `is_active`) |
| `customers` | Supabase Auth users linked to customer profiles |

### Critical Column Names (commonly confused)

- Orders: `discount_kwd` (NOT `discount_amount_kwd`)
- Discount codes table: `discount_codes` (NOT `promo_codes`)
- Discount codes columns: `type` + `value` (NOT `discount_type` + `discount_value`)
- Discount codes usage: `times_used` (NOT `current_uses`)
- Order items: `product_snapshot` jsonb (NOT `product_name_snapshot`)
- Product snapshot shape: `{ nameAr, nameEn, ageAr, sku, priceKwd }`

---

## Delivery Fee Logic

Fees are computed in `lib/data/kuwait-areas.ts` based on area name, not governorate:

| Area | Fee |
|---|---|
| المطلاع | 4.000 KWD |
| صباح الأحمد | 4.000 KWD |
| علي صباح السالم | 3.000 KWD |
| All other areas | 1.500 KWD |

COD adds **1.000 KWD** surcharge (hardcoded in `/api/orders/route.ts`).

---

## Payment Flow

### COD
1. `POST /api/orders` → creates order → redirect to `/checkout/confirm`

### KNET / Visa / Mastercard (MyFatoorah)
1. `POST /api/orders` → creates order (status: `pending`, payment_status: `unpaid`)
2. `POST /api/payment/initiate` → calls MyFatoorah `ExecutePayment` → returns `paymentUrl`
3. Frontend redirects to `paymentUrl` (MyFatoorah hosted page)
4. MyFatoorah redirects back to `/payment/result?paymentId=xxx`
5. `/payment/result` page calls `GET /api/payment/verify?paymentId=xxx`
6. Verify route: calls MyFatoorah `GetPaymentStatus` → updates `payment_status = 'paid'` → returns `orderNumber`
7. Frontend redirects to `/checkout/confirm?order=TCN-...`

MyFatoorah PaymentMethodId: `1` = KNET, `2` = Visa/Mastercard.
Env var: `MYFATOORAH_API_KEY` (empty = MyFatoorah disabled, returns 503).
Test base URL: `https://apitest.myfatoorah.com` (set in `MYFATOORAH_BASE_URL`).

---

## Auth Flow

Phone OTP only. Kuwait numbers: `+9656XXXXXXX`, `+9659XXXXXXX`, `+96550XXXXXX`.

- Login page: `/login` → `components/auth/login-form.tsx`
- OTP callback: `/auth/callback` (code exchange)
- Session refresh: `proxy.ts` → `lib/supabase/middleware.ts`
- Admin guard: middleware redirects `/admin/*` to `/login` if no session

---

## Order Status Transitions

```
pending → confirmed → packed → shipped → delivered
                                       ↘ cancelled (from any non-terminal state)
```

Terminal states: `delivered`, `cancelled`, `refunded`. No further transitions allowed.
Status is updated client-side in `components/admin/order-status-buttons.tsx` via `.update({ status } as never)`.

---

## Domain Rules — NEVER BYPASS

1. **KWD always 3 decimal places.** Use `.toFixed(3)` for display, `numeric(8,3)` in DB.
2. **Inventory never goes negative.** API validates stock before inserting order.
3. **Orders are never deleted** — use status transitions only.
4. **Payment verification is server-side only** (`/api/payment/verify`) — never trust client.
5. **KNET must always be selectable** — it's the primary payment method in Kuwait.
6. **Phone is the only auth identifier** — no email/password login.
7. **RTL layout by default** — `dir="rtl"` on root layout and all standalone pages.
8. **`discount_codes` table, not `promo_codes`** — do not confuse these.

---

## Zod v4 Notes

This project uses **Zod v4**. The API changed from v3:

```typescript
// ❌ v3 (broken here)
z.enum([...], { required_error: 'message' })

// ✅ v4 (correct)
z.enum([...], { error: 'message' })
```

---

## API Response Envelope

All API routes return:
```typescript
{ data: T | null, error: string | null }
// 200 OK | 201 Created | 400 Bad Request | 401 Unauthorized
// 402 Payment Required | 403 Forbidden | 404 Not Found | 500 Server Error | 503 Service Unavailable
```

---

## Admin Panel Pages

| Route | File | Features |
|---|---|---|
| `/admin/dashboard` | `app/(admin)/dashboard/page.tsx` | KPIs, recent orders, low-stock alert |
| `/admin/orders` | `app/(admin)/orders/page.tsx` | Full orders table with status badges |
| `/admin/orders/[id]` | `app/(admin)/orders/[id]/page.tsx` | Order detail + status advance/cancel buttons |
| `/admin/inventory` | `app/(admin)/inventory/page.tsx` | Stock table + inline quantity adjust |
| `/admin/reports` | `app/(admin)/reports/page.tsx` | Revenue KPIs, payment split, top products |
| `/admin/discounts` | `app/(admin)/discounts/page.tsx` | Promo codes + active/inactive toggle |

---

## Commands

```bash
npm run dev          # Start dev server (default port 3001)
npm run build        # Production build
npx tsc --noEmit     # TypeScript check (no typecheck script in package.json)
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix

# Supabase
npx supabase gen types typescript --project-id wxkhfwcltolenulunpix > types/supabase.ts
```

---

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://wxkhfwcltolenulunpix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3001   # used in MyFatoorah callback URLs

# Payment (fill in before going live)
MYFATOORAH_API_KEY=           # empty = payment disabled (503 response)
MYFATOORAH_BASE_URL=https://apitest.myfatoorah.com   # switch to prod URL at launch
```

---

## What NOT to Do

- Do not use `select('*')` — always name columns
- Do not use `promo_codes` — the table is `discount_codes`
- Do not use `required_error` in Zod — it's `error` in v4
- Do not call `.catch()` on Supabase `.rpc()` — use `try/catch`
- Do not hardcode Arabic text in components — keep it in JSX (no separate i18n file yet)
- Do not remove the `as never` cast on `.update()` calls until types are regenerated
- Do not modify files in `components/ui/` — they are shadcn/ui managed
