# Added Features

## 1) Friend request acceptance notification
- When a connection request is accepted, the sender now receives a database notification.
- Notification appears in the top navigation dropdown and on the dashboard.

## 2) Block & Report Users / Groups
- Users can block another user from the dashboard and friends page.
- Blocking removes any existing friendship / connection request.
- Blocked users are filtered from search, incoming requests, and newsfeed posts.
- Users can report another user from the dashboard and friends page.
- Users can also manually report a group from the Safety Center page.
- Reports are stored with `pending` status for admin review.

## 3) Premium Subscription & Payment System
- Added subscription plans page.
- Added SSLCommerz integration structure.
- Demo mode is enabled by default so the payment flow is testable without live credentials.
- Payment success creates an active premium subscription.

# New Pages
- `/reports` => Safety Center
- `/subscriptions` => Plans & Payments
- `/payments/{payment}/redirect` => SSLCommerz redirect / demo payment flow

# Setup Steps
1. Copy `.env.example` values if needed.
2. Run migrations:
   - `php artisan migrate`
3. Start project normally.
4. Optional for live payment:
   - set `SSLCOMMERZ_STORE_ID`
   - set `SSLCOMMERZ_STORE_PASSWORD`
   - set `SSLCOMMERZ_DEMO_MODE=false`

# Important Files
- `app/Http/Controllers/ConnectionRequestController.php`
- `app/Notifications/FriendRequestAcceptedNotification.php`
- `app/Http/Controllers/BlockReportController.php`
- `app/Http/Controllers/SubscriptionController.php`
- `app/Http/Controllers/PaymentController.php`
- `app/Services/SSLCommerzService.php`
- `resources/js/Pages/Dashboard.jsx`
- `resources/js/Pages/Friends.jsx`
- `resources/js/Pages/Reports.jsx`
- `resources/js/Pages/Subscriptions.jsx`
- `resources/js/Pages/PaymentRedirect.jsx`


## Payment Modes
- `SSLCOMMERZ_DEMO_MODE=true` => local demo buttons (Simulate Success / Fail / Cancel).
- `SSLCOMMERZ_DEMO_MODE=false` => real SSLCommerz request is submitted.
- `SSLCOMMERZ_MODE=sandbox` with `SSLCOMMERZ_BASE_URL=https://sandbox.sslcommerz.com` => sandbox/testing.
- For sandbox callback testing from your own machine, use a public tunnel like ngrok and set `APP_URL` to the ngrok URL, then run `php artisan config:clear`.

### Fast switch for tomorrow's demo
1. Put sandbox `SSLCOMMERZ_STORE_ID` and `SSLCOMMERZ_STORE_PASSWORD` in `.env`.
2. Start Laravel: `php artisan serve`
3. Start ngrok: `ngrok http 8000`
4. Set `APP_URL=https://YOUR-NGROK-URL`
5. Set `SSLCOMMERZ_DEMO_MODE=false`
6. Run `php artisan config:clear`
7. Use the normal Plans page checkout.

### Safe fallback
If sandbox fails during the demonstration:
- set `SSLCOMMERZ_DEMO_MODE=true`
- run `php artisan config:clear`
- use the built-in simulate buttons so the rest of the payment flow can still be shown.
