import { useState } from 'react';
import { ImageOff, Plus, ShoppingBag, Star } from 'lucide-react';
import { getCategoryLabel } from '../services/api';
import { formatCurrency } from '../utils/calculations';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const [imgFailed, setImgFailed] = useState(false);

  const existingCartItem = cartItems.find((item) => item.id === product.id);
  const inCartQty = existingCartItem ? existingCartItem.quantity : 0;

  const rate = Number(product.rating?.rate || 0).toFixed(1);
  const count = Number(product.rating?.count || 0);

  return (
    <article className="product-card">
      <div className="product-card-media">
        {!imgFailed && product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="product-card-img"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="product-card-img-fallback" aria-label="Product image unavailable">
            <ImageOff size={28} aria-hidden="true" />
            <span>Image unavailable</span>
          </div>
        )}
        <span className="product-card-category">{getCategoryLabel(product.category)}</span>
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title" title={product.title}>
          {product.title}
        </h3>

        <div className="product-card-meta">
          <span className="product-card-price">{formatCurrency(product.price)}</span>

          <div
            className="product-card-rating"
            aria-label={`Rated ${rate} out of 5 based on ${count} reviews`}
          >
            <Star size={14} className="product-star-icon" aria-hidden="true" />
            <span className="product-rating-value">{rate}</span>
            <span className="product-rating-count">({count})</span>
          </div>
        </div>

        <div className="product-card-actions">
          <button
            type="button"
            className={`btn product-add-btn ${inCartQty > 0 ? 'is-in-cart' : 'btn-primary'}`}
            onClick={() => addToCart(product)}
          >
            {inCartQty > 0 ? (
              <>
                <Plus size={16} aria-hidden="true" />
                <span>Add More ({inCartQty} in cart)</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} aria-hidden="true" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
