# NOVA — Modern E-Commerce Product Catalog & Shopping Cart

**Tagline:** *Everyday Shopping, Made Simple.*

NOVA is a responsive e-commerce storefront built with React.js (Vite), ES6+ JavaScript, CSS3, Context API, LocalStorage persistence, Lucide React icons, and live catalog data from FakeStoreAPI.

---

## Features

- **Live Product Catalog**: Fetches products asynchronously from `https://fakestoreapi.com/products` with loading skeletons, image error fallbacks, and structured error handling with retry support.
- **Search, Filter & Sort**:
  - Real-time search by product title
  - Category filtering using exact FakeStoreAPI categories (`electronics`, `jewelery`, `men's clothing`, `women's clothing`) plus `All Products` and a `Clothing` navigation shortcut
  - Sorting by Featured, Price (Low to High / High to Low), and Rating (Highest Rated)
  - Meaningful empty states with one-click filter reset
- **Persistent Shopping Cart**:
  - Slide-out drawer from the right with backdrop overlay
  - Closes via close button, overlay click, or `Escape` key
  - Prevents duplicate entries and invalid quantities
  - Syncs across browser refreshes and tabs via `localStorage`
- **Real-Time Price Calculations (INR / ₹)**:
  - `Subtotal = Sum(Product Price × Quantity)`
  - `Tax = 5% of Subtotal`
  - `Shipping = Free above ₹40.00, otherwise ₹2.00 flat rate`
  - `Grand Total = Subtotal + Tax + Shipping`
- **Simulated Checkout & Confirmation**:
  - Validated customer and delivery form (name, email, phone, address, city, postal code, simulated payment method)
  - Duplicate-submission protection
  - Generates a unique order reference (e.g. `NOVA-261112-8F3A`)
  - Displays full order confirmation and clears the cart only upon confirmation

---

## Project Structure

```text
ecommerce/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── styles/
    │   ├── variables.css
    │   └── global.css
    ├── services/
    │   └── api.js
    ├── utils/
    │   └── calculations.js
    ├── context/
    │   └── CartContext.jsx
    └── components/
        ├── Navbar.jsx / Navbar.css
        ├── Hero.jsx / Hero.css
        ├── SearchBar.jsx / SearchBar.css
        ├── CategoryFilter.jsx / CategoryFilter.css
        ├── ProductGrid.jsx / ProductGrid.css
        ├── ProductCard.jsx / ProductCard.css
        ├── CartDrawer.jsx / CartDrawer.css
        ├── CartItem.jsx / CartItem.css
        ├── CartSummary.jsx / CartSummary.css
        ├── CheckoutModal.jsx / CheckoutModal.css
        ├── Toast.jsx / Toast.css
        ├── Loader.jsx / Loader.css
        └── Footer.jsx / Footer.css
```

---

## Installation & Running Locally

### Prerequisites
- Node.js 18+ and npm

### Setup Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the local URL shown in the terminal (default: `http://localhost:5173`).

### Production Build

```bash
npm run build
npm run preview
```
