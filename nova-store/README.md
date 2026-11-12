# NOVA — Modern E-Commerce Product Catalog & Shopping Cart

> **Brand Tagline:** Everyday Shopping, Made Simple.  
> **Technology Stack:** React 18, Vite, JavaScript (ES6+), Context API, CSS3, FakeStoreAPI, Lucide React  
> **Data Persistence:** Browser `localStorage`

---

## 1. Project Overview

**NOVA** is a responsive, editorial-style e-commerce web application built with React.js and Vite. The storefront retrieves live product data asynchronously from **FakeStoreAPI**, supports real-time keyword searching, category filtering, multi-criteria sorting, a persistent slide-out shopping cart drawer, automatic USD price calculations, and a validated simulated checkout workflow.

---

## 2. Features

* **Live Product Catalog (`FakeStoreAPI`):** Fetches products asynchronously with loading skeleton placeholders, image fallback protection, and retry recovery on network errors.
* **Combined Search, Filter & Sort:** Filter by `All Products`, `Electronics`, `Jewelry`, `Men's Clothing`, `Women's Clothing` (plus Navbar `Clothing` grouping), search by product title, and sort by Featured, Price Low-to-High, Price High-to-Low, or Highest Rated.
* **Persistent Slide-Out Cart Drawer:**
  * Prevents duplicate cart entries by incrementing quantities.
  * Step-up/step-down quantity controls and item removal.
  * Displays unit prices, individual line totals, and dynamic navbar badge counts.
  * Accessible close via close button, backdrop overlay click, or `Escape` key.
  * Persists across page reloads using `localStorage`.
* **Automatic Price Calculations (USD):**
  * **Subtotal:** $\sum (\text{Price} \times \text{Quantity})$
  * **Tax:** $5\%$ of Subtotal
  * **Shipping:** Free when Subtotal $> \$40.00$, otherwise $\$2.00$ flat rate
  * **Grand Total:** $\text{Subtotal} + \text{Tax} + \text{Shipping}$
* **Validated Simulated Checkout:** Collects customer name, email, phone, street address, city, postal code, and payment preference with inline validation, duplicate-submit protection, unique order reference generation (`NOVA-YYYY-XXXXXX`), order confirmation summary, and post-confirmation cart clearing.

---

## 3. Folder Structure

```text
nova-store/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── CartContext.jsx
    ├── services/
    │   └── api.js
    ├── utils/
    │   └── calculations.js
    └── components/
        ├── Navbar.jsx
        ├── Hero.jsx
        ├── CategoryFilter.jsx
        ├── SearchBar.jsx
        ├── ProductGrid.jsx
        ├── ProductCard.jsx
        ├── CartDrawer.jsx
        ├── CartItem.jsx
        ├── CartSummary.jsx
        ├── CheckoutModal.jsx
        ├── Toast.jsx
        ├── Loader.jsx
        └── Footer.jsx
```

---

## 4. Installation & Running Locally

```bash
# 1. Navigate to the project folder
cd D:\DATHEON\nova-store

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev

# 4. Build for production
npm run build
```

---

## 5. Verification Checklist

1. Open the app and verify all products load from `https://fakestoreapi.com/products`.
2. Test searching by title alongside category filters (`electronics`, `jewelery`, `men's clothing`, `women's clothing`) and price/rating sort options.
3. Add multiple items to the cart, adjust quantities, verify 5% tax and `$40` free-shipping threshold calculations update immediately.
4. Refresh the page and confirm cart items and quantities persist from `localStorage`.
5. Complete the checkout form, verify validation messages on empty/invalid inputs, place the simulated order, confirm unique order ID display, and verify the cart clears upon confirmation.
