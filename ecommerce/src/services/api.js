const BASE_URL = 'https://fakestoreapi.com';
const REQUEST_TIMEOUT_MS = 12000;

/**
 * Exact internal category identifiers matching FakeStoreAPI responses.
 */
export const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'jewelery', label: 'Jewelry' },
  { id: "men's clothing", label: "Men's Clothing" },
  { id: "women's clothing", label: "Women's Clothing" },
];

export const CATEGORY_LABELS = {
  all: 'All Products',
  electronics: 'Electronics',
  jewelery: 'Jewelry',
  "men's clothing": "Men's Clothing",
  "women's clothing": "Women's Clothing",
};

/**
 * Format an internal FakeStoreAPI category string into a user-facing label.
 */
export function getCategoryLabel(category) {
  if (!category) return 'Collection';
  return CATEGORY_LABELS[category] || category;
}

/**
 * Fetch all products from FakeStoreAPI with timeout and structured error handling.
 */
export async function fetchProducts(signal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const handleExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      throw new DOMException('Aborted', 'AbortError');
    }
    signal.addEventListener('abort', handleExternalAbort, { once: true });
  }

  try {
    const response = await fetch(`${BASE_URL}/products`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Unable to load products (server responded with status ${response.status}).`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format received from the product catalog API.');
    }

    return data.map((item) => ({
      id: item.id,
      title: String(item.title || 'Untitled Product').trim(),
      price: Number(item.price) || 0,
      description: String(item.description || '').trim(),
      category: String(item.category || '').trim(),
      image: item.image || '',
      rating: {
        rate: Number(item.rating?.rate) || 0,
        count: Number(item.rating?.count) || 0,
      },
    }));
  } catch (error) {
    if (error.name === 'AbortError') {
      if (signal?.aborted) {
        throw error;
      }
      throw new Error(
        'The product catalog took too long to respond. Please check your connection and try again.'
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        'Unable to reach FakeStoreAPI. Please verify your internet connection and retry.'
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', handleExternalAbort);
    }
  }
}
