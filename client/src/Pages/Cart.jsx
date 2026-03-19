        // פונקציה להצגת מיקום/יעד של פריט בעגלה
        const getItemDisplayLocation = (item) => {
            return item?.location || item?.destination || '';
        };
    // פונקציה להצגת שם פריט בעגלה
    const getItemDisplayName = (item) => {
        return item?.name || item?.destination || item?.title || item?.location || 'פריט ללא שם';
    };
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    MapPin,
    Clock3,
    CalendarDays,
    Star,
    Trash2,
    CreditCard,
    ArrowRight,
    Sparkles,
    BadgeCheck,
    Flame,
} from 'lucide-react';
import Header from '../Header&Footer/Header';
import Footer from '../Header&Footer/Footer';
import './Cart.css';

const Cart = () => {
        // פונקציה להצגת מיקום/יעד של פריט בעגלה
        const getItemDisplayLocation = (item) => {
            return item?.location || item?.destination || '';
        };
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // לא צריך יותר את הסטייטים של טופס התשלום כאן

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
        navigate('/checkout');
    };

    const handleFormChange = (e, idx) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('passenger')) {
            const passengers = [...form.passengers];
            passengers[idx]["name"] = value;
            setForm({ ...form, passengers });
        } else if (type === 'checkbox') {
            setForm({ ...form, [name]: checked });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const addPassenger = () => {
        setForm({ ...form, passengers: [...form.passengers, { name: '' }] });
    };

    const removePassenger = (idx) => {
        const passengers = form.passengers.filter((_, i) => i !== idx);
        setForm({ ...form, passengers });
    };

    const handlePayment = (e) => {
        e.preventDefault();
        // Validation
        if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.country || !form.payment ||
            (form.payment === 'credit' && (!form.cardNumber || !form.cardExp || !form.cardCvv)) ||
            form.passengers.some(p => !p.name)) {
            setFormError('אנא מלא את כל השדות');
            return;
        }
        setFormError('');
        // Simulate payment and show confirmation modal
        setTimeout(() => {
            // Clear cart after payment
            const userName = localStorage.getItem('userName');
            const userKey = userName.replace(/\s/g, '_');
            setCartItems([]);
            localStorage.setItem(`cart_${userKey}`, JSON.stringify([]));
            window.dispatchEvent(new Event('userDataUpdated'));
        }, 1000);
    }

    return (
        <div className="cart-page">
            <Header />
            <section className="cart-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <ShoppingCart className="title-icon" />
                        העגלה שלי
                    </h1>
                    <p>{cartItems.length} פריטים בעגלה</p>
                </div>
            </section>

            <section className="cart-content">
                <div className="cart-container">
                    <>
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
                                    <img src={item.image} alt={getItemDisplayName(item)} />
                                    <span className="item-type-badge">
                                        {item.type === 'attraction' ? <MapPin className="type-badge-icon attraction-icon" /> : <Flame className="type-badge-icon deal-icon" />}
                                        {item.type === 'attraction' ? 'אטרקציה' : 'דיל'}
                                    </span>
                                </div>
                                <div className="item-details">
                                    <h3>{getItemDisplayName(item)}</h3>
                                    {getItemDisplayLocation(item) && (
                                        <p className="item-location"><MapPin className="meta-icon" />{getItemDisplayLocation(item)}</p>
                                    )}
                                    {item.type === 'attraction' && item.duration && (
                                        <p className="item-duration"><Clock3 className="meta-icon" />משך: {item.duration}</p>
                                    )}
                                    {item.type === 'deal' && item.dates && (
                                        <p className="item-dates"><CalendarDays className="meta-icon" />{item.dates}</p>
                                    )}
                                    {item.rating && (
                                        <div className="item-rating">
                                            <span><Star className="meta-icon star-icon" />{item.rating}</span>
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
                                        <Trash2 className="btn-icon" />
                                        הסר
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
                                <CreditCard className="btn-icon" />
                                המשך לתשלום
                            </button>
                            <div className="continue-shopping">
                                <button onClick={() => navigate('/deals')}>
                                    <ArrowRight className="btn-icon" />
                                    המשך לקניות
                                </button>
                            </div>
                        </div>
                        <div className="benefits-card">
                            <h4>
                                <Sparkles className="title-icon" />
                                יתרונות ההזמנה שלך
                            </h4>
                            <ul>
                                <li><BadgeCheck className="benefit-icon" />ביטול חינם עד 24 שעות לפני</li>
                                <li><BadgeCheck className="benefit-icon" />מחירים מובטחים</li>
                                <li><BadgeCheck className="benefit-icon" />שירות לקוחות 24/7</li>
                                <li><BadgeCheck className="benefit-icon" />אישור מיידי</li>
                            </ul>
                        </div>
                    </div>
                    </>
                    {/* אין יותר מודאלים של תשלום/אישור כאן */}
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Cart;