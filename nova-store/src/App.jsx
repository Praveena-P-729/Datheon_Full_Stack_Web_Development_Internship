import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { CartProvider, useCart } from "./context/CartContext";
import { API_CATEGORIES, fetchProducts } from "./services/api";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategoryFilter from "./components/CategoryFilter";
import SearchBar from "./components/SearchBar";
import ProductGrid from "./components/ProductGrid";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import Toast from "./components/Toast";
import Footer from "./components/Footer";

function StorefrontContent() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState(API_CATEGORIES.ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const catalogRef = useRef(null);
  const searchInputRef = useRef(null);

  const loadCatalog = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);

    try {
      const items = await fetchProducts(signal);
      setProducts(items);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to fetch store products.");
    } finally {
      if (!signal || !signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadCatalog(controller.signal);
    return () => controller.abort();
  }, [loadCatalog]);

  const handleRetry = () => {
    loadCatalog();
  };

  const scrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectCategory = (categoryKey) => {
    setActiveCategory(categoryKey);
    scrollToCatalog();
  };

  const handleNavigateHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFocusSearch = () => {
    scrollToCatalog();
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 250);
  };

  const handleResetFilters = () => {
    setActiveCategory(API_CATEGORIES.ALL);
    setSearchQuery("");
    setSortBy("featured");
  };

  // Top 4 highest-rated products for the Homepage Featured section
  const featuredProducts = useMemo(() => {
    if (!products.length) return [];
    return [...products]
      .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
      .slice(0, 4);
  }, [products]);

  // Combined Category + Search + Sort pipeline
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory =
        activeCategory === API_CATEGORIES.ALL
          ? true
          : activeCategory === API_CATEGORIES.CLOTHING_GROUP
            ? product.category === API_CATEGORIES.MENS_CLOTHING ||
              product.category === API_CATEGORIES.WOMENS_CLOTHING
            : product.category === activeCategory;

      const matchesSearch = query
        ? (product.title || "").toLowerCase().includes(query)
        : true;

      return matchesCategory && matchesSearch;
    });

    if (sortBy === "price-asc") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "rating-desc") {
      return [...filtered].sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    }

    return filtered;
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <div className="app-shell">
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onNavigateHome={handleNavigateHome}
        onNavigateShop={handleSelectCategory}
        onFocusSearch={handleFocusSearch}
      />

      <main>
        <Hero
          onShopNow={scrollToCatalog}
          onSelectCategory={handleSelectCategory}
          featuredProducts={featuredProducts}
          onAddToCart={addToCart}
        />

        <section
          id="catalog"
          ref={catalogRef}
          className="catalog-section"
          aria-label="Product Catalog"
        >
          <div className="container">
            <div className="catalog-header">
              <div>
                <h2 className="catalog-heading">Product Catalog</h2>
                <p className="catalog-subheading">
                  Curated everyday goods with transparent USD pricing.
                </p>
              </div>
            </div>

            <CategoryFilter
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              inputRef={searchInputRef}
              resultCount={filteredProducts.length}
              totalCount={products.length}
            />

            <ProductGrid
              products={filteredProducts}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
              onResetFilters={handleResetFilters}
            />
          </div>
        </section>
      </main>

      <Footer onSelectCategory={handleSelectCategory} />
      <CartDrawer />
      <CheckoutModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <StorefrontContent />
    </CartProvider>
  );
}
