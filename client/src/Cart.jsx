import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
            const userName = localStorage.getItem('userName');
            const userKey = userName.replace(/\s/g, '_');
            const cart = JSON.parse(localStorage.getItem(`cart_${userKey}`) || '[]');
            setCartItems(cart);
        }
    }, []);

    const removeFromCart = (itemId, itemType) => {
        const userName = localStorage.getItem('userName');
        const userKey = userName.replace(/\s/g, '_');
        
        const updated = cartItems.filter(item => 
            !(item.id === itemId && item.type === itemType)
        );
        
        setCartItems(updated);
        localStorage.setItem(`cart_${userKey}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('userDataUpdated'));
    };

    const clearCart = () => {
        if (window.confirm('האם אתה בטוח שברצונך לרוקן את העגלה?')) {
            const userName = localStorage.getItem('userName');
            const userKey = userName.replace(/\s/g, '_');
            
            setCartItems([]);
            localStorage.setItem(`cart_${userKey}`, JSON.stringify([]));
            window.dispatchEvent(new Event('userDataUpdated'));
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    };

    const handleCheckout = () => {
        alert('תכונת התשלום בפיתוח - בקרוב תוכל להשלים את ההזמנה!');
    };

    if (!isLoggedIn) {
        return (
            <div className="cart-page">
                <Header />
                <div className="cart-empty-state">
                    <div className="empty-icon">🛒</div>
                    <h2>עליך להתחבר כדי לצפות בעגלה</h2>
                    <p>התחבר כדי לראות את הפריטים שהוספת</p>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>
                        התחבר עכשיו
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <Header />
                <div className="cart-empty-state">
                    <div className="empty-icon">🛒</div>
                    <h2>העגלה שלך ריקה</h2>
                    <p>הוסף דילים ואטרקציות כדי להתחיל לתכנן את החופשה שלך</p>
                    <div className="empty-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/deals')}>
                            חפש דילים
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/attractions')}>
                            חפש אטרקציות
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="cart-page">
            <Header />
            
            <section className="cart-hero">
                <div className="hero-content">
                    <h1>🛒 העגלה שלי</h1>
                    <p>{cartItems.length} פריטים בעגלה</p>
                </div>
            </section>

            <section className="cart-content">
                <div className="cart-container">
                    <div className="cart-items">
                        <div className="cart-header">
                            <h2>הפריטים שלי</h2>
                            <button className="clear-cart-btn" onClick={clearCart}>
                                רוקן עגלה
                            </button>
                        </div>

                        {cartItems.map((item, index) => (
                            <div key={`${item.id}-${item.type}-${index}`} className="cart-item">
                                <div className="item-image">
                                    <img src={item.image} alt={item.name} />
                                    <span className="item-type-badge">
                                        {item.type === 'attraction' ? '🎯 אטרקציה' : '🔥 דיל'}
                                    </span>
                                </div>

                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p className="item-location">📍 {item.location}</p>
                                    
                                    {item.type === 'attraction' && item.duration && (
                                        <p className="item-duration">⏱️ משך: {item.duration}</p>
                                    )}
                                    
                                    {item.type === 'deal' && item.dates && (
                                        <p className="item-dates">📅 {item.dates}</p>
                                    )}
                                    
                                    {item.rating && (
                                        <div className="item-rating">
                                            <span>⭐ {item.rating}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="item-actions">
                                    <div className="item-price">
                                        <span className="price-label">מחיר:</span>
                                        <span className="price-value">₪{item.price}</span>
                                    </div>
                                    <button 
                                        className="remove-btn" 
                                        onClick={() => removeFromCart(item.id, item.type)}
                                    >
                                        🗑️ הסר
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="summary-card">
                            <h3>סיכום הזמנה</h3>
                            
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>מספר פריטים:</span>
                                    <span>{cartItems.length}</span>
                                </div>
                                
                                <div className="summary-row">
                                    <span>אטרקציות:</span>
                                    <span>{cartItems.filter(i => i.type === 'attraction').length}</span>
                                </div>
                                
                                <div className="summary-row">
                                    <span>דילים:</span>
                                    <span>{cartItems.filter(i => i.type === 'deal').length}</span>
                                </div>
                                
                                <div className="summary-divider"></div>
                                
                                <div className="summary-row total">
                                    <span>סה"כ לתשלום:</span>
                                    <span className="total-price">₪{calculateTotal()}</span>
                                </div>
                            </div>

                            <button className="checkout-btn" onClick={handleCheckout}>
                                המשך לתשלום 💳
                            </button>

                            <div className="continue-shopping">
                                <button onClick={() => navigate('/deals')}>
                                    ← המשך לקניות
                                </button>
                            </div>
                        </div>

                        <div className="benefits-card">
                            <h4>✨ יתרונות ההזמנה שלך</h4>
                            <ul>
                                <li>✓ ביטול חינם עד 24 שעות לפני</li>
                                <li>✓ מחירים מובטחים</li>
                                <li>✓ שירות לקוחות 24/7</li>
                                <li>✓ אישור מיידי</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Cart;