import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, Hotel, PlaneTakeoff, Sparkles, BadgeDollarSign, Star } from 'lucide-react';
import './DealDetails.css';

import useDestinationInfo from './useDestinationInfo';
import { Info } from 'lucide-react';
import { allDealsData } from '../data/allDealsData';

const getUserKey = () => {
    const name = localStorage.getItem('userName');
    return name ? name.replace(/\s/g, '_') : 'guest';
};

const DealDetails = () => {
    const { destination } = useParams();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareSelection, setCompareSelection] = useState([]);
    const [sortPackagesBy, setSortPackagesBy] = useState('price');

    const [favorites, setFavorites] = useState(() => {
        const name = localStorage.getItem('userName');
        if (!name) return [];
        const userKey = name.replace(/\s/g, '_');
        const saved = localStorage.getItem(`favorites_${userKey}`);
        return saved ? JSON.parse(saved) : [];
    });

    const [cart, setCart] = useState(() => {
        const name = localStorage.getItem('userName');
        if (!name) return [];
        const userKey = name.replace(/\s/g, '_');
        const saved = localStorage.getItem(`cart_${userKey}`);
        return saved ? JSON.parse(saved) : [];
    });

    const allDeals = allDealsData;

    const destinationAttractionsMap = {
        'פריז, צרפת': ['מגדל אייפל', 'לובר', 'שאנז אליזה'],
        'רומא, איטליה': ['קולוסיאום', 'ותיקן', 'פונטנה די טרווי'],
        'ברצלונה, ספרד': ['סגרדה פמיליה', 'פארק גואל', 'לה רמבלה'],
        'אמסטרדם, הולנד': ['בית אנה פרנק', 'מוזיאון ואן גוך', 'שייט בתעלות'],
        'לונדון, אנגליה': ['ביג בן', 'ארמון בקינגהאם', 'לונדון איי'],
        'דובאי, איחוד האמירויות': ['בורג׳ חליפה', 'דובאי מול', 'ספארי במדבר'],
        'באלי, אינדונזיה': ['אובוד', 'מקדש טנה לוט', 'חוף קוטה'],
        'טוקיו, יפן': ['שיבויה', 'מקדש סנסו-ג׳י', 'טוקיו טאוור'],
        'ניו יורק, ארה"ב': ['טיימס סקוור', 'סנטרל פארק', 'פסל החירות'],
        'מיאמי, ארה"ב': ['סאות׳ ביץ׳', 'ליטל הוואנה', 'וינווד וולס'],
        'קנקון, מקסיקו': ['צ׳יצ׳ן איצה', 'איסלה מוחרס', 'טולום'],
        'סנטוריני, יוון': ['אויה', 'פירה', 'חופי סנטוריני'],
        'פראג, צ\'כיה': ['גשר קארל', 'טירת פראג', 'העיר העתיקה'],
        'בנגקוק, תאילנד': ['הארמון המלכותי', 'ואט פו', 'שווקים צפים'],
        'מלדיביים': ['שנירקול', 'שייט שקיעה', 'ספא על המים'],
        'פורטוגל - ליסבון': ['מגדל בלם', 'אלפמה', 'חשמלית 28'],
        'איסטנבול, טורקיה': ['איה סופיה', 'המסגד הכחול', 'הבזאר הגדול'],
        'ברלין, גרמניה': ['שער ברנדנבורג', 'חומת ברלין', 'אי המוזיאונים']
    };

    const allDealsWithAttractions = allDeals.map((deal) => {
        const existingAttractions = Array.isArray(deal.attractions)
            ? deal.attractions.filter(Boolean)
            : [];

        const fallbackAttractions = destinationAttractionsMap[deal.destination] || ['מרכז העיר', 'סיור מודרך'];
        const mergedAttractions = [...new Set([...existingAttractions, ...fallbackAttractions])];
        const safeAttractions = mergedAttractions.slice(0, 3);

        return {
            ...deal,
            attractions: safeAttractions.length >= 2
                ? safeAttractions
                : [...safeAttractions, 'אטרקציה מומלצת נוספת'].slice(0, 2)
        };
    });

    // Filter deals for current destination
    const destinationDeals = allDealsWithAttractions.filter(deal => 
        deal.destination === decodeURIComponent(destination)
    );

    // Sort packages
    const sortedPackages = [...destinationDeals].sort((a, b) => {
        switch (sortPackagesBy) {
            case 'price': return a.price - b.price;
            case 'rating': return b.rating - a.rating;
            case 'discount': return b.discount - a.discount;
            case 'date': return new Date(a.dates) - new Date(b.dates);
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
        const deal = allDealsWithAttractions.find(d => d.id === dealId);
        if (!deal) return;
        
        let updated;
        if (favorites.some(fav => fav.id === dealId)) {
            updated = favorites.filter(fav => fav.id !== dealId);
        } else {
            updated = [...favorites, { ...deal, type: 'deal' }];
        }
        setFavorites(updated);
        localStorage.setItem(`favorites_${userKey}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('userDataUpdated'));
    };

    const addToCart = (deal, e) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            alert('כדי להוסיף לעגלה יש להתחבר תחילה');
            navigate('/login');
            return;
        }
        const userKey = getUserKey();
        const existing = cart.find(item => item.id === deal.id && item.type === 'deal');
        if (existing) {
            alert(`חבילה זו כבר נמצאת בעגלה שלך!`);
            return;
        }
        const updated = [...cart, { ...deal, type: 'deal', addedAt: new Date().toISOString() }];
        setCart(updated);
        localStorage.setItem(`cart_${userKey}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('userDataUpdated'));
        alert(`החבילה נוספה לעגלה! 🛒`);
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

    const handleCompareToggle = (dealId) => {
        if (compareSelection.includes(dealId)) {
            setCompareSelection(compareSelection.filter(id => id !== dealId));
        } else if (compareSelection.length < 3) {
            setCompareSelection([...compareSelection, dealId]);
        } else {
            alert('ניתן להשוות עד 3 חבילות בו זמנית');
        }
    };

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
    // מידע חשוב על היעד
    const destinationInfo = useDestinationInfo(mainDeal.destination);
    const [showInfoModal, setShowInfoModal] = useState(false);

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
                    {sortedPackages.map((deal) => (
                        <div key={deal.id} className={`package-card ${compareSelection.includes(deal.id) ? 'selected-for-compare' : ''}`}>
                            {compareMode && (
                                <div className="compare-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={compareSelection.includes(deal.id)}
                                        onChange={() => handleCompareToggle(deal.id)}
                                    />
                                </div>
                            )}
                            
                            <div className="package-badge">
                                <span className="discount-badge">-{deal.discount}%</span>
                                {deal.rating >= 4.8 && <span className="best-seller">מבוקש ביותר</span>}
                                {deal.isKosherFriendly && <span className="kosher-package-badge">מותאם לשומרי כשרות</span>}
                            </div>

                            <button
                                className={`favorite-heart ${favorites.some(fav => fav.id === deal.id) ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(deal.id); }}
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
                                    <span className="dates-text">{deal.dates}</span>
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
                                        onClick={(e) => addToCart(deal, e)}
                                    >
                                        הזמן עכשיו
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
                                <p className="deal-modal-dates">{selectedPackage.dates}</p>
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
                                            addToCart(selectedPackage, e);
                                            setSelectedPackage(null);
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

            {/* Comparison Modal */}
            {selectedPackage === 'compare' && compareSelection.length > 0 && (
                <div className="deal-modal-overlay" onClick={() => setSelectedPackage(null)}>
                    <div className="deal-modal-content deal-comparison-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="deal-close-btn" onClick={() => setSelectedPackage(null)}>✕</button>
                        <h2 className="comparison-title">השוואת חבילות - {mainDeal.destination}</h2>
                        
                        <div className="comparison-grid">
                            {compareSelection.map(dealId => {
                                const deal = destinationDeals.find(d => d.id === dealId);
                                if (!deal) return null;
                                
                                return (
                                    <div key={deal.id} className="comparison-column">
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
                                                addToCart(deal, e);
                                                setSelectedPackage(null);
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
