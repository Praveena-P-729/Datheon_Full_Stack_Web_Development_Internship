import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchProducts, getCategoryLabel } from './services/api';
import { useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  const { addToCart, openCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const catalogSectionRef = useRef(null);

  const loadCatalog = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts(signal);
      setProducts(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load products right now.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadCatalog(controller.signal);
    return () => controller.abort();
  }, [loadCatalog]);

  const handleRetry = useCallback(() => {
    loadCatalog();
  }, [loadCatalog]);

  const scrollToCatalog = useCallback(() => {
    catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCategorySelectAndScroll = useCallback(
    (category) => {
      setActiveCategory(category);
      scrollToCatalog();
    },
    [scrollToCatalog]
  );

  const handleResetFilters = useCallback(() => {
    setActiveCategory('all');
    setSearchQuery('');
    setSortBy('featured');
  }, []);

  const featuredProducts = useMemo(() => {
    if (products.length === 0) return [];
    return [...products]
      .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
      .slice(0, 4);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matches = products.filter((product) => {
      const matchesCategory =
        activeCategory === 'all'
          ? true
          : activeCategory === 'clothing'
            ? product.category === "men's clothing" || product.category === "women's clothing"
            : product.category === activeCategory;

      const matchesSearch = normalizedQuery
        ? product.title.toLowerCase().includes(normalizedQuery)
        : true;

      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      return [...matches].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...matches].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating-desc') {
      return [...matches].sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    }

    return matches;
  }, [products, activeCategory, searchQuery, sortBy]);

  const hasActiveFilters =
    activeCategory !== 'all' || searchQuery.trim().length > 0 || sortBy !== 'featured';

  const activeDepartmentLabel =
    activeCategory === 'clothing'
      ? 'All Clothing'
      : getCategoryLabel(activeCategory);

  return (
    <div className="app-shell">
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateHome={scrollToTop}
        onNavigateCatalog={scrollToCatalog}
      />

      <main className="main-content">
        <Hero
          products={products}
          onShopNow={scrollToCatalog}
          onSelectCategory={handleCategorySelectAndScroll}
          onQuickAdd={addToCart}
        />

        {!loading && !error && featuredProducts.length > 0 && (
          <section id="featured" className="featured-section">
            <div className="container">
              <div className="section-header">
                <div>
                  <span className="section-eyebrow">Highly Rated</span>
                  <h2 className="section-title">Featured Essentials</h2>
                  <p className="section-subtitle">
                    Top-rated pieces chosen by our community for everyday utility and craft.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleCategorySelectAndScroll('all')}
                >
                  Explore Full Catalog
                </button>
              </div>

              <div className="featured-grid">
                {featuredProducts.map((product) => (
                  <ProductCard key={`featured-${product.id}`} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section
          id="catalog"
          ref={catalogSectionRef}
          className="catalog-section"
          aria-labelledby="catalog-heading"
        >
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">NOVA Collection</span>
                <h2 id="catalog-heading" className="section-title">
                  {activeCategory === 'all' ? 'All Products' : activeDepartmentLabel}
                </h2>
                <p className="section-subtitle">
                  Filter by department, search by product title, or sort by price and rating.
                </p>
              </div>
            </div>

            <div className="catalog-controls">
              <div className="catalog-controls-top">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                />
                <span className="catalog-results-meta" aria-live="polite">
                  {loading
                    ? 'Loading catalog...'
                    : `Showing ${filteredProducts.length} of ${products.length} products`}
                </span>
              </div>

              <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            <ProductGrid
              products={filteredProducts}
              loading={loading}
              error={error}
              onRetry={handleRetry}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </section>
      </main>

      <Footer
        onSelectCategory={handleCategorySelectAndScroll}
        onOpenCart={openCart}
      />

      <CartDrawer onBrowseCatalog={scrollToCatalog} />
      <CheckoutModal />
      <Toast />
    </div>
  );
}
