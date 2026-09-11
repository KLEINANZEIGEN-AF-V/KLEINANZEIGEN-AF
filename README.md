# KLEINANZEIGEN-AF — Version 2

Starter full-stack architecture for the marketplace.

## Included
- Modern responsive black/white storefront
- Customer registration/login UI
- Customer dashboard
- Product catalogue with empty-state
- Cart and checkout flow
- Private customer/admin messaging UI
- Orders and order statuses
- Admin dashboard and product/category/customer/order/message sections
- KKiaPay integration placeholder with secure environment variables
- Email notification placeholder
- Supabase-ready database schema
- No products included initially

## Important
This Version 2 is a production-oriented starter. Real authentication, database persistence, email delivery, KKiaPay transactions and deployment require connecting the external services and their credentials.

### Recommended free-start stack
- Frontend/app: Next.js
- Database/auth/realtime: Supabase
- Hosting: Vercel
- Payment: KKiaPay
- Email: Resend or another SMTP/API provider

Do not put KKiaPay secret keys in browser code. Server-side verification is required.

## Configuration
Copy `.env.example` to `.env.local` and fill in the service values when accounts are connected.

## Run
1. Install Node.js 20+
2. `npm install`
3. `npm run dev`
4. Open http://localhost:3000

The included UI can be used as the visual and functional foundation before connecting live services.
