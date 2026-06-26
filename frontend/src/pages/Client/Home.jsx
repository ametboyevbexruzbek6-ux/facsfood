import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  MdShoppingCart, MdFastfood, MdAddShoppingCart, MdClose,
  MdRemove, MdAdd, MdDeliveryDining, MdAccessTime,
  MdStar, MdArrowForward, MdStorefront, MdPayment
} from 'react-icons/md';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '', phone: '', address: '',
    deliveryType: 'Yetkazib berish', paymentType: 'Naqd pul'
  });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data.filter(p => p.status === 'Mavjud'));
      } catch (error) {
        console.error("Mahsulotlar yuklanmadi", error);
      }
    };
    fetchProducts();

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 500);
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCartItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const items = cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price }));

    try {
      await axios.post('/api/orders', {
        ...checkoutForm,
        totalAmount: totalCartAmount,
        items
      });
      setOrderSuccess(true);
      setCart([]);
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } catch (error) {
      console.error("Buyurtma yuborishda xatolik", error);
      alert("Xatolik yuz berdi");
    }
  };

  const topProducts = products.filter(p => p.isTop === 1);

  return (
    <div className="client-page">
      {/* Floating Particles */}
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>

      {/* Header */}
      <header className={`client-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-logo">
          <div className="header-logo-icon">F</div>
          <span className="header-logo-text">FastFood</span>
        </div>
        <div className="header-nav">
          <Link to="/admin" className="header-link">Admin</Link>
          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            <MdShoppingCart />
            {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="client-hero">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>

        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Tez va sifatli yetkazib berish
        </div>

        <h1>
          Eng mazali <span className="hero-highlight">Fast Food</span><br />
          shu yerda!
        </h1>

        <p>
          Premium sifatdagi taomlarni buyurtma qiling — tez, qulay va mazali.
          Har bir luqmadan zavqlaning.
        </p>

        <div className="hero-cta-group">
          <button className="hero-cta-primary" onClick={scrollToMenu}>
            Menyuni ko'rish <MdArrowForward />
          </button>
          <button className="hero-cta-secondary" onClick={() => setIsCartOpen(true)}>
            <MdShoppingCart /> Savatcha {totalCartItems > 0 && `(${totalCartItems})`}
          </button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{products.length}<span>+</span></div>
            <div className="hero-stat-label">Taom turlari</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">30<span> min</span></div>
            <div className="hero-stat-label">Yetkazib berish</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">4.9<span>★</span></div>
            <div className="hero-stat-label">Reyting</div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <div className="features-bar">
        <div className="feature-item">
          <div className="feature-icon"><MdDeliveryDining /></div>
          <div className="feature-text">
            <h4>Tez yetkazish</h4>
            <p>30 daqiqa ichida</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon"><MdStar /></div>
          <div className="feature-text">
            <h4>Yuqori sifat</h4>
            <p>Toza ingredientlar</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon"><MdPayment /></div>
          <div className="feature-text">
            <h4>Qulay to'lov</h4>
            <p>Naqd va karta</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon"><MdStorefront /></div>
          <div className="feature-text">
            <h4>Olib ketish</h4>
            <p>O'zingiz oling</p>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <section className="menu-section" ref={menuRef}>
        <div className="section-header">
          <div>
            <h2>Bizning <span>Menyu</span></h2>
            <p className="section-subtitle">Eng mazali taomlardan tanlang va buyurtma bering</p>
          </div>
          <div style={{ color: 'var(--c-text-dim)', fontSize: '14px' }}>
            {products.length} ta taom
          </div>
        </div>

        <div className="menu-grid">
          {products.map(product => (
            <div key={product.id} className="menu-card">
              <div className="menu-img-container">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <MdFastfood style={{ fontSize: '64px', color: 'var(--c-gold)', opacity: 0.3 }} />
                )}
                {product.isTop === 1 && (
                  <div className="menu-card-top-badge">
                    <MdStar /> TOP
                  </div>
                )}
                <div className="menu-img-overlay"></div>
              </div>
              <div className="menu-details">
                <h3>{product.name}</h3>
                <p className="desc">{product.description}</p>
                <div className="menu-card-footer">
                  <div className="menu-price">{formatPrice(product.price)}</div>
                  <button
                    className={`add-cart-btn ${addedProductId === product.id ? 'added' : ''}`}
                    onClick={() => addToCart(product)}
                  >
                    <MdAddShoppingCart />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="client-footer">
        <p>© 2024 <span className="brand">FastFood</span> — Barcha huquqlar himoyalangan</p>
      </footer>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>
          <div className="cart-sidebar">
            {/* Cart Header */}
            <div className="cart-header">
              <h2>
                <MdShoppingCart /> Savatcha
                {totalCartItems > 0 && <span className="count">{totalCartItems}</span>}
              </h2>
              <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>
                <MdClose />
              </button>
            </div>

            {/* Cart Body */}
            <div className="cart-body">
              {orderSuccess ? (
                <div className="cart-success">
                  <div className="cart-success-icon">✓</div>
                  <h3>Buyurtma qabul qilindi!</h3>
                  <p>Operator tez orada siz bilan bog'lanadi.</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon"><MdShoppingCart /></div>
                  <p>Savatchangiz bo'sh</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div style={{ marginBottom: '28px' }}>
                    {cart.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-img">
                          {item.image && <img src={item.image} alt={item.name} />}
                        </div>
                        <div className="cart-item-info">
                          <h4>{item.name}</h4>
                          <div className="item-price">{formatPrice(item.price)}</div>
                        </div>
                        <div className="cart-item-qty">
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}><MdAdd /></button>
                          <span className="qty-value">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}><MdRemove /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form className="checkout-form" onSubmit={handleCheckout}>
                    <h3>Ma'lumotlaringiz</h3>

                    <div className="form-group">
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="Ismingiz"
                        value={checkoutForm.customerName}
                        onChange={e => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="Telefon raqamingiz"
                        value={checkoutForm.phone}
                        onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="delivery-toggle">
                      <label className={`delivery-option ${checkoutForm.deliveryType === 'Yetkazib berish' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="delivery"
                          checked={checkoutForm.deliveryType === 'Yetkazib berish'}
                          onChange={() => setCheckoutForm({ ...checkoutForm, deliveryType: 'Yetkazib berish' })}
                        />
                        🛵 Yetkazish
                      </label>
                      <label className={`delivery-option ${checkoutForm.deliveryType === 'Olib ketish' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="delivery"
                          checked={checkoutForm.deliveryType === 'Olib ketish'}
                          onChange={() => setCheckoutForm({ ...checkoutForm, deliveryType: 'Olib ketish' })}
                        />
                        🏪 Olib ketish
                      </label>
                    </div>

                    {checkoutForm.deliveryType === 'Yetkazib berish' && (
                      <div className="form-group">
                        <textarea
                          className="form-input"
                          required
                          placeholder="Manzilni kiriting..."
                          rows="2"
                          value={checkoutForm.address}
                          onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                        ></textarea>
                      </div>
                    )}

                    <button type="submit" className="checkout-btn">
                      Buyurtma berish — {formatPrice(totalCartAmount)}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Cart Total Bar (only shown when items exist) */}
            {cart.length > 0 && !orderSuccess && (
              <div className="cart-total-bar">
                <div className="cart-total-row">
                  <span className="label">Jami summa:</span>
                  <span className="value">{formatPrice(totalCartAmount)}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
