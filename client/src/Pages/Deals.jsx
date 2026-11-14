import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import { CalendarDays, X, Search } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './Deals.css';
import { he as heLocale, enUS } from 'date-fns/locale';
import { VIBE_DESTINATIONS } from './fuzzySearch';
import { API_BASE_URL } from '../utils/api';
import useLocalize from '../utils/useLocalize';
import { DESTINATION_EN } from '../utils/destinations';
import { departsBetween } from '../utils/dealDates';
import { toast } from '../components/Toast';
import { useUserLists } from '../context/UserListsContext';
import { usePreferences } from '../context/PreferencesContext';

const Deals = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t, isEn, tc, formatDate } = useLocalize();
    const { price } = usePreferences();
    const { isLoggedIn, favorites, toggleFavorite, removeFavorite } = useUserLists();
    
    // --- הוספת State לניהול הנתונים מה-DB ---
    const [deals, setDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [destinationKeyword, setDestinationKeyword] = useState('');
    const [priceRange, setPriceRange] = useState([0, 15000]);
    const minDealPrice = deals.length > 0 ? Math.min(...deals.map(d => d.price)) : 0;
    const maxDealPrice = deals.length > 0 ? Math.max(...deals.map(d => d.price)) : 15000;
    const priceRange_ = maxDealPrice === minDealPrice ? 1 : maxDealPrice - minDealPrice;
    const ratioMin = Math.max(0, Math.min(1, (priceRange[0] - minDealPrice) / priceRange_));
    const ratioMax = Math.max(0, Math.min(1, (priceRange[1] - minDealPrice) / priceRange_));
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
    const datePickerRef = useRef(null);
    const sliderWrapperRef = useRef(null);
    const sliderMinRef = useRef(null);
    const sliderMaxRef = useRef(null);

    const location = useLocation();
    // Deduplicate by destination — keep highest-scored deal per destination
    const rawAiDeals = location.state?.aiRankedDeals ?? null;
    const aiRankedDeals = rawAiDeals
        ? Object.values(
            rawAiDeals.reduce((acc, item) => {
                const dest = item.deal.destination;
                if (!acc[dest] || (item.score ?? 0) > (acc[dest].score ?? 0)) {
                    acc[dest] = item;
                }
                return acc;
            }, {})
          )
        : null;
    const aiQuery = location.state?.aiQuery ?? null;

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
                if (data.length > 0) {
                    const min = Math.min(...data.map(d => d.price));
                    const max = Math.max(...data.map(d => d.price));
                    setPriceRange([min, max]);
                }
            } catch (error) {
                console.error("Error fetching deals:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDeals();
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

        const budgetQuery = searchParams.get('budget');
        const guestsQuery = searchParams.get('guests');
        if (budgetQuery) {
            const totalBudget = parseInt(budgetQuery, 10);
            const guests = guestsQuery ? parseInt(guestsQuery, 10) : 1;
            const perPersonMax = Math.min(15000, Math.floor(totalBudget / guests));
            setPriceRange([0, perPersonMax]);
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

    const toggleDestinationFavorite = (destCard) => {
        if (!isLoggedIn) {
            toast.info(t('common.loginToFav'));
            navigate('/login');
            return;
        }
        const favDeals = favorites.filter(fav => fav.type === 'deal' && fav.destination === destCard.destination);
        if (favDeals.length) favDeals.forEach(removeFavorite);
        else toggleFavorite({ ...destCard.representativeDeal, type: 'deal' });
    };

    const filterDeals = () => {
        if (!deals || deals.length === 0) {
            setFilteredDestinations([]);
            return;
        }

        // First filter deals by basic criteria
        let filtered = [...deals];

        if (destinationKeyword.trim()) {
            // match the Hebrew name or its English translation, so either language works
            const kw = destinationKeyword.trim().toLowerCase();
            filtered = filtered.filter((deal) =>
                [deal.destination, deal.en?.destination, DESTINATION_EN[deal.destination]]
                    .filter(Boolean)
                    .some((name) => name.toLowerCase().includes(kw))
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
            const { startDate, endDate } = dateRangeSelection[0];
            filtered = filtered.filter((deal) => departsBetween(deal, startDate, endDate));
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

    const buildDestinationUrl = (destination) => {
        const params = new URLSearchParams();
        if (isKosherOnly) params.set('kosher', 'true');
        if (isDateRangeActive) {
            params.set('startDate', dateRangeSelection[0].startDate.toISOString());
            params.set('endDate', dateRangeSelection[0].endDate.toISOString());
        }
        const query = params.toString();
        return `/deals/${encodeURIComponent(destination)}${query ? `?${query}` : ''}`;
    };

    const formatDateLabel = (date) => formatDate(date);

    const dateRangeLabel = isDateRangeActive
        ? `${formatDateLabel(dateRangeSelection[0].startDate)} - ${formatDateLabel(dateRangeSelection[0].endDate)}`
        : t('deals.allDates');

    if (isLoading) {
        return <div className="deals-page" style={{ textAlign: 'center', padding: '50px' }}>{t('deals.loading')}</div>;
    }

    return (
        <div className="deals-page">

            {/* Hero Section */}
            <section className="deals-hero">
                <div className="hero-content">
                    <h1 className="floating">{t('deals.heroTitle')}</h1>
                    <p>{t('deals.heroSubtitle')}</p>
                </div>
            </section>

            {/* Filter Section */}
            <section className="filter-section">
                <div className="filter-container">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>{t('deals.searchDestination')}</label>
                            <div className="search-input-wrapper">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    value={destinationKeyword}
                                    onChange={(e) => setDestinationKeyword(e.target.value)}
                                    placeholder={t('deals.searchPlaceholder')}
                                    className="search-input"
                                />
                                {destinationKeyword && (
                                    <button
                                        type="button"
                                        className="search-clear"
                                        onClick={() => setDestinationKeyword('')}
                                        aria-label={t('deals.clearSearch')}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="filter-group date-filter" ref={datePickerRef}>
                            <label>{t('deals.dates')}</label>
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
                                        <span>{t('common.selectDates')}</span>
                                        <button
                                            type="button"
                                            className="date-picker-close"
                                            onClick={() => setIsDatePickerOpen(false)}
                                            aria-label={t('common.close')}
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
                                        locale={isEn ? enUS : heLocale}
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
                                            {t('common.clear')}
                                        </button>
                                        <button
                                            type="button"
                                            className="date-action-btn"
                                            onClick={() => setIsDatePickerOpen(false)}
                                        >
                                            {t('common.close')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="filter-group price-filter">
                            <label>{t('deals.priceLabel', { min: price(priceRange[0]), max: price(priceRange[1]) })}</label>
                            <div className="price-range-wrapper" ref={sliderWrapperRef}>
                                <div className="price-range-track-container">
                                    <div className="price-range-track-bg" />
                                    <div
                                        className="price-range-track-fill"
                                        style={{
                                            left: `${ratioMin * 100}%`,
                                            right: `${(1 - ratioMax) * 100}%`,
                                        }}
                                    />
                                </div>
                                <input
                                    ref={sliderMinRef}
                                    type="range"
                                    className="price-slider price-slider-min"
                                    min={minDealPrice}
                                    max={maxDealPrice}
                                    step={250}
                                    value={priceRange[0]}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val < priceRange[1]) setPriceRange([val, priceRange[1]]);
                                    }}
                                />
                                <input
                                    ref={sliderMaxRef}
                                    type="range"
                                    className="price-slider price-slider-max"
                                    min={minDealPrice}
                                    max={maxDealPrice}
                                    step={250}
                                    value={priceRange[1]}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val > priceRange[0]) setPriceRange([priceRange[0], val]);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>{t('common.sortBy')}</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="price-low">{t('deals.sortPriceLow')}</option>
                                <option value="price-high">{t('deals.sortPriceHigh')}</option>
                                <option value="rating">{t('deals.sortRating')}</option>
                                <option value="discount">{t('deals.sortDiscount')}</option>
                            </select>
                        </div>

                        {vibeFilter && (
                            <div className="filter-group">
                                <label>{t('deals.aiAgent')}</label>
                                <button
                                    type="button"
                                    className="kosher-toggle active"
                                    onClick={() => setVibeFilter(null)}
                                >
                                    {t(`vibes.${vibeFilter}`, { defaultValue: vibeFilter })} ✕
                                </button>
                            </div>
                        )}

                        <div className="filter-group kosher-filter-group">
                            <label>{t('deals.kosher')}</label>
                            <button
                                type="button"
                                className={`kosher-toggle ${isKosherOnly ? 'active' : ''}`}
                                onClick={() => setIsKosherOnly(prev => !prev)}
                            >
                                {isKosherOnly ? t('deals.kosherOnly') : t('deals.allPackages')}
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* AI Ranked Results */}
            {aiRankedDeals && aiRankedDeals.length > 0 && (
                <section className="ai-results-section">
                    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="ai-results-header-wrapper">
                        <div className="ai-results-header">
                            <span className="ai-results-icon">
                                <span className="ai-icon-pill">
                                    <Search size={18} strokeWidth={2} />
                                </span>
                            </span>
                            <div className="ai-results-text">
                                <h2>{t('deals.aiRecommendations')}</h2>
                                {aiQuery && <p className="ai-results-query">{aiQuery}</p>}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="ai-clear-pill-btn"
                            onClick={() => {
                                setDestinationKeyword('');
                                setPriceRange([minDealPrice, maxDealPrice]);
                                setIsDateRangeActive(false);
                                setIsKosherOnly(false);
                                setVibeFilter(null);
                                setSortBy('price-low');
                                navigate('/deals', { replace: true });
                            }}
                        >
                            {t('deals.clearFilters')}
                        </button>
                    </div>
                    </div>
                    <div className="deals-grid" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>
                        {aiRankedDeals.map(({ deal, score, explanation }) => (
                            <div
                                key={deal._id}
                                className="deal-card destination-card ai-ranked-card"
                                onClick={() => navigate(`/deals/${encodeURIComponent(deal.destination)}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                {score !== null && (
                                    <div className="ai-score-badge">{t('deals.match', { score: score.toFixed(1) })}</div>
                                )}
                                <div className="deal-badge">
                                    <span className="discount">{t('deals.upToDiscount', { discount: deal.discount })}</span>
                                </div>
                                <div className="deal-image">
                                    <img src={deal.image} alt={tc(deal, 'destination')} />
                                </div>
                                <div className="deal-content">
                                    <h3>{tc(deal, 'destination')}</h3>
                                    <div className="rating-section">
                                        <div className="stars">{renderStars(deal.rating)}</div>
                                        <span className="rating-text">{deal.rating?.toFixed(1)}</span>
                                    </div>
                                    {explanation && (
                                        <p className="ai-explanation">{explanation}</p>
                                    )}
                                    <div className="price-section">
                                        <div className="price-info">
                                            <span className="price-label">{t('common.from')}</span>
                                            <span className="current-price">{price(deal.price)}</span>
                                        </div>
                                        <button
                                            className="view-packages-btn"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/deals/${encodeURIComponent(deal.destination)}`); }}
                                        >
                                            {t('deals.viewPackages')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Deals Grid — hidden when AI results are shown to avoid duplicates */}
            {!(aiRankedDeals && aiRankedDeals.length > 0) && <section className="deals-grid-section">
                <div className="results-info">
                    <div className="results-info-row">
                        <h2>{t('deals.foundDestinations', { count: filteredDestinations.length })}</h2>
                        {(destinationKeyword || isDateRangeActive || isKosherOnly || vibeFilter || priceRange[0] > minDealPrice || priceRange[1] < maxDealPrice) && (
                            <button
                                type="button"
                                className="clear-filters-btn"
                                onClick={() => {
                                    setDestinationKeyword('');
                                    setPriceRange([minDealPrice, maxDealPrice]);
                                    setIsDateRangeActive(false);
                                    setIsKosherOnly(false);
                                    setVibeFilter(null);
                                    setSortBy('price-low');
                                    navigate('/deals', { replace: true });
                                }}
                            >
                                {t('deals.clearFilters')}
                            </button>
                        )}
                    </div>
                    <p className="hot-tip">{t('deals.hotTip')}</p>
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
                            onClick={() => navigate(buildDestinationUrl(destCard.destination))}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="deal-badge">
                                <span className="discount">{t('deals.upToDiscount', { discount: destCard.maxDiscount })}</span>
                                {/* {destCard.hasKosherPackage && (
                                    <span className="kosher-destination-badge">מותאם לשומרי כשרות</span>
                                )} */}
                                <span className="package-count">{t('deals.packagesCount', { count: destCard.packageCount })}</span>
                            </div>

                            <div className="deal-image">
                                <img src={destCard.image} alt={tc(destCard.representativeDeal, 'destination')} />

                                <button
                                    className={`deals-favorite-heart ${isFavDestination ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        toggleDestinationFavorite(destCard);
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    aria-label={isFavDestination ? t('common.removeFav') : t('common.addFav')}
                                >
                                    <HeartSVG filled={isFavDestination} />
                                </button>
                            </div>

                            <div className="deal-content">
                                <h3>{tc(destCard.representativeDeal, 'destination')}</h3>

                                <div className="rating-section">
                                    <div className="stars">{renderStars(destCard.avgRating)}</div>
                                    <span className="rating-text">{destCard.avgRating.toFixed(1)}</span>
                                    <span className="reviews">{t('common.reviewsCount', { count: destCard.totalReviews })}</span>
                                </div>

                                <div className="destination-highlights">
                                    <div className="highlight-item">
                                        <span className="icon">✈️</span>
                                        <span>{tc(destCard.representativeDeal, 'flightTime')}</span>
                                    </div>
                                    <div className="highlight-item">
                                        <span className="icon">📦</span>
                                        <span>{t('deals.packagesAvailable', { count: destCard.packageCount })}</span>
                                    </div>
                                </div>

                                <div className="price-section">
                                    <div className="price-info">
                                        <span className="price-label">{t('common.from')}</span>
                                        <span className="current-price">{price(destCard.minPrice)}</span>
                                        <span className="price-note">{t('common.perAdult')}</span>
                                    </div>
                                    <button 
                                        className="view-packages-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(buildDestinationUrl(destCard.destination));
                                        }}
                                    >
                                        {t('deals.viewPackages')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>

                {filteredDestinations.length === 0 && (
                    <div className="no-results">
                        <div className="no-results-icon">😕</div>
                        <h3>{t('deals.noResults')}</h3>
                        <p>{t('deals.noResultsHint')}</p>
                    </div>
                )}
            </section>}
        </div>
    );
};

export default Deals;