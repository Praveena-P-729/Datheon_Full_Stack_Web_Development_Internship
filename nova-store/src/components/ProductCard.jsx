import { useState } from "react";
import { Star, ShoppingBag, Check } from "lucide-react";
import { formatCategoryLabel } from "../services/api";
import { formatCurrency } from "../utils/calculations";
import { useCart } from "../context/CartContext";

const FALLBACK_PRODUCT_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240' fill='none'><rect width='240' height='240' fill='#F6F3ED'/><rect x='76' y='72' width='88' height='96' rx='6' stroke='#202923' stroke-opacity='0.25' stroke-width='2'/><text x='120' y='125' font-family='sans-serif' font-size='12' fill='#202923' fill-opacity='0.5' text-anchor='middle'>Image Unavailable</text></svg>`
  );

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const [imgError, setImgError] = useState(false);

  const inCart = cartItems.find((item) => item.id === product.id);
  const ratingRate = product.rating && typeof product.rating.rate === "number" ? product.rating.rate : 0;
  const ratingCount = product.rating && typeof product.rating.count === "number" ? product.rating.count : 0;

  return (
    <article className="product-card">
      <div className="product-image-frame">
        <img
          src={imgError || !product.image ? FALLBACK_PRODUCT_SVG : product.image}
          alt={product.title}
          className="product-image"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>

      <div className="product-body">
        <span className="product-category">{formatCategoryLabel(product.category)}</span>

        <h3 className="product-title" title={product.title}>
          {product.title}
        </h3>

        <div className="product-rating" aria-label={`Rated ${ratingRate} out of 5 from ${ratingCount} reviews`}>
          <Star size={14} className="rating-star" fill="currentColor" aria-hidden="true" />
          <span className="rating-value">{ratingRate.toFixed(1)}</span>
          <span className="rating-count">({ratingCount} reviews)</span>
        </div>

        <div className="product-footer">
          <span className="product-price">{formatCurrency(product.price)}</span>

          <button
            type="button"
            className={`btn-add-cart ${inCart ? "in-cart" : ""}`}
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.title} to shopping cart`}
          >
            {inCart ? (
              <>
                <Check size={15} aria-hidden="true" />
                <span>In Cart ({inCart.quantity})</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} aria-hidden="true" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
