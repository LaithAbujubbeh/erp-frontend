# NEXUS ERP Frontend

A modern ERP frontend built with React, TypeScript, TanStack Router, TanStack Query, Tailwind CSS, and Playwright.

This frontend connects to an Express.js backend API and provides role-based dashboards and management pages for products, categories, customers, suppliers, purchases, orders, expenses, stock movements, reports, and users.

## Features

* Authentication with HTTP-only JWT cookies
* Role-based access control
* Dashboard overview
* Product management
* Category management
* Customer management
* Supplier management
* Purchase management
* Receive purchase workflow
* Order management
* Pay and cancel order workflows
* Expense management
* Soft-cancel expense workflow
* Stock movement tracking
* Reports page
* User management for admins
* Protected routes
* Responsive UI
* End-to-end tests with Playwright
* Frontend CI with GitHub Actions

## Tech Stack

* React
* TypeScript
* Vite
* TanStack Router
* TanStack Query
* TanStack Form
* Tailwind CSS
* Zod
* Playwright
* ESLint
* GitHub Actions

## Project Structure

```txt
src/
  api/
    auth.ts
    categories.ts
    customers.ts
    expenses.ts
    orders.ts
    products.ts
    purchases.ts
    reports.ts
    stockMovements.ts
    suppliers.ts
    users.ts

  components/
    auth/
    categories/
    customers/
    dashboard/
    expenses/
    layout/
    orders/
    products/
    purchases/
    reports/
    stock-movements/
    suppliers/
    users/

  hooks/
    useAuth.ts

  routes/
    __root.tsx
    index.tsx
    (auth)/
    (pages)/

e2e/
  helpers/
    auth.ts
    erp.ts

  auth-persistence.spec.ts
  smoke.spec.ts
  admin-navigation.spec.ts
  role-protection.spec.ts
  create-product.spec.ts
  create-category.spec.ts
  create-customer.spec.ts
  create-supplier.spec.ts
  create-purchase.spec.ts
  receive-purchase.spec.ts
  create-order.spec.ts
  order-actions.spec.ts
  create-expense.spec.ts
  cancel-expense.spec.ts
  reports-smoke.spec.ts
  stock-movements-smoke.spec.ts
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Make sure your backend server is running on the same API URL.

### 4. Start the development server

```bash
npm run dev
```

The app should run on:

```txt
http://localhost:5173
```

## Available Scripts

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Run ESLint

```bash
npm run lint
```

### Run Playwright E2E tests

```bash
npm run test:e2e
```

### Run Playwright in headed mode

```bash
npm run test:e2e:headed
```

### Open Playwright UI

```bash
npm run test:e2e:ui
```

### View Playwright report

```bash
npm run test:e2e:report
```

## Authentication

The app uses HTTP-only JWT cookies for authentication.

Login requests are sent to the backend, and the backend stores the token in a secure HTTP-only cookie. The frontend uses `credentials: "include"` when making API requests.

Example:

```ts
fetch(`${API_URL}/auth/me`, {
  credentials: "include",
});
```

## Roles

The frontend supports multiple user roles:

```txt
ADMIN
MANAGER
CASHIER
INVENTORY_STAFF
```

### Admin

Can access all pages:

* Dashboard
* Products
* Categories
* Customers
* Suppliers
* Purchases
* Orders
* Expenses
* Stock Movements
* Reports
* Users

### Manager

Can access most business pages but cannot manage users.

### Cashier

Can access customer and order-related workflows.

### Inventory Staff

Can access product, supplier, purchase, and stock movement workflows.

## E2E Testing

The project includes Playwright tests for the main ERP workflows.

Covered workflows:

* Admin login
* Auth persistence after refresh
* Protected routes
* Role protection
* Admin navigation
* Create user
* Create category
* Create product
* Create customer
* Create supplier
* Create purchase
* Receive purchase
* Create order
* Pay order
* Cancel order
* Create expense
* Cancel expense
* Reports page smoke test
* Stock movements page smoke test

### Local E2E Setup

Create a `.env.e2e` file:

```env
E2E_ADMIN_EMAIL=admin@example.com
E2E_ADMIN_PASSWORD=password123

E2E_MANAGER_EMAIL=manager@example.com
E2E_MANAGER_PASSWORD=password123

E2E_CASHIER_EMAIL=cashier@example.com
E2E_CASHIER_PASSWORD=password123

E2E_INVENTORY_EMAIL=inventory@example.com
E2E_INVENTORY_PASSWORD=password123
```

Do not commit `.env.e2e`.

Add it to `.gitignore`:

```gitignore
.env
.env.e2e
```

Then run:

```bash
npm run test:e2e
```

## CI

This project includes frontend CI using GitHub Actions.

The current CI runs:

```txt
npm ci
npm run typecheck --if-present
npm run lint --if-present
npm run build
```

Playwright E2E tests are currently intended to run locally because the backend is not deployed yet.

Once the backend is deployed, E2E tests can be added to GitHub Actions using repository secrets.

## Backend Requirement

This frontend requires the NEXUS ERP backend API to be running.

Default local backend URL:

```txt
http://localhost:5000/api
```

Expected backend features:

* Authentication
* Role-based authorization
* Products API
* Categories API
* Customers API
* Suppliers API
* Purchases API
* Orders API
* Expenses API
* Stock movements API
* Reports API
* Users API

## Main Pages

### Dashboard

Shows ERP overview and key business metrics.

### Products

Manage product inventory, pricing, stock, categories, and status.

### Categories

Manage product categories.

### Customers

Manage customer records.

### Suppliers

Manage suppliers used for purchases and restocking.

### Purchases

Create purchases and receive inventory.

### Orders

Create customer orders, pay orders, and cancel orders.

### Expenses

Create and cancel business expenses.

### Stock Movements

Track inventory changes from purchases, orders, and manual stock updates.

### Reports

View business reports and summaries.

### Users

Admin-only user management.

## Notes

* The backend must allow credentials/cookies from the frontend origin.
* The frontend uses `credentials: "include"` for authenticated requests.
* E2E tests require real test users in the database.
* The app is designed for portfolio and ERP system practice.

## Author

Built by Laith Jebbeh.
