# CLAUDE.md — The Crafty Nest

> Read this file completely before writing any code. It is the single source of truth for this project.

---

## Project Overview

**The Crafty Nest** is a Kuwait-only direct-to-consumer e-commerce platform selling magnetic educational activity kits for children aged 2–8. There are exactly **6 SKUs** — two themes (Flower Shop, Car Shop) × three age bands (2–4, 4–6, 6–8) — all priced at **9.500 KWD**.

- **GitHub:** https://github.com/aalobaid1985-max/the-crafty-nest
- **Supabase project ID:** `wxkhfwcltolenulunpix`
- **Supabase dashboard:** https://supabase.com/dashboard/project/wxkhfwcltolenulunpix
- **SQL editor:** https://supabase.com/dashboard/project/wxkhfwcltolenulunpix/sql/new
- **WhatsApp:** +965 50499867
- **Instagram:** @thecraftynest.kw
- **Email:** thecraftynest.kw@gmail.com

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Database | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Validation | Zod v4 |
| State | Zustand (cart, persisted to localStorage) |
| Server state | TanStack React Query v5 |
| Forms | React Hook Form + Zod resolver |
| Payment | MyFatoorah v2 (KNET + Visa/Mastercard) |
| Email | Resend + @react-email/components |
| Testing | Vitest + React Testing Library |
| Linting | ESLint 9 + Prettier |
| CI/CD | GitHub Actions → Vercel |

---

## Project Structure

```
crafty-nest/
├── app/
│   ├── layout.tsx                      # Root layout — Google Fonts <link>, RTL dir
│   ├── globals.css                     # Design tokens, Tailwind v4 @theme inline
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx              # Phone OTP login (+965)
│   │   └── auth/callback/route.ts     # Supabase auth callback
│   ├── (store)/
│   │   ├── layout.tsx                  # SiteHeader + main wrapper
│   │   ├── page.tsx                    # Homepage (hero, product grid, age guide)
│   │   ├── products/
│   │   │   ├── page.tsx               # All products — SVG swatches, 3-col grid
│   │   │   └── [slug]/page.tsx        # Product detail + AddToCartButton
│   │   ├── cart/page.tsx              # Cart page
│   │   ├── checkout/
│   │   │   ├── page.tsx               # Checkout form (delivery + payment method)
│   │   │   └── confirm/page.tsx       # Order confirmation (COD path)
│   │   ├── payment/
│   │   │   └── result/page.tsx        # MyFatoorah callback — verify + redirect
│   │   └── track/page.tsx             # Order tracking by order number
│   ├── (admin)/
│   │   ├── layout.tsx                  # AdminSidebar + main
│   │   ├── dashboard/page.tsx         # KPI cards (revenue, orders, avg order)
│   │   ├── orders/
│   │   │   ├── page.tsx               # Orders table with status badges
│   │   │   └── [id]/page.tsx         # Order detail + status flow buttons
│   │   ├── inventory/page.tsx         # Stock table with inline adjust
│   │   ├── reports/page.tsx           # Revenue charts, payment breakdown
│   │   └── discounts/page.tsx         # Discount codes table + toggle
│   └── api/
│       ├── orders/route.ts            # POST — create order, apply discount
│       └── payment/
│           ├── initiate/route.ts      # POST — call MyFatoorah ExecutePayment
│           └── verify/route.ts        # GET ?paymentId= — verify + update order
├── components/
│   ├── shared/
│   │   ├── site-header.tsx            # Frosted glass nav, nest SVG logo, auth-aware
│   │   ├── cart-icon.tsx              # Dark pill button with count badge
│   │   └── logout-button.tsx          # Client component — signOut + redirect
│   ├── store/
│   │   └── add-to-cart-button.tsx     # Ink bg, slide-up checkmark animation
│   └── admin/
│       ├── admin-sidebar.tsx          # Sticky sidebar with nav + logout
│       ├── order-status-buttons.tsx   # Progress dots + advance/cancel
│       ├── stock-adjust-button.tsx    # Inline number input for quantity
│       └── discount-toggle.tsx        # Toggle is_active on discount_codes
├── lib/
│   ├── supabase/
│   │   ├── server.ts                  # createServerClient<any> — Server Components + API routes
│   │   ├── client.ts                  # createBrowserClient<any> — Client Components
│   │   └── middleware.ts              # createServerClient<any> — session refresh
│   ├── stores/
│   │   └── cart-store.ts              # Zustand cart (addItem, removeItem, clearCart, persist)
│   ├── validators/
│   │   └── checkout-schema.ts         # Zod v4 checkout form schema
│   ├── data/
│   │   └── kuwait-areas.ts            # Kuwait governorates + areas list
│   └── myfatoorah.ts                  # executePayment(), getPaymentStatus()
├── types/
│   └── supabase.ts                    # Manual DB type placeholder (see Known Issues)
├── middleware.ts                       # Route protection — /admin/* requires auth
├── .env.local                          # Local secrets (never commit)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                     # Lint + typecheck + build on PR
│   │   └── deploy.yml                 # Vercel deploy on push to master
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
└── CLAUDE.md                           # this file
```

---

## Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#f6f1e8` | Page background (warm linen) |
| `--surface` | `#fbf8f2` | Cards, sidebar, inputs |
| `--ink` | `#1f1c17` | Primary text, buttons |
| `--muted` | `#6e655a` | Secondary text, labels |
| `--accent` | `#a4452f` | Terracotta — CTAs, active states, hover |
| `--accent2` | `#5a6b3f` | Sage green — success states |
| `--line` | `#e3dccd` | Borders, dividers |

### Typography

- **Display:** `"Instrument Serif"` — headings, product names, brand logo
- **Body:** `"Helvetica Neue", Helvetica, Arial, sans-serif`
- Google Fonts loaded via `<link>` tags in `app/layout.tsx` `<head>` — NOT via `@import` in CSS (breaks PostCSS with Tailwind v4)

```css
font-family: var(--font-display);   /* Instrument Serif */
font-family: var(--font-body);      /* System sans-serif */
```

### Border Radius

```css
--r-sm:   4px    /* buttons, product swatches */
--r-md:   6px    /* cards, modals */
--r-full: 999px  /* pills, badges, cart button */
```

### Tailwind v4 Usage

Tokens are exposed to Tailwind via `@theme inline` in `globals.css`. Use as Tailwind classes:

```html
bg-[--accent]   text-[--ink]   border-[--line]
```

### Product Swatches

All product images are SVG diagonal stripe patterns using `oklch()` colors per theme:

- **Flower Shop:** hue `340` (rose)
- **Car Shop:** hue `220` (steel blue)
- Lightness by age band: 2–4 → `0.88`, 4–6 → `0.85`, 6–8 → `0.82`

---

## Database Schema

### Core Tables

```sql
-- Products
products (
  id uuid PK,
  slug text UNIQUE,           -- 'flower-shop-2-4', 'car-shop-4-6', etc.
  name_ar text,               -- Arabic product name
  price_kwd numeric(10,3),    -- Always 9.500
  age_min int,
  age_max int,
  stock_qty int,
  is_active boolean
)

-- Orders
orders (
  id uuid PK,
  order_number text UNIQUE,   -- e.g. 'TCN-1043'
  customer_name text,
  customer_phone text,        -- +965XXXXXXXX
  governorate text,
  area text,
  address_line text,
  status text,                -- pending | confirmed | shipped | delivered | canceled
  payment_method text,        -- cod | knet | card
  payment_status text,        -- pending | paid | failed
  subtotal_kwd numeric(10,3),
  delivery_kwd numeric(10,3), -- 1.500 fixed
  discount_kwd numeric(10,3),
  total_kwd numeric(10,3),
  discount_code_id uuid FK → discount_codes,
  myfatoorah_invoice_id text,
  notes text,
  created_at timestamptz
)

-- Order Items
order_items (
  id uuid PK,
  order_id uuid FK → orders,
  product_id uuid FK → products,
  product_snapshot jsonb,     -- { nameAr, slug, price } at time of order
  quantity int,
  unit_price_kwd numeric(10,3),
  total_price_kwd numeric(10,3)
)

-- Discount Codes
discount_codes (
  id uuid PK,
  code text UNIQUE,
  type text,                  -- 'percent' | 'fixed'
  value numeric(10,3),        -- e.g. 10 = 10% off, or 1.000 KWD off
  min_order_kwd numeric(10,3),
  max_uses int,
  times_used int,
  is_active boolean,
  expires_at timestamptz
)

-- Inventory
inventory (
  id uuid PK,
  product_id uuid FK → products,
  quantity_on_hand int,
  low_stock_threshold int
)
```

### Order Status Flow

```
pending → confirmed → shipped → delivered
       ↘ canceled (from any pre-delivery state)
```

### Delivery Fee Logic

- Kuwait City, Hawalli, Farwaniya, Mubarak Al-Kabeer → **1.500 KWD**
- Ahmadi, Jahra → **2.000 KWD**

---

## Environment Variables

```bash
# .env.local — never commit this file

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://wxkhfwcltolenulunpix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>

# MyFatoorah (leave empty in dev — initiate endpoint returns 503 gracefully)
MYFATOORAH_API_KEY=<live key from MyFatoorah dashboard>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (optional — for order confirmation emails)
RESEND_API_KEY=<resend api key>

# Twilio (optional — for order confirmation SMS/WhatsApp)
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## Supabase Patterns

```typescript
// Server Component or API Route
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Component
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Always use explicit columns — never select('*')
const { data } = await supabase
  .from('orders')
  .select('id, order_number, status, total_kwd, created_at')
```

### Known Issue — Type System

`@supabase/supabase-js@2.105.4` (PostgREST 12) requires a `CompositeTypes` + `Functions` shape the placeholder `types/supabase.ts` doesn't satisfy. All three Supabase client files use `<any>` as a workaround:

```typescript
createServerClient<any>(url, key, options)
```

To fix: `npx supabase gen types typescript --project-id wxkhfwcltolenulunpix > types/supabase.ts`

### Update workaround

When `.update()` complains about types, cast the payload:

```typescript
await supabase.from('orders').update({ status } as never).eq('id', id)
```

---

## Payment Flow

### KNET / Visa / Mastercard (MyFatoorah)

```
Checkout submit
  → POST /api/orders           — create order (status=pending, payment_status=pending)
  → POST /api/payment/initiate — MyFatoorah ExecutePayment → { paymentUrl }
  → window.location.href = paymentUrl
  → [user pays on MyFatoorah]
  → redirect to /payment/result?paymentId=<id>
  → GET /api/payment/verify    — GetPaymentStatus → update order → paid
  → redirect to /checkout/confirm
```

### Cash on Delivery

```
Checkout submit
  → POST /api/orders  — create order (status=confirmed, payment_status=pending)
  → clearCart()
  → router.push('/checkout/confirm')
```

### MyFatoorah Payment Method IDs

| ID | Method |
|---|---|
| `1` | KNET |
| `2` | Visa / Mastercard |

---

## Auth Flow

- Phone OTP only (+965 Kuwait numbers)
- Enable in Supabase Dashboard → Authentication → Providers → Phone
- Customers can checkout as guests — auth not required for the store
- `/admin/*` routes are protected by `middleware.ts`

---

## Zod v4 Breaking Change

```typescript
// v3 — broken in this project
z.enum(['cod', 'knet', 'card'], { required_error: 'Select a method' })

// v4 — correct
z.enum(['cod', 'knet', 'card'], { error: 'Select a method' })
```

---

## Critical Column Names

Wrong names return silent `null` from Supabase — always use these:

| Table | Correct | Wrong |
|---|---|---|
| `orders` | `discount_kwd` | ~~`discount_amount_kwd`~~ |
| `discount_codes` | `type` | ~~`discount_type`~~ |
| `discount_codes` | `value` | ~~`discount_value`~~ |
| `discount_codes` | `times_used` | ~~`current_uses`~~ |
| `order_items` | `product_snapshot` | ~~`product_name_snapshot`~~ |
| table name | `discount_codes` | ~~`promo_codes`~~ |

---

## Admin Panel

| Route | Purpose |
|---|---|
| `/admin/dashboard` | KPI overview — revenue, orders, average order value |
| `/admin/orders` | All orders with status badges |
| `/admin/orders/[id]` | Order detail + advance/cancel status buttons |
| `/admin/inventory` | Stock levels with inline quantity adjustment |
| `/admin/reports` | Revenue by day, payment method breakdown, top products |
| `/admin/discounts` | Discount codes with active/inactive toggle |

---

## Coding Conventions

- Named exports only — except Next.js page/layout files (default export required)
- `'use client'` at top of every Client Component file
- Server Components by default — opt into client only when needed
- `async/await` over `.then()` chains
- Handle all errors explicitly — no silent `catch` blocks
- No `useEffect` for data fetching — use React Query
- Business logic lives in `lib/` — not inside components

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `add-to-cart-button.tsx` |
| Components | PascalCase | `AddToCartButton` |
| Hooks | `use` + camelCase | `useCartStore` |
| Types / Interfaces | PascalCase | `CartItem`, `OrderRow` |
| DB tables | snake_case | `order_items` |
| Zod schemas | camelCase + `Schema` | `checkoutSchema` |

---

## Product Slugs

| Slug | Theme | Age band |
|---|---|---|
| `flower-shop-2-4` | Flower Shop | 2–4 yrs |
| `flower-shop-4-6` | Flower Shop | 4–6 yrs |
| `flower-shop-6-8` | Flower Shop | 6–8 yrs |
| `car-shop-2-4` | Car Shop | 2–4 yrs |
| `car-shop-4-6` | Car Shop | 4–6 yrs |
| `car-shop-6-8` | Car Shop | 6–8 yrs |

---

## Commands

```bash
npm run dev          # Start dev server → http://localhost:3000
npm run build        # Production build
npm run typecheck    # npx tsc --noEmit
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix
npm run test         # Vitest
npm run test:watch   # Vitest watch

# Supabase
npx supabase db push
npx supabase gen types typescript --project-id wxkhfwcltolenulunpix > types/supabase.ts
```

---

## Git Workflow

- Never commit to `master` directly
- Branch per feature: `feat/product-images`, `fix/checkout-validation`
- Conventional Commits: `feat:` `fix:` `refactor:` `docs:` `chore:`
- Always run `npm run typecheck && npm run lint` before committing
- Push → PR → CI passes → merge

---

## What NOT To Do

- Do not use `select('*')` — always specify columns
- Do not use `any` in TypeScript (the Supabase `<any>` client is a documented exception)
- Do not use `useEffect` for data fetching — use React Query
- Do not put business logic inside components
- Do not hardcode KWD prices — pull from DB
- Do not commit `.env.local`
- Do not use `require()` — ESM only
- Do not write class components

---

## Pending Work

### Must do before launch
- [ ] Add real `MYFATOORAH_API_KEY` to `.env.local` and Vercel env vars
- [ ] Enable Phone OTP: Supabase Dashboard → Authentication → Providers → Phone
- [ ] Deploy to Vercel and set `NEXT_PUBLIC_APP_URL` to production domain

### Pages needing design update
- [ ] Homepage `app/(store)/page.tsx` — still uses old emoji/gradient style
- [ ] Product detail `app/(store)/products/[slug]/page.tsx`
- [ ] Cart `app/(store)/cart/page.tsx`
- [ ] Checkout `app/(store)/checkout/page.tsx`

### Features not yet built
- [ ] Product image upload (Supabase Storage)
- [ ] Admin: products management page
- [ ] Customer order history page (authenticated)
- [ ] Order confirmation email (Resend)
- [ ] Order confirmation WhatsApp (Twilio)
- [ ] Low-stock email alert
- [ ] PWA / offline support (next-pwa)
- [ ] API route tests (Vitest)

---

## Build History

| Commit | Description |
|---|---|
| `c201c3d` | Initial commit — full platform scaffolded |
| `f637204` | Claude Design system applied — earthy palette, Instrument Serif, editorial layout |
| `fd87100` | Fix: Google Fonts moved to `<head>` — resolves PostCSS @import ordering crash |
