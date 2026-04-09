import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Hotel, PlaneTakeoff, Sparkles, BadgeDollarSign, Star } from 'lucide-react';
import './DealDetails.css';

import useDestinationInfo from './useDestinationInfo';
import { Info } from 'lucide-react';
const getUserKey = () => {
    const name = localStorage.getItem('userName');
    return name ? name.replace(/\s/g, '_') : 'guest';
};

const getDealId = (deal) => deal?._id || deal?.id;

const DealDetails = () => {
    const { destination } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [allDeals, setAllDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareSelection, setCompareSelection] = useState([]);
    const [sortPackagesBy, setSortPackagesBy] = useState('price');
    const [bookingDeal, setBookingDeal] = useState(null);
    const [bookingOptions, setBookingOptions] = useState({
        adults: 2,
        children: 0,
        trolley: false,
        suitcase: false,
        transfer: false,
        cancellable: false,
    });
    const [selectedDates, setSelectedDates] = useState({});

    const getSelectedDate = (deal) => {
        const id = getDealId(deal);
        if (selectedDates[id]) return selectedDates[id];
        return Array.isArray(deal.dates) ? deal.dates[0] : deal.dates;
    };

    const [favorites, setFavorites] = useState(() => {
        const name = localStorage.getItem('userName');
        if (!name) return [];
        const userKey = name.replace(/\s/g, '_');
        const saved = localStorage.getItem(`favorites_${userKey}`);
        return saved ? JSON.parse(saved) : [];
    });

    const destinationInfo = useDestinationInfo(decodeURIComponent(destination));
    const [showInfoModal, setShowInfoModal] = useState(false);

    const [cart, setCart] = useState(() => {
        const name = localStorage.getItem('userName');
        if (!name) return [];
        const userKey = name.replace(/\s/g, '_');
        const saved = localStorage.getItem(`cart_${userKey}`);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/deals`);
                if (!response.ok) throw new Error('Failed to fetch deals');
                const data = await response.json();
                setAllDeals(data);
            } catch (error) {
                console.error('Error fetching deals:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDeals();
    }, [API_BASE_URL]);

    const allDealsWithAttractions = allDeals.map((deal) => {
        const existingAttractions = Array.isArray(deal.attractions)
            ? deal.attractions.filter(Boolean)
            : [];
        return {
            ...deal,
            attractions: existingAttractions.length >= 2
                ? existingAttractions
                : [...existingAttractions, 'אטרקציה מומלצת נוספת'].slice(0, 2)
        };
    });

    // Filter deals for current destination
    const destinationDeals = allDealsWithAttractions.filter(deal =>
        deal.destination === decodeURIComponent(destination)
    );

    // Apply filters from query params (passed from Deals page)
    const kosherFilter = searchParams.get('kosher') === 'true';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const filteredDestinationDeals = destinationDeals.filter(deal => {
        if (kosherFilter && !deal.isKosherFriendly) return false;
        if (startDateParam && endDateParam) {
            const startDate = new Date(startDateParam);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(endDateParam);
            endDate.setHours(23, 59, 59, 999);
            const dates = Array.isArray(deal.dates) ? deal.dates : [deal.dates];
            const hasMatchingDate = dates.some(dateText => {
                if (!dateText) return false;
                const match = dateText.match(/(\d{1,2})\s*-\s*\d{1,2}\s+([^\s]+)\s+(\d{4})/);
                if (!match) return false;
                const hebrewMonths = { ינואר:0,פברואר:1,מרץ:2,אפריל:3,מאי:4,יוני:5,יולי:6,אוגוסט:7,ספטמבר:8,אוקטובר:9,נובמבר:10,דצמבר:11 };
                const dealDate = new Date(Number(match[3]), hebrewMonths[match[2]], Number(match[1]));
                return dealDate >= startDate && dealDate <= endDate;
            });
            if (!hasMatchingDate) return false;
        }
        return true;
    });

    // Sort packages
    const sortedPackages = [...filteredDestinationDeals].sort((a, b) => {
        switch (sortPackagesBy) {
            case 'price': return a.price - b.price;
            case 'rating': return b.rating - a.rating;
            case 'discount': return b.discount - a.discount;
            case 'date': return new Date(Array.isArray(a.dates) ? a.dates[0] : a.dates) - new Date(Array.isArray(b.dates) ? b.dates[0] : b.dates);
            default: return 0;
        }
    });

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            const userKey = getUserKey();
            const savedFavs = JSON.parse(localStorage.getItem(`favorites_${userKey}`) || '[]');
            const savedCart = JSON.parse(localStorage.getItem(`cart_${userKey}`) || '[]');
            setFavorites(savedFavs);
            setCart(savedCart);
        }
    }, []);

    const toggleFavorite = (dealId) => {
        if (!isLoggedIn) {
            alert('כדי להוסיף למועדפים יש להתחבר תחילה');
            navigate('/login');
            return;
        }
        const userKey = getUserKey();
        const deal = allDealsWithAttractions.find(d => d._id === dealId || d.id === dealId);
        if (!deal) return;

        let updated;
        if (favorites.some(fav => fav._id === dealId || fav.id === dealId)) {
            updated = favorites.filter(fav => fav._id !== dealId && fav.id !== dealId);
        } else {
            updated = [...favorites, { ...deal, type: 'deal' }];
        }
        setFavorites(updated);
        localStorage.setItem(`favorites_${userKey}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('userDataUpdated'));
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="star full">★</span>);
        }
        if (hasHalfStar) {
            stars.push(<span key="half" className="star half">★</span>);
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
        }
        return stars;
    };

    const openBookingModal = (deal, e) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            alert('כדי להזמין יש להתחבר תחילה');
            navigate('/login');
            return;
        }
        setBookingOptions({ adults: 2, children: 0, trolley: false, suitcase: false, transfer: false, cancellable: false });
        setBookingDeal(deal);
    };

    const calculateTotal = () => {
        if (!bookingDeal) return 0;
        const basePrice = bookingOptions.cancellable ? bookingDeal.price + 55 : bookingDeal.price;
        const childPrice = Math.round(basePrice * 0.7);
        let total = basePrice * bookingOptions.adults;
        total += childPrice * bookingOptions.children;
        if (bookingOptions.trolley) total += 102;
        if (bookingOptions.suitcase) total += 224;
        if (bookingOptions.transfer) total += 57 * (bookingOptions.adults + bookingOptions.children);
        return total;
    };

    const confirmBooking = (e) => {
        e.stopPropagation();
        const userKey = getUserKey();
        const dealId = bookingDeal._id || bookingDeal.id;
        const existing = cart.find(item => (item._id === dealId || item.id === dealId) && item.type === 'deal');
        if (existing) {
            alert('חבילה זו כבר נמצאת בעגלה שלך!');
            return;
        }
        const totalPrice = calculateTotal();
        const updated = [...cart, {
            ...bookingDeal,
            dates: getSelectedDate(bookingDeal),
            type: 'deal',
            addedAt: new Date().toISOString(),
            bookingOptions: { ...bookingOptions },
            totalPrice,
        }];
        setCart(updated);
        localStorage.setItem(`cart_${userKey}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('userDataUpdated'));
        setBookingDeal(null);
        alert('החבילה נוספה לעגלה! 🛒');
    };

    const handleCompareToggle = (dealId) => {
        if (compareSelection.includes(dealId)) {
            setCompareSelection(compareSelection.filter(id => id !== dealId));
        } else if (compareSelection.length < 3) {
            setCompareSelection([...compareSelection, dealId]);
        } else {
            alert('ניתן להשוות עד 3 חבילות בו זמנית');
        }
    };

    if (isLoading) {
        return <div className="deal-details-page" style={{ textAlign: 'center', padding: '80px' }}>טוען חבילות...</div>;
    }

    if (destinationDeals.length === 0) {
        return (
            <div className="deal-details-page">
                <div className="no-destination">
                    <h2>יעד לא נמצא</h2>
                    <button onClick={() => navigate('/deals')} className="btn-back">
                        חזרה לדילים
                    </button>
                </div>
            </div>
        );
    }


    const mainDeal = destinationDeals[0];

    return (
        <div className="deal-details-page">
            {/* Hero Section with Destination Background */}

            <section className="destination-hero" style={{ backgroundImage: `url(${mainDeal.image})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content-details">
                    <button onClick={() => navigate('/deals')} className="btn-back-floating">
                        ← חזרה לדילים
                    </button>
                    <div className="destination-title-row">
                        <h1 className="destination-title">{mainDeal.destination}</h1>
                        {destinationInfo && (
                            <button
                                className="destination-info-btn"
                                title="מידע חשוב על היעד"
                                onClick={() => setShowInfoModal(true)}
                            >
                                <Info size={26} color="#1e90ff" style={{ verticalAlign: 'middle' }} />
                            </button>
                        )}
                    </div>
                    <p className="destination-subtitle">{destinationDeals.length} חבילות נופש זמינות</p>
                    <div className="destination-meta">
                        <span className="meta-item">
                            <PlaneTakeoff size={16} className="meta-icon" />
                            זמן טיסה: {mainDeal.flightTime}
                        </span>
                        <span className="meta-item">
                            <BadgeDollarSign size={16} className="meta-icon money" />
                            החל מ-₪{Math.min(...destinationDeals.map(d => d.price))}
                        </span>
                        <span className="meta-item">
                            <Star size={16} className="meta-icon star" />
                            דירוג ממוצע: {(destinationDeals.reduce((sum, d) => sum + d.rating, 0) / destinationDeals.length).toFixed(1)}
                        </span>
                    </div>
                </div>
            </section>

            {/* מודאל מידע חשוב על היעד */}
            {showInfoModal && destinationInfo && (
                <div className="deal-modal-overlay" onClick={() => setShowInfoModal(false)}>
                    <div className="deal-modal-content destination-info-modal" onClick={e => e.stopPropagation()}>
                        <button className="deal-close-btn" onClick={() => setShowInfoModal(false)}>✕</button>
                        <div className="destination-info-header">
                            <Info size={32} color="#1e90ff" style={{ marginLeft: 8 }} />
                            <h2> דברים שחשוב לדעת לפני שטסים ל{destinationInfo.destination}</h2>
                        </div>
                        <ul className="destination-info-list">
                            {destinationInfo.info.map((item, idx) => (
                                <li key={idx} className="destination-info-item">{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Filters & Controls */}
            <section className="details-filter-section">
                <div className="filter-container">
                    <div className="filter-row details-filter-row">
                        <div className="filter-group">
                            <label>מיון לפי</label>
                            <select
                                className="filter-select"
                                value={sortPackagesBy}
                                onChange={(e) => setSortPackagesBy(e.target.value)}
                            >
                            <option value="price">מחיר נמוך לגבוה</option>
                            <option value="rating">דירוג גבוה ביותר</option>
                            <option value="discount">הנחה הכי גדולה</option>
                            <option value="date">תאריכים</option>
                        </select>
                        </div>

                        <div className="filter-group details-filter-action">
                            <label>השוואת חבילות</label>
                            <button
                                className={`btn-compare ${compareMode ? 'active' : ''}`}
                                onClick={() => setCompareMode(!compareMode)}
                            >
                                {compareMode ? '✓ מצב השוואה פעיל' : 'השווה חבילות'}
                                {compareSelection.length > 0 && ` (${compareSelection.length})`}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Compare Bar */}
            {compareMode && compareSelection.length > 0 && (
                <div className="compare-bar">
                    <div className="compare-content">
                        <span>נבחרו {compareSelection.length} חבילות להשוואה</span>
                        <div className="compare-actions">
                            <button 
                                className="btn-view-comparison"
                                onClick={() => setSelectedPackage('compare')}
                            >
                                צפה בהשוואה
                            </button>
                            <button 
                                className="btn-clear-comparison"
                                onClick={() => setCompareSelection([])}
                            >
                                נקה
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Packages Grid */}
            <section className="packages-section">
                <div className="packages-grid">
                    {sortedPackages.map((deal) => {
                        const dealId = getDealId(deal);
                        return (
                        <div key={dealId} className={`package-card ${compareSelection.includes(dealId) ? 'selected-for-compare' : ''}`}>
                            {compareMode && (
                                <div className="compare-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={compareSelection.includes(dealId)}
                                        onChange={() => handleCompareToggle(dealId)}
                                    />
                                </div>
                            )}
                            
                            <div className="package-badge">
                                <span className="discount-badge">-{deal.discount}%</span>
                                {deal.rating >= 4.8 && <span className="best-seller">מבוקש ביותר</span>}
                                {deal.isKosherFriendly && <span className="kosher-package-badge">מותאם לשומרי כשרות</span>}
                            </div>

                            <button
                                className={`favorite-heart ${favorites.some(fav => fav._id === dealId || fav.id === dealId) ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(dealId); }}
                            >
                                <svg viewBox="0 0 24 24" className="heart-icon">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>

                            <div className="package-header">
                                <div className="dates-prominent">
                                    <span className="calendar-icon" aria-hidden="true">
                                        <CalendarDays size={20} />
                                    </span>
                                    {Array.isArray(deal.dates) && deal.dates.length > 1 ? (
                                        <select
                                            className="dates-select"
                                            value={getSelectedDate(deal)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setSelectedDates(prev => ({ ...prev, [getDealId(deal)]: e.target.value }));
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {deal.dates.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="dates-text">{getSelectedDate(deal)}</span>
                                    )}
                                </div>
                                <div className="package-rating">
                                    <div className="stars">{renderStars(deal.rating)}</div>
                                    <span className="rating-num">{deal.rating}</span>
                                    <span className="reviews-count">({deal.reviewsCount})</span>
                                </div>
                            </div>

                            <div className="package-details-grid">
                                <div className="detail-item">
                                    <span className="detail-icon" aria-hidden="true">
                                        <PlaneTakeoff size={20} />
                                    </span>
                                    <div className="detail-text">
                                        <strong>{deal.airline}</strong>
                                        <span>{deal.flightDetails?.departure || 'N/A'} - {deal.flightDetails?.arrival || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-icon" aria-hidden="true">
                                        <Hotel size={20} />
                                    </span>
                                    <div className="detail-text">
                                        <strong>{deal.hotelName || deal.hotel}</strong>
                                        <span>{deal.hotel}</span>
                                    </div>
                                </div>

                                <div className="detail-item full-width">
                                    <span className="detail-icon" aria-hidden="true">
                                        <Sparkles size={20} />
                                    </span>
                                    <div className="detail-text">
                                        <strong>אטרקציות מומלצות:</strong>
                                        <span>{deal.attractions?.join(', ') || 'מגוון אטרקציות'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="package-included">
                                <h4>מה כלול בחבילה:</h4>
                                <ul className="included-compact">
                                    {deal.included.map((item, idx) => (
                                        <li key={idx}>✓ {item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="package-footer">
                                <div className="price-display">
                                    <span className="original-price-small">₪{deal.originalPrice}</span>
                                    <span className="current-price-large">₪{deal.price}</span>
                                    <span className="price-per">למבוגר</span>
                                </div>
                                <div className="package-actions">
                                    <button 
                                        className="btn-details"
                                        onClick={() => setSelectedPackage(deal)}
                                    >
                                        פרטים מלאים
                                    </button>
                                    <button
                                        className="btn-book-now"
                                        onClick={(e) => openBookingModal(deal, e)}
                                    >
                                        הזמן עכשיו
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                    })}
                </div>
            </section>

            {/* Modal for Full Package Details */}
            {selectedPackage && selectedPackage !== 'compare' && (
                <div className="deal-modal-overlay" onClick={() => setSelectedPackage(null)}>
                    <div className="deal-modal-content deal-full-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="deal-close-btn" onClick={() => setSelectedPackage(null)}>✕</button>
                        <div className="deal-modal-hero">
                            <img src={selectedPackage.image} alt={selectedPackage.destination} className="deal-modal-hero-image" />
                            <div className="deal-modal-header deal-modal-header-overlay">
                                <h2>{selectedPackage.destination}</h2>
                                <p className="deal-modal-dates">{getSelectedDate(selectedPackage)}</p>
                            </div>
                        </div>
                        <div className="deal-modal-body">
                            <div className="deal-modal-details">
                                <div className="detail-section">
                                    <h3>פרטי טיסה</h3>
                                    <p><strong>חברת תעופה:</strong> {selectedPackage.airline}</p>
                                    <p><strong>זמן טיסה:</strong> {selectedPackage.flightTime}</p>
                                    <p><strong>יציאה:</strong> {selectedPackage.flightDetails?.departure || 'N/A'}</p>
                                    <p><strong>נחיתה:</strong> {selectedPackage.flightDetails?.arrival || 'N/A'}</p>
                                    <p><strong>מחלקה:</strong> {selectedPackage.flightDetails?.class || 'תיירים'}</p>
                                </div>

                                <div className="detail-section">
                                    <h3>פרטי מלון</h3>
                                    <p><strong>מלון:</strong> {selectedPackage.hotelName || selectedPackage.hotel}</p>
                                    <p><strong>סוג:</strong> {selectedPackage.hotel}</p>
                                    <p><strong>דירוג:</strong> {selectedPackage.rating} ⭐ ({selectedPackage.reviewsCount} ביקורות)</p>
                                </div>

                                <div className="detail-section">
                                    <h3>מה כלול</h3>
                                    <ul>
                                        {selectedPackage.included.map((item, idx) => (
                                            <li key={idx}>✓ {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {selectedPackage.attractions && (
                                    <div className="detail-section">
                                        <h3>אטרקציות מומלצות</h3>
                                        <ul>
                                            {selectedPackage.attractions.map((attr, idx) => (
                                                <li key={idx} className="attraction-list-item">
                                                    <Sparkles size={16} className="attraction-list-icon" />
                                                    {attr}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="deal-modal-price-section">
                                    <div className="price-breakdown">
                                        <p className="original-price-line">מחיר מקורי: <span>₪{selectedPackage.originalPrice}</span></p>
                                        <p className="discount-line">הנחה: <span className="discount-amount">-{selectedPackage.discount}%</span></p>
                                        <p className="final-price-line">מחיר סופי: <span className="final-price">₪{selectedPackage.price}</span></p>
                                    </div>
                                    <button
                                        className="deal-btn-modal-book"
                                        onClick={(e) => {
                                            setSelectedPackage(null);
                                            openBookingModal(selectedPackage, e);
                                        }}
                                    >
                                        הזמן את החבילה הזו
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Options Modal */}
            {bookingDeal && (
                <div className="deal-modal-overlay" onClick={() => setBookingDeal(null)}>
                    <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="deal-close-btn booking-close-btn" onClick={() => setBookingDeal(null)}>✕</button>

                        {/* Header */}
                        <div className="booking-modal-header">
                            <div className="booking-header-row">
                                <div className="booking-destination-info">
                                    <h2 className="booking-destination">{bookingDeal.destination}</h2>
                                    <div className="booking-header-chips">
                                        <span className="booking-header-chip">
                                            <PlaneTakeoff size={13} /> {bookingDeal.airline}
                                        </span>
                                        <span className="booking-header-chip">
                                            <Hotel size={13} /> {bookingDeal.hotelName || bookingDeal.hotel}
                                        </span>
                                        <span className="booking-header-chip">
                                            <CalendarDays size={13} /> {getSelectedDate(bookingDeal)}
                                        </span>
                                    </div>
                                </div>
                                <div className="booking-header-price">
                                    <span className="booking-header-price-label">החל מ</span>
                                    <span className="booking-header-price-value">₪{bookingDeal.price}</span>
                                    <span className="booking-header-price-per">למבוגר</span>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="booking-modal-body">

                            {/* Options Column */}
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
                                            <button className="counter-btn" onClick={() => setBookingOptions(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))} disabled={bookingOptions.adults <= 1}>−</button>
                                            <span className="counter-value">{bookingOptions.adults}</span>
                                            <button className="counter-btn" onClick={() => setBookingOptions(p => ({ ...p, adults: Math.min(9, p.adults + 1) }))} disabled={bookingOptions.adults >= 9}>+</button>
                                        </div>
                                    </div>
                                    <div className="passenger-row">
                                        <div className="passenger-info">
                                            <span className="passenger-label">ילדים</span>
                                            <span className="passenger-desc">גיל 2–11</span>
                                        </div>
                                        <div className="passenger-counter">
                                            <button className="counter-btn" onClick={() => setBookingOptions(p => ({ ...p, children: Math.max(0, p.children - 1) }))} disabled={bookingOptions.children <= 0}>−</button>
                                            <span className="counter-value">{bookingOptions.children}</span>
                                            <button className="counter-btn" onClick={() => setBookingOptions(p => ({ ...p, children: Math.min(6, p.children + 1) }))} disabled={bookingOptions.children >= 6}>+</button>
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
                                            <input type="checkbox" checked={bookingOptions.trolley} onChange={(e) => setBookingOptions(p => ({ ...p, trolley: e.target.checked }))} />
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
                                            <input type="checkbox" checked={bookingOptions.suitcase} onChange={(e) => setBookingOptions(p => ({ ...p, suitcase: e.target.checked }))} />
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
                                            <input type="checkbox" checked={bookingOptions.transfer} onChange={(e) => setBookingOptions(p => ({ ...p, transfer: e.target.checked }))} />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                {/* Cancellation Policy */}
                                <div className="booking-section">
                                    <h3 className="booking-section-title">תנאי החבילה</h3>
                                    <label className="cancellation-option-row">
                                        <input type="radio" name="cancellation" checked={!bookingOptions.cancellable} onChange={() => setBookingOptions(p => ({ ...p, cancellable: false }))} />
                                        <div className="cancellation-option-info">
                                            <span className="cancellation-option-name">ללא אפשרות ביטול</span>
                                            <span className="cancellation-option-price">₪{bookingDeal.price} למבוגר</span>
                                        </div>
                                    </label>
                                    <label className="cancellation-option-row">
                                        <input type="radio" name="cancellation" checked={bookingOptions.cancellable} onChange={() => setBookingOptions(p => ({ ...p, cancellable: true }))} />
                                        <div className="cancellation-option-info">
                                            <span className="cancellation-option-name">ביטול חינם עד 30 יום לפני הנסיעה</span>
                                            <span className="cancellation-option-price cancellation-free">₪{bookingDeal.price + 55} למבוגר</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Price Summary Column */}
                            <div className="booking-summary-col">
                                <div className="price-summary-card">
                                    <h3 className="price-summary-title">סיכום מחיר</h3>

                                    <div className="price-summary-rows">
                                        <div className="price-summary-row">
                                            <span>{bookingOptions.adults} מבוגרים × ₪{bookingOptions.cancellable ? bookingDeal.price + 55 : bookingDeal.price}</span>
                                            <span>₪{(bookingOptions.cancellable ? bookingDeal.price + 55 : bookingDeal.price) * bookingOptions.adults}</span>
                                        </div>
                                        {bookingOptions.children > 0 && (
                                            <div className="price-summary-row">
                                                <span>{bookingOptions.children} ילדים × ₪{Math.round((bookingOptions.cancellable ? bookingDeal.price + 55 : bookingDeal.price) * 0.7)}</span>
                                                <span>₪{Math.round((bookingOptions.cancellable ? bookingDeal.price + 55 : bookingDeal.price) * 0.7 * bookingOptions.children)}</span>
                                            </div>
                                        )}
                                        {bookingOptions.trolley && (
                                            <div className="price-summary-row">
                                                <span>טרולי (הלוך ושוב)</span>
                                                <span>₪102</span>
                                            </div>
                                        )}
                                        {bookingOptions.suitcase && (
                                            <div className="price-summary-row">
                                                <span>מזוודה (הלוך ושוב)</span>
                                                <span>₪224</span>
                                            </div>
                                        )}
                                        {bookingOptions.transfer && (
                                            <div className="price-summary-row">
                                                <span>הסעות × {bookingOptions.adults + bookingOptions.children} נוסעים</span>
                                                <span>₪{57 * (bookingOptions.adults + bookingOptions.children)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="price-summary-divider"></div>

                                    <div className="price-summary-total">
                                        <span>סה״כ לתשלום</span>
                                        <span className="price-summary-total-amount">₪{calculateTotal()}</span>
                                    </div>

                                    <button className="btn-confirm-booking" onClick={confirmBooking}>
                                        הוסף לסל
                                    </button>

                                    <p className="booking-note">לאחר ההוספה תוכלו לעיין ולערוך בעמוד הסל</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison Modal */}
            {selectedPackage === 'compare' && compareSelection.length > 0 && (
                <div className="deal-modal-overlay" onClick={() => setSelectedPackage(null)}>
                    <div className="deal-modal-content deal-comparison-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="deal-close-btn" onClick={() => setSelectedPackage(null)}>✕</button>
                        <h2 className="comparison-title">השוואת חבילות - {mainDeal.destination}</h2>
                        
                        <div className="comparison-grid">
                            {compareSelection.map(dealId => {
                                const deal = destinationDeals.find(d => getDealId(d) === dealId);
                                if (!deal) return null;
                                
                                return (
                                    <div key={getDealId(deal)} className="comparison-column">
                                        <div className="comparison-header">
                                            <h3>{deal.dates}</h3>
                                            <span className="comparison-price">₪{deal.price}</span>
                                            <span className="comparison-discount">-{deal.discount}%</span>
                                        </div>
                                        
                                        <div className="comparison-body">
                                            <div className="comparison-row">
                                                <strong>דירוג:</strong>
                                                <span>{deal.rating} ⭐</span>
                                            </div>
                                            <div className="comparison-row">
                                                <strong>חברת תעופה:</strong>
                                                <span>{deal.airline}</span>
                                            </div>
                                            <div className="comparison-row">
                                                <strong>שעות טיסה:</strong>
                                                <span>{deal.flightDetails?.departure} - {deal.flightDetails?.arrival}</span>
                                            </div>
                                            <div className="comparison-row">
                                                <strong>מלון:</strong>
                                                <span>{deal.hotelName || deal.hotel}</span>
                                            </div>
                                            <div className="comparison-row includes-row">
                                                <strong>כולל:</strong>
                                                <ul className="comparison-list">
                                                    {deal.included.map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="comparison-row">
                                                <strong>חיסכון:</strong>
                                                <span className="savings">₪{deal.originalPrice - deal.price}</span>
                                            </div>
                                        </div>
                                        
                                        <button
                                            className="btn-select-package"
                                            onClick={(e) => {
                                                setSelectedPackage(null);
                                                openBookingModal(deal, e);
                                            }}
                                        >
                                            בחר חבילה זו
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealDetails;
