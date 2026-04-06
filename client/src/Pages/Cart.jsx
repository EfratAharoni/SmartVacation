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
    Pencil,
    PlaneTakeoff,
    Hotel,
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
    const [editingItem, setEditingItem] = useState(null);
    const [editOptions, setEditOptions] = useState(null);
    const [editingAttraction, setEditingAttraction] = useState(null);
    const [editAttrQty, setEditAttrQty] = useState(null);

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
        return cartItems.reduce((sum, item) => {
            const price = item.totalPrice != null ? item.totalPrice : (item.price || 0);
            return sum + price;
        }, 0);
    };


    const calcBookingTotal = (item, opts) => {
        const basePrice = opts.cancellable ? item.price + 55 : item.price;
        const childPrice = Math.round(basePrice * 0.7);
        let total = basePrice * opts.adults;
        total += childPrice * opts.children;
        if (opts.trolley) total += 102;
        if (opts.suitcase) total += 224;
        if (opts.transfer) total += 57 * (opts.adults + opts.children);
        return total;
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setEditOptions(item.bookingOptions
            ? { ...item.bookingOptions }
            : { adults: 2, children: 0, trolley: false, suitcase: false, transfer: false, cancellable: false }
        );
    };

    const saveEdit = () => {
        const userName = localStorage.getItem('userName');
        const userKey = userName.replace(/\s/g, '_');
        const newTotal = calcBookingTotal(editingItem, editOptions);
        const updated = cartItems.map(item =>
            (item.id === editingItem.id && item.type === editingItem.type)
                ? { ...item, bookingOptions: { ...editOptions }, totalPrice: newTotal }
                : item
        );
        setCartItems(updated);
        localStorage.setItem(`cart_${userKey}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('userDataUpdated'));
        setEditingItem(null);
        setEditOptions(null);
    };

    const getAttrChildPrice = (item) =>
        item.childPrice != null ? item.childPrice : Math.round((item.price || 0) * 0.6);

    const calcAttrTotal = (item, qty) => {
        if ((item.price || 0) === 0) return 0;
        return (item.price * qty.adults) + (getAttrChildPrice(item) * qty.children);
    };

    const openEditAttrModal = (item) => {
        setEditingAttraction(item);
        setEditAttrQty(item.bookingQty
            ? { ...item.bookingQty }
            : { adults: 1, children: 0, infants: 0 }
        );
    };

    const saveEditAttraction = () => {
        const userName = localStorage.getItem('userName');
        const userKey = userName.replace(/\s/g, '_');
        const newTotal = calcAttrTotal(editingAttraction, editAttrQty);
        const updated = cartItems.map(item =>
            (item._id === editingAttraction._id && item.type === 'attraction')
                ? { ...item, bookingQty: { ...editAttrQty }, totalPrice: newTotal }
                : item
        );
        setCartItems(updated);
        localStorage.setItem(`cart_${userKey}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('userDataUpdated'));
        setEditingAttraction(null);
        setEditAttrQty(null);
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
                                    {item.type === 'attraction' && item.bookingQty && (
                                        <div className="item-booking-tags">
                                            {item.bookingQty.adults > 0 && (
                                                <span className="booking-tag">👤 {item.bookingQty.adults} מבוגרים</span>
                                            )}
                                            {item.bookingQty.children > 0 && (
                                                <span className="booking-tag">🧒 {item.bookingQty.children} ילדים</span>
                                            )}
                                            {item.bookingQty.infants > 0 && (
                                                <span className="booking-tag booking-tag-green">👶 {item.bookingQty.infants} תינוקות</span>
                                            )}
                                        </div>
                                    )}
                                    {item.type === 'deal' && item.dates && (
                                        <p className="item-dates"><CalendarDays className="meta-icon" />{item.dates}</p>
                                    )}
                                    {item.type === 'deal' && item.bookingOptions && (
                                        <div className="item-booking-tags">
                                            <span className="booking-tag">
                                                👥 {item.bookingOptions.adults} מבוגרים{item.bookingOptions.children > 0 ? ` · ${item.bookingOptions.children} ילדים` : ''}
                                            </span>
                                            {item.bookingOptions.trolley && <span className="booking-tag">🎒 טרולי</span>}
                                            {item.bookingOptions.suitcase && <span className="booking-tag">🧳 מזוודה</span>}
                                            {item.bookingOptions.transfer && <span className="booking-tag">🚌 הסעות</span>}
                                            {item.bookingOptions.cancellable && <span className="booking-tag booking-tag-green">✓ ביטול חינם</span>}
                                        </div>
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
                                        <span className="price-value">
                                            {item.totalPrice === 0 ? 'חינם' : `₪${item.totalPrice ?? item.price}`}
                                        </span>
                                        {item.type === 'deal' && item.totalPrice && item.totalPrice !== item.price && (
                                            <span className="price-base-note">₪{item.price} למבוגר</span>
                                        )}
                                        {item.type === 'attraction' && item.bookingQty && item.price > 0 && (
                                            <span className="price-base-note">₪{item.price} למבוגר</span>
                                        )}
                                    </div>
                                    {item.type === 'deal' && (
                                        <button
                                            className="edit-booking-btn"
                                            onClick={() => openEditModal(item)}
                                        >
                                            <Pencil className="btn-icon" />
                                            ערוך
                                        </button>
                                    )}
                                    {item.type === 'attraction' && item.bookingQty && (
                                        <button
                                            className="edit-booking-btn"
                                            onClick={() => openEditAttrModal(item)}
                                        >
                                            <Pencil className="btn-icon" />
                                            ערוך
                                        </button>
                                    )}
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

            {/* Edit Attraction Qty Modal */}
            {editingAttraction && editAttrQty && (
                <div className="cart-modal-overlay" onClick={() => setEditingAttraction(null)}>
                    <div className="attr-booking-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="attr-close-btn" onClick={() => setEditingAttraction(null)}>✕</button>

                        {/* Header */}
                        <div className="attr-modal-header">
                            <div className="attr-header-row">
                                <div className="attr-destination-info">
                                    <h2 className="attr-destination">{editingAttraction.name}</h2>
                                    <div className="attr-header-chips">
                                        <span className="attr-header-chip">📍 {editingAttraction.location}</span>
                                        {editingAttraction.rating && <span className="attr-header-chip">⭐ {editingAttraction.rating}</span>}
                                        {editingAttraction.duration && <span className="attr-header-chip">⏱ {editingAttraction.duration}</span>}
                                    </div>
                                </div>
                                <div className="attr-header-price">
                                    <span className="attr-header-price-label">מחיר</span>
                                    <span className="attr-header-price-value">
                                        {(editingAttraction.price || 0) === 0 ? 'חינם' : `₪${editingAttraction.price}`}
                                    </span>
                                    <span className="attr-header-price-per">למבוגר</span>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="attr-modal-body">
                            {/* Options Column */}
                            <div className="attr-options-col">
                                <div className="attr-section">
                                    <h3 className="attr-section-title">מבקרים</h3>

                                    <div className="attr-passenger-row">
                                        <div className="attr-passenger-info">
                                            <span className="attr-passenger-label">מבוגרים</span>
                                            <span className="attr-passenger-desc">גיל 13+ | {(editingAttraction.price || 0) === 0 ? 'חינם' : `₪${editingAttraction.price} לאדם`}</span>
                                        </div>
                                        <div className="attr-passenger-counter">
                                            <button className="attr-counter-btn" onClick={() => setEditAttrQty(q => ({ ...q, adults: Math.max(1, q.adults - 1) }))} disabled={editAttrQty.adults <= 1}>−</button>
                                            <span className="attr-counter-val">{editAttrQty.adults}</span>
                                            <button className="attr-counter-btn" onClick={() => setEditAttrQty(q => ({ ...q, adults: Math.min(20, q.adults + 1) }))}>+</button>
                                        </div>
                                    </div>

                                    {(editingAttraction.price || 0) > 0 && (
                                        <div className="attr-passenger-row">
                                            <div className="attr-passenger-info">
                                                <span className="attr-passenger-label">ילדים</span>
                                                <span className="attr-passenger-desc">גיל 3–12 | ₪{getAttrChildPrice(editingAttraction)} לילד</span>
                                            </div>
                                            <div className="attr-passenger-counter">
                                                <button className="attr-counter-btn" onClick={() => setEditAttrQty(q => ({ ...q, children: Math.max(0, q.children - 1) }))} disabled={editAttrQty.children <= 0}>−</button>
                                                <span className="attr-counter-val">{editAttrQty.children}</span>
                                                <button className="attr-counter-btn" onClick={() => setEditAttrQty(q => ({ ...q, children: Math.min(20, q.children + 1) }))}>+</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="attr-passenger-row">
                                        <div className="attr-passenger-info">
                                            <span className="attr-passenger-label">תינוקות</span>
                                            <span className="attr-passenger-desc">גיל 0–2 | חינם</span>
                                        </div>
                                        <div className="attr-passenger-counter">
                                            <button className="attr-counter-btn" onClick={() => setEditAttrQty(q => ({ ...q, infants: Math.max(0, q.infants - 1) }))} disabled={editAttrQty.infants <= 0}>−</button>
                                            <span className="attr-counter-val">{editAttrQty.infants}</span>
                                            <button className="attr-counter-btn" onClick={() => setEditAttrQty(q => ({ ...q, infants: Math.min(10, q.infants + 1) }))}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price Summary Column */}
                            <div className="attr-summary-col">
                                <div className="attr-price-card">
                                    <h3 className="attr-price-title">סיכום מחיר</h3>
                                    <div className="attr-price-rows">
                                        <div className="attr-price-row">
                                            <span>{editAttrQty.adults} מבוגרים × ₪{editingAttraction.price || 0}</span>
                                            <span>₪{(editingAttraction.price || 0) * editAttrQty.adults}</span>
                                        </div>
                                        {editAttrQty.children > 0 && (
                                            <div className="attr-price-row">
                                                <span>{editAttrQty.children} ילדים × ₪{getAttrChildPrice(editingAttraction)}</span>
                                                <span>₪{getAttrChildPrice(editingAttraction) * editAttrQty.children}</span>
                                            </div>
                                        )}
                                        {editAttrQty.infants > 0 && (
                                            <div className="attr-price-row">
                                                <span>{editAttrQty.infants} תינוקות</span>
                                                <span className="attr-free">חינם</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="attr-price-divider"></div>
                                    <div className="attr-price-total">
                                        <span>סה״כ לתשלום</span>
                                        <span className="attr-price-total-amount">
                                            {calcAttrTotal(editingAttraction, editAttrQty) === 0 ? 'חינם' : `₪${calcAttrTotal(editingAttraction, editAttrQty)}`}
                                        </span>
                                    </div>
                                    <button className="attr-confirm-btn" onClick={saveEditAttraction}>
                                        שמור שינויים
                                    </button>
                                    <p className="attr-price-note">השינויים יתעדכנו בסל שלך</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Booking Modal */}
            {editingItem && editOptions && (
                <div className="cart-modal-overlay" onClick={() => setEditingItem(null)}>
                    <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="deal-close-btn booking-close-btn" onClick={() => setEditingItem(null)}>✕</button>

                        {/* Header */}
                        <div className="booking-modal-header">
                            <div className="booking-header-row">
                                <div className="booking-destination-info">
                                    <h2 className="booking-destination">{editingItem.destination}</h2>
                                    <div className="booking-header-chips">
                                        <span className="booking-header-chip">
                                            <PlaneTakeoff size={13} /> {editingItem.airline}
                                        </span>
                                        <span className="booking-header-chip">
                                            <Hotel size={13} /> {editingItem.hotelName || editingItem.hotel}
                                        </span>
                                        <span className="booking-header-chip">
                                            <CalendarDays size={13} /> {editingItem.dates}
                                        </span>
                                    </div>
                                </div>
                                <div className="booking-header-price">
                                    <span className="booking-header-price-label">החל מ</span>
                                    <span className="booking-header-price-value">₪{editingItem.price}</span>
                                    <span className="booking-header-price-per">למבוגר</span>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="booking-modal-body">
                            <div className="booking-options-col">

                                {/* Passengers */}
                                <div className="booking-section">
                                    <h3 className="booking-section-title">נוסעים</h3>
                                    <div className="passenger-row">
                                        <div className="passenger-info">
                                            <span className="passenger-label">מבוגרים</span>
                                            <span className="passenger-desc">גיל 12+</span>
                                        </div>
                                        <div className="passenger-counter">
                                            <button className="counter-btn" onClick={() => setEditOptions(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))} disabled={editOptions.adults <= 1}>−</button>
                                            <span className="counter-value">{editOptions.adults}</span>
                                            <button className="counter-btn" onClick={() => setEditOptions(p => ({ ...p, adults: Math.min(9, p.adults + 1) }))} disabled={editOptions.adults >= 9}>+</button>
                                        </div>
                                    </div>
                                    <div className="passenger-row">
                                        <div className="passenger-info">
                                            <span className="passenger-label">ילדים</span>
                                            <span className="passenger-desc">גיל 2–11</span>
                                        </div>
                                        <div className="passenger-counter">
                                            <button className="counter-btn" onClick={() => setEditOptions(p => ({ ...p, children: Math.max(0, p.children - 1) }))} disabled={editOptions.children <= 0}>−</button>
                                            <span className="counter-value">{editOptions.children}</span>
                                            <button className="counter-btn" onClick={() => setEditOptions(p => ({ ...p, children: Math.min(6, p.children + 1) }))} disabled={editOptions.children >= 6}>+</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Luggage */}
                                <div className="booking-section">
                                    <h3 className="booking-section-title">כבודה</h3>
                                    <p className="booking-section-subtitle">גודל ומשקל</p>
                                    <div className="booking-option-row">
                                        <span className="booking-option-icon">🎒</span>
                                        <div className="booking-option-info">
                                            <span className="booking-option-name">טרולי</span>
                                            <span className="booking-option-price">לכל הנוסעים, הלוך ושוב +₪102</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={editOptions.trolley} onChange={(e) => setEditOptions(p => ({ ...p, trolley: e.target.checked }))} />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div className="booking-option-row">
                                        <span className="booking-option-icon">🧳</span>
                                        <div className="booking-option-info">
                                            <span className="booking-option-name">מזוודה</span>
                                            <span className="booking-option-price">לכל הנוסעים, הלוך ושוב +₪224</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={editOptions.suitcase} onChange={(e) => setEditOptions(p => ({ ...p, suitcase: e.target.checked }))} />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                {/* Transfer */}
                                <div className="booking-section">
                                    <h3 className="booking-section-title">הסעות</h3>
                                    <div className="booking-option-row">
                                        <span className="booking-option-icon">🚌</span>
                                        <div className="booking-option-info">
                                            <span className="booking-option-name">שירות הסעות</span>
                                            <span className="booking-option-price">החל מ-₪57 לאדם</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={editOptions.transfer} onChange={(e) => setEditOptions(p => ({ ...p, transfer: e.target.checked }))} />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                {/* Cancellation */}
                                <div className="booking-section">
                                    <h3 className="booking-section-title">תנאי החבילה</h3>
                                    <label className="cancellation-option-row">
                                        <input type="radio" name="edit-cancellation" checked={!editOptions.cancellable} onChange={() => setEditOptions(p => ({ ...p, cancellable: false }))} />
                                        <div className="cancellation-option-info">
                                            <span className="cancellation-option-name">ללא אפשרות ביטול</span>
                                            <span className="cancellation-option-price">₪{editingItem.price} למבוגר</span>
                                        </div>
                                    </label>
                                    <label className="cancellation-option-row">
                                        <input type="radio" name="edit-cancellation" checked={editOptions.cancellable} onChange={() => setEditOptions(p => ({ ...p, cancellable: true }))} />
                                        <div className="cancellation-option-info">
                                            <span className="cancellation-option-name">ביטול חינם עד 30 יום לפני הנסיעה</span>
                                            <span className="cancellation-option-price cancellation-free">₪{editingItem.price + 55} למבוגר</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="booking-summary-col">
                                <div className="price-summary-card">
                                    <h3 className="price-summary-title">סיכום מחיר</h3>
                                    <div className="price-summary-rows">
                                        <div className="price-summary-row">
                                            <span>{editOptions.adults} מבוגרים × ₪{editOptions.cancellable ? editingItem.price + 55 : editingItem.price}</span>
                                            <span>₪{(editOptions.cancellable ? editingItem.price + 55 : editingItem.price) * editOptions.adults}</span>
                                        </div>
                                        {editOptions.children > 0 && (
                                            <div className="price-summary-row">
                                                <span>{editOptions.children} ילדים × ₪{Math.round((editOptions.cancellable ? editingItem.price + 55 : editingItem.price) * 0.7)}</span>
                                                <span>₪{Math.round((editOptions.cancellable ? editingItem.price + 55 : editingItem.price) * 0.7 * editOptions.children)}</span>
                                            </div>
                                        )}
                                        {editOptions.trolley && (
                                            <div className="price-summary-row">
                                                <span>טרולי (הלוך ושוב)</span>
                                                <span>₪102</span>
                                            </div>
                                        )}
                                        {editOptions.suitcase && (
                                            <div className="price-summary-row">
                                                <span>מזוודה (הלוך ושוב)</span>
                                                <span>₪224</span>
                                            </div>
                                        )}
                                        {editOptions.transfer && (
                                            <div className="price-summary-row">
                                                <span>הסעות × {editOptions.adults + editOptions.children} נוסעים</span>
                                                <span>₪{57 * (editOptions.adults + editOptions.children)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="price-summary-divider"></div>
                                    <div className="price-summary-total">
                                        <span>סה״כ לתשלום</span>
                                        <span className="price-summary-total-amount">₪{calcBookingTotal(editingItem, editOptions)}</span>
                                    </div>
                                    <button className="btn-confirm-booking" onClick={saveEdit}>
                                        שמור שינויים
                                    </button>
                                    <p className="booking-note">השינויים יתעדכנו בסל שלך</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;