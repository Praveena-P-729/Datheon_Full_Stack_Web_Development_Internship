import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/calculations";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);

  return (
    <li className="cart-item">
      <div className="cart-item-img-wrap">
        <img src={item.image} alt={item.title} className="cart-item-img" />
      </div>

      <div className="cart-item-details">
        <div className="cart-item-top">
          <h4 className="cart-item-title">{item.title}</h4>
          <button
            type="button"
            className="cart-remove-btn"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.title} from cart`}
            title="Remove item"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <p className="cart-item-unit-price">{formatCurrency(item.price)} each</p>

        <div className="cart-item-bottom">
          <div className="qty-stepper" aria-label={`Quantity controls for ${item.title}`}>
            <button
              type="button"
              className="qty-btn"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              aria-label={`Decrease quantity of ${item.title}`}
            >
              <Minus size={14} />
            </button>
            <span className="qty-value" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              className="qty-btn"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              aria-label={`Increase quantity of ${item.title}`}
            >
              <Plus size={14} />
            </button>
          </div>

          <span className="cart-item-total">{formatCurrency(lineTotal)}</span>
        </div>
      </div>
    </li>
  );
}
