import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import { CalendarDays, X, Search } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './Deals.css';
import { VIBE_DESTINATIONS, VIBE_LABELS } from './fuzzySearch';

// Helper: get user-specific localStorage key
const getUserKey = () => {
    const name = localStorage.getItem('userName');
    return name ? name.replace(/\s/g, '_') : 'guest';
};

const HEBREW_MONTH_MAP = {
    ינואר: 0,
    פברואר: 1,
    מרץ: 2,
    אפריל: 3,
    מאי: 4,
    יוני: 5,
    יולי: 6,
    אוגוסט: 7,
    ספטמבר: 8,
    אוקטובר: 9,
    נובמבר: 10,
    דצמבר: 11,
};

const parseDealStartDate = (dateText) => {
    if (!dateText) return null;
    const match = dateText.match(/(\d{1,2})\s*-\s*\d{1,2}\s+([^\s]+)\s+(\d{4})/);
    if (!match) return null;

    const day = Number(match[1]);
    const month = HEBREW_MONTH_MAP[match[2]];
    const year = Number(match[3]);
    if (Number.isNaN(day) || Number.isNaN(year) || month === undefined) return null;

    return new Date(year, month, day);
};

const Deals = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
    
    // --- הוספת State לניהול הנתונים מה-DB ---
    const [deals, setDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [destinationKeyword, setDestinationKeyword] = useState('');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isDateRangeActive, setIsDateRangeActive] = useState(false);
    const [dateRangeSelection, setDateRangeSelection] = useState([
        {
            startDate: new Date(),
            endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
            key: 'selection',
        },
    ]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [sortBy, setSortBy] = useState('price-low');
    const [isKosherOnly, setIsKosherOnly] = useState(false);
    const [vibeFilter, setVibeFilter] = useState(null); // 'beach' | 'adventure' | 'cheap' | 'romantic' | 'city'
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const datePickerRef = useRef(null);

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

    const isKosherDeal = (deal) => Boolean(deal?.isKosherFriendly);


    // --- משיכת הדילים מהשרת (MongoDB) ---
    useEffect(() => {
        const fetchDeals = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/deals`);
                if (!response.ok) throw new Error('Failed to fetch deals');
                const data = await response.json();
                setDeals(data);
            } catch (error) {
                console.error("Error fetching deals:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDeals();
    }, [API_BASE_URL]);

    // Sync login state on mount and reload favorites/cart per user
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

    useEffect(() => {
        filterDeals();
    }, [destinationKeyword, priceRange, sortBy, dateRangeSelection, isDateRangeActive, deals, isKosherOnly, vibeFilter]);

    useEffect(() => {
        const destinationFromQuery = (searchParams.get('destination') || '').trim();
        const startDateQuery = searchParams.get('startDate');
        const endDateQuery = searchParams.get('endDate');
        const kosherQuery = searchParams.get('kosher');

        if (destinationFromQuery) {
            setDestinationKeyword(destinationFromQuery);
        }

        if (startDateQuery && endDateQuery) {
            const start = new Date(startDateQuery);
            const end = new Date(endDateQuery);

            if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
                setDateRangeSelection([
                    {
                        startDate: start,
                        endDate: end,
                        key: 'selection',
                    },
                ]);
                setIsDateRangeActive(true);
            }
        }

        if (kosherQuery === 'true') {
            setIsKosherOnly(true);
        }

        const vibeQuery = searchParams.get('vibe');
        if (vibeQuery) {
            setVibeFilter(vibeQuery);
            if (vibeQuery === 'cheap') setSortBy('price-low');
        }
    }, [searchParams]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsDatePickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleFavorite = (dealId) => {
        if (!isLoggedIn) {
            alert('כדי להוסיף למועדפים יש להתחבר תחילה');
            navigate('/login');
            return;
        }
        const userKey = getUserKey();
        const deal = deals.find(d => d._id === dealId || d.id === dealId);
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

    const addToCart = (deal, e) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            alert('כדי להוסיף לעגלה יש להתחבר תחילה');
            navigate('/login');
            return;
        }
        const userKey = getUserKey();
        const dealId = deal._id || deal.id;
        const existing = cart.find(item => (item._id === dealId || item.id === dealId) && item.type === 'deal');
        if (existing) {
            alert(`${deal.destination} כבר נמצא בעגלה שלך!`);
            return;
        }
        const updated = [...cart, { ...deal, type: 'deal', addedAt: new Date().toISOString() }];
        setCart(updated);
        localStorage.setItem(`cart_${userKey}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('userDataUpdated'));
        alert(`${deal.destination} נוסף לעגלה! 🛒`);
    };

    const toggleDestinationFavorite = (destCard) => {
        if (!isLoggedIn) {
            alert('כדי להוסיף למועדפים יש להתחבר תחילה');
            navigate('/login');
            return;
        }

        const userKey = getUserKey();
        const isDestinationFavorite = favorites.some(
            fav => fav.type === 'deal' && fav.destination === destCard.destination
        );

        let updated;
        if (isDestinationFavorite) {
            updated = favorites.filter(
                fav => !(fav.type === 'deal' && fav.destination === destCard.destination)
            );
        } else {
            updated = [...favorites, { ...destCard.representativeDeal, type: 'deal' }];
        }

        setFavorites(updated);
        localStorage.setItem(`favorites_${userKey}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('userDataUpdated'));
    };

    const filterDeals = () => {
        if (!deals || deals.length === 0) {
            setFilteredDestinations([]);
            return;
        }

        // First filter deals by basic criteria
        let filtered = [...deals];

        if (destinationKeyword.trim()) {
            filtered = filtered.filter((deal) =>
                deal.destination.toLowerCase().includes(destinationKeyword.toLowerCase())
            );
        }

        filtered = filtered.filter(deal =>
            deal.price >= priceRange[0] && deal.price <= priceRange[1]
        );

        if (isKosherOnly) {
            filtered = filtered.filter(deal => Boolean(deal.isKosherFriendly));
        }

        if (vibeFilter && VIBE_DESTINATIONS[vibeFilter]) {
            const vibeKeywords = VIBE_DESTINATIONS[vibeFilter];
            filtered = filtered.filter(deal =>
                vibeKeywords.some(kw => deal.destination.includes(kw))
            );
        }

        if (vibeFilter === 'cheap') {
            filtered = filtered.filter(deal => deal.price <= 2799);
        }

        if (isDateRangeActive) {
            const startDate = new Date(dateRangeSelection[0].startDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(dateRangeSelection[0].endDate);
            endDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter((deal) => {
                const dealStart = parseDealStartDate(deal.dates);
                return dealStart && dealStart >= startDate && dealStart <= endDate;
            });
        }

        // Group deals by destination
        const destinationMap = {};
        filtered.forEach(deal => {
            if (!destinationMap[deal.destination]) {
                destinationMap[deal.destination] = [];
            }
            destinationMap[deal.destination].push(deal);
        });

        // Create destination cards with best price and package count
        const destinationCards = Object.keys(destinationMap).map(destination => {
            const packages = destinationMap[destination];
            const minPrice = Math.min(...packages.map(p => p.price));
            const maxDiscount = Math.max(...packages.map(p => p.discount));
            const avgRating = packages.reduce((sum, p) => sum + p.rating, 0) / packages.length;
            const totalReviews = packages.reduce((sum, p) => sum + p.reviewsCount, 0);
            const representativeDeal = packages.find(p => p.price === minPrice) || packages[0];

            return {
                destination,
                packageCount: packages.length,
                minPrice,
                maxDiscount,
                avgRating,
                totalReviews,
                hasKosherPackage: packages.some(isKosherDeal),
                image: representativeDeal.image,
                category: representativeDeal.category,
                flightTime: representativeDeal.flightTime,
                representativeDeal
            };
        });

        // Sort destination cards
        destinationCards.sort((a, b) => {
            switch (sortBy) {
                case 'price-low': return a.minPrice - b.minPrice;
                case 'price-high': return b.minPrice - a.minPrice;
                case 'rating': return b.avgRating - a.avgRating;
                case 'discount': return b.maxDiscount - a.maxDiscount;
                default: return 0;
            }
        });

        setFilteredDestinations(destinationCards);
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

    const HeartSVG = ({ filled }) => (
        <svg
            viewBox="0 0 24 24"
            className="heart-icon"
            aria-hidden="true"
            style={{
                fill: filled ? '#e63946' : 'transparent',
                stroke: filled ? '#e63946' : 'rgba(255,255,255,0.95)',
                strokeWidth: 1.8,
                strokeLinejoin: 'round',
                width: 22,
                height: 22,
                transition: 'fill 0.25s, stroke 0.25s'
            }}
        >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    const formatDateLabel = (date) =>
        new Intl.DateTimeFormat('he-IL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);

    const dateRangeLabel = isDateRangeActive
        ? `${formatDateLabel(dateRangeSelection[0].startDate)} - ${formatDateLabel(dateRangeSelection[0].endDate)}`
        : 'כל התאריכים';

    if (isLoading) {
        return <div className="deals-page" style={{ textAlign: 'center', padding: '50px' }}>טוען דילים מדהימים...</div>;
    }

    return (
        <div className="deals-page">

            {/* Hero Section */}
            <section className="deals-hero">
                <div className="hero-content">
                    <h1 className="floating">דילים חמים לחופשות בלתי נשכחות</h1>
                    <p>הנחות עד 30% על חבילות נופש מובחרות</p>
                </div>
            </section>

            {/* Filter Section */}
            <section className="filter-section">
                <div className="filter-container">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>חיפוש יעד</label>
                            <div className="search-input-wrapper">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    value={destinationKeyword}
                                    onChange={(e) => setDestinationKeyword(e.target.value)}
                                    placeholder="חפש יעד..."
                                    className="search-input"
                                />
                                {destinationKeyword && (
                                    <button
                                        type="button"
                                        className="search-clear"
                                        onClick={() => setDestinationKeyword('')}
                                        aria-label="נקה חיפוש"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="filter-group date-filter" ref={datePickerRef}>
                            <label>תאריכים</label>
                            <button
                                type="button"
                                className="date-picker-trigger"
                                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                            >
                                <CalendarDays size={18} className="date-trigger-icon" />
                                <span>{dateRangeLabel}</span>
                            </button>

                            {isDatePickerOpen && (
                                <div className="date-picker-popover">
                                    <div className="date-picker-popover-header">
                                        <span>בחר תאריכים</span>
                                        <button
                                            type="button"
                                            className="date-picker-close"
                                            onClick={() => setIsDatePickerOpen(false)}
                                            aria-label="סגירה"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <DateRange
                                        ranges={dateRangeSelection}
                                        onChange={(ranges) => {
                                            setDateRangeSelection([ranges.selection]);
                                            setIsDateRangeActive(true);
                                        }}
                                        minDate={new Date(2026, 0, 1)}
                                        maxDate={new Date(2032, 11, 31)}
                                        months={1}
                                        direction="horizontal"
                                        showDateDisplay={false}
                                        editableDateInputs={false}
                                        moveRangeOnFirstSelection={false}
                                        rangeColors={['#667eea']}
                                    />

                                    <div className="date-picker-actions">
                                        <button
                                            type="button"
                                            className="date-action-btn ghost"
                                            onClick={() => {
                                                setIsDateRangeActive(false);
                                                setIsDatePickerOpen(false);
                                            }}
                                        >
                                            נקה
                                        </button>
                                        <button
                                            type="button"
                                            className="date-action-btn"
                                            onClick={() => setIsDatePickerOpen(false)}
                                        >
                                            סגירה
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="filter-group price-filter">
                            <label>טווח מחיר: ₪{priceRange[0]} - ₪{priceRange[1]}</label>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                    placeholder="מינימום"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                                    placeholder="מקסימום"
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>מיון לפי</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="price-low">מחיר נמוך לגבוה</option>
                                <option value="price-high">מחיר גבוה לנמוך</option>
                                <option value="rating">דירוג</option>
                                <option value="discount">הנחה</option>
                            </select>
                        </div>

                        {vibeFilter && (
                            <div className="filter-group">
                                <label>סוכן AI</label>
                                <button
                                    type="button"
                                    className="kosher-toggle active"
                                    onClick={() => setVibeFilter(null)}
                                >
                                    {VIBE_LABELS[vibeFilter]} ✕
                                </button>
                            </div>
                        )}

                        <div className="filter-group kosher-filter-group">
                            <label>כשרות</label>
                            <button
                                type="button"
                                className={`kosher-toggle ${isKosherOnly ? 'active' : ''}`}
                                onClick={() => setIsKosherOnly(prev => !prev)}
                            >
                                {isKosherOnly ? 'כשר בלבד' : 'כל החבילות'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Deals Grid */}
            <section className="deals-grid-section">
                <div className="results-info">
                    <h2>נמצאו {filteredDestinations.length} יעדים</h2>
                    <p className="hot-tip">💡 לחץ על יעד לצפייה בכל החבילות הזמינות</p>
                </div>

                <div className="deals-grid">
                    {filteredDestinations.map(destCard => {
                        const isFavDestination = favorites.some(
                            fav => fav.type === 'deal' && fav.destination === destCard.destination
                        );

                        return (
                        <div
                            key={destCard.destination}
                            className="deal-card destination-card"
                            onClick={() => navigate(`/deals/${encodeURIComponent(destCard.destination)}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="deal-badge">
                                <span className="discount">עד -{destCard.maxDiscount}%</span>
                                {/* {destCard.hasKosherPackage && (
                                    <span className="kosher-destination-badge">מותאם לשומרי כשרות</span>
                                )} */}
                                <span className="package-count">{destCard.packageCount} חבילות</span>
                            </div>

                            <div className="deal-image">
                                <img src={destCard.image} alt={destCard.destination} />

                                <button
                                    className={`deals-favorite-heart ${isFavDestination ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        toggleDestinationFavorite(destCard);
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    aria-label={isFavDestination ? 'הסר ממועדפים' : 'הוסף למועדפים'}
                                >
                                    <HeartSVG filled={isFavDestination} />
                                </button>
                            </div>

                            <div className="deal-content">
                                <h3>{destCard.destination}</h3>

                                <div className="rating-section">
                                    <div className="stars">{renderStars(destCard.avgRating)}</div>
                                    <span className="rating-text">{destCard.avgRating.toFixed(1)}</span>
                                    <span className="reviews">({destCard.totalReviews} ביקורות)</span>
                                </div>

                                <div className="destination-highlights">
                                    <div className="highlight-item">
                                        <span className="icon">✈️</span>
                                        <span>{destCard.flightTime}</span>
                                    </div>
                                    <div className="highlight-item">
                                        <span className="icon">📦</span>
                                        <span>{destCard.packageCount} חבילות נופש זמינות</span>
                                    </div>
                                </div>

                                <div className="price-section">
                                    <div className="price-info">
                                        <span className="price-label">החל מ-</span>
                                        <span className="current-price">₪{destCard.minPrice}</span>
                                        <span className="price-note">למבוגר</span>
                                    </div>
                                    <button 
                                        className="view-packages-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/deals/${encodeURIComponent(destCard.destination)}`);
                                        }}
                                    >
                                        צפה בחבילות
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>

                {filteredDestinations.length === 0 && (
                    <div className="no-results">
                        <div className="no-results-icon">😕</div>
                        <h3>לא נמצאו יעדים</h3>
                        <p>נסה לשנות את הפילטרים או לחפש יעד אחר</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Deals;