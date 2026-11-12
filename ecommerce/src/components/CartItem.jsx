import { useState } from 'react';
import { ImageOff, Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import './CartItem.css';

export default function CartItem({
  item,
  maxQuantity,
  onUpdateQuantity,
  onRemove,
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const itemTotal = item.price * item.quantity;

  return (
    <li className="cart-item">
      <div className="cart-item-img-wrap">
        {!imgFailed && item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="cart-item-img"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <ImageOff size={20} className="cart-item-img-fallback" aria-hidden="true" />
        )}
      </div>

      <div className="cart-item-details">
        <div className="cart-item-top">
          <h4 className="cart-item-title">{item.title}</h4>
          <button
            type="button"
            className="cart-item-remove"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.title} from cart`}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>

        <p className="cart-item-unit-price">{formatCurrency(item.price)} each</p>

        <div className="cart-item-bottom">
          <div className="qty-stepper" aria-label={`Quantity for ${item.title}`}>
            <button
              type="button"
              className="qty-btn"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.title}`}
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span className="qty-value" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              className="qty-btn"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= maxQuantity}
              aria-label={`Increase quantity of ${item.title}`}
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>

          <span className="cart-item-subtotal">{formatCurrency(itemTotal)}</span>
        </div>
      </div>
    </li>
  );
}
