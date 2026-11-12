const FAKESTORE_PRODUCTS_URL = "https://fakestoreapi.com/products";

/**
 * Exact category values returned by FakeStoreAPI
 */
export const API_CATEGORIES = {
  ALL: "all",
  ELECTRONICS: "electronics",
  JEWELERY: "jewelery",
  MENS_CLOTHING: "men's clothing",
  WOMENS_CLOTHING: "women's clothing",
  CLOTHING_GROUP: "clothing"
};

/**
 * Human-readable labels for FakeStoreAPI category keys
 * @param {string} category
 * @returns {string}
 */
export function formatCategoryLabel(category) {
  switch (category) {
    case API_CATEGORIES.ALL:
      return "All Products";
    case API_CATEGORIES.ELECTRONICS:
      return "Electronics";
    case API_CATEGORIES.JEWELERY:
      return "Jewelry";
    case API_CATEGORIES.MENS_CLOTHING:
      return "Men's Clothing";
    case API_CATEGORIES.WOMENS_CLOTHING:
      return "Women's Clothing";
    case API_CATEGORIES.CLOTHING_GROUP:
      return "Clothing";
    default:
      return category || "Collection";
  }
}

/**
 * Fetches full product catalog from FakeStoreAPI with timeout protection
 * @param {AbortSignal} externalSignal
 * @returns {Promise<Array<Object>>}
 */
export async function fetchProducts(externalSignal) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("You appear to be offline. Please check your internet connection and retry.");
  }

  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 12000);

  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer);
      throw new DOMException("Aborted", "AbortError");
    }
    externalSignal.addEventListener("abort", onExternalAbort, { once: true });
  }

  try {
    const response = await fetch(FAKESTORE_PRODUCTS_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Unable to load store catalog (HTTP ${response.status}). Please try again.`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Unexpected response format from product catalog service.");
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      if (timedOut) {
        throw new Error("Product catalog request timed out. Please try again.");
      }
      throw err;
    }
    throw new Error(
      err.message || "Failed to connect to the product catalog. Please retry."
    );
  } finally {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }
}
