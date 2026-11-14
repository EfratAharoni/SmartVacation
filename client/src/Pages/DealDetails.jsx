import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Hotel, PlaneTakeoff, Sparkles, BadgeDollarSign, Star } from 'lucide-react';
import DealBookingModal from '../components/DealBookingModal';
import { toast } from '../components/Toast';
import { useUserLists } from '../context/UserListsContext';
import { usePreferences } from '../context/PreferencesContext';
import { departsBetween, firstDepartureTime } from '../utils/dealDates';
import './DealDetails.css';

import useDestinationInfo from './useDestinationInfo';
import { Info } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';
import useLocalize from '../utils/useLocalize';
import Reviews from '../components/Reviews';

const getDealId = (deal) => deal?._id || deal?.id;

const DealDetails = () => {
    const { destination } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t, tc, tDate, isEn } = useLocalize();
    const { price } = usePreferences();
    const { isLoggedIn, isFavorite, toggleFavorite: toggleFav, addToCart } = useUserLists();
    const [allDeals, setAllDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareSelection, setCompareSelection] = useState([]);
    const [sortPackagesBy, setSortPackagesBy] = useState('price');
    const [bookingDeal, setBookingDeal] = useState(null);
    const [selectedDates, setSelectedDates] = useState({});

    const getSelectedDate = (deal) => {
        const id = getDealId(deal);
        if (selectedDates[id]) return selectedDates[id];
        return Array.isArray(deal.dates) ? deal.dates[0] : deal.dates;
    };

    const destinationInfo = useDestinationInfo(decodeURIComponent(destination));
    const [showInfoModal, setShowInfoModal] = useState(false);

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
    }, []);

    const allDealsWithAttractions = allDeals.map((deal) => {
        const existingAttractions = Array.isArray(deal.attractions)
            ? deal.attractions.filter(Boolean)
            : [];
        return {
            ...deal,
            attractions: existingAttractions.length >= 2
                ? existingAttractions
                : [...existingAttractions, t('dealDetails.extraAttraction')].slice(0, 2)
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
        if (startDateParam && endDateParam && !departsBetween(deal, startDateParam, endDateParam)) return false;
        return true;
    });

    // Sort packages
    const sortedPackages = [...filteredDestinationDeals].sort((a, b) => {
        switch (sortPackagesBy) {
            case 'price': return a.price - b.price;
            case 'rating': return b.rating - a.rating;
            case 'discount': return b.discount - a.discount;
            case 'date': return firstDepartureTime(a) - firstDepartureTime(b);
            default: return 0;
        }
    });

    const toggleFavorite = (dealId) => {
        const deal = allDeals.find(d => getDealId(d) === dealId);
        if (!deal) return;
        if (toggleFav({ ...deal, type: 'deal' }) === 'login') {
            toast.info(t('common.loginToFav'));
            navigate('/login');
        }
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
            toast.info(t('common.loginToBook'));
            navigate('/login');
            return;
        }
        setBookingDeal(deal);
    };

    const confirmBooking = (bookingOptions, totalPrice) => {
        const result = addToCart({
            ...allDeals.find(d => getDealId(d) === getDealId(bookingDeal)), // original (without filler attraction)
            dates: getSelectedDate(bookingDeal),
            type: 'deal',
            bookingOptions,
            totalPrice,
        });
        if (result === 'exists') {
            toast.info(t('dealDetails.alreadyInCart'));
            return;
        }
        setBookingDeal(null);
        toast.success(t('dealDetails.addedToCart'));
    };

    const handleCompareToggle = (dealId) => {
        if (compareSelection.includes(dealId)) {
            setCompareSelection(compareSelection.filter(id => id !== dealId));
        } else if (compareSelection.length < 3) {
            setCompareSelection([...compareSelection, dealId]);
        } else {
            toast.info(t('dealDetails.compareLimit'));
        }
    };

    if (isLoading) {
        return <div className="deal-details-page" style={{ textAlign: 'center', padding: '80px' }}>{t('dealDetails.loading')}</div>;
    }

    if (destinationDeals.length === 0) {
        return (
            <div className="deal-details-page">
                <div className="no-destination">
                    <h2>{t('dealDetails.notFound')}</h2>
                    <button onClick={() => navigate('/deals')} className="btn-back">
                        {t('dealDetails.backToDeals')}
                    </button>
                </div>
            </div>
        );
    }


    const mainDeal = destinationDeals[0];

    return (
        <div className="deal-details-page">
            <button onClick={() => navigate('/deals')} className="btn-back-floating">
                {t('dealDetails.backToDeals')}
            </button>

            {/* Hero Section with Destination Background */}
            <section className="destination-hero" style={{ backgroundImage: `url(${mainDeal.image})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content-details">
                    <div className="destination-title-row">
                        <h1 className="destination-title">{tc(mainDeal, 'destination')}</h1>
                        {destinationInfo && (
                            <button
                                className="destination-info-btn"
                                title={t('dealDetails.importantInfo')}
                                aria-label={t('dealDetails.importantInfo')}
                                onClick={() => setShowInfoModal(true)}
                            >
                                <Info size={26} color="#1e90ff" style={{ verticalAlign: 'middle' }} />
                            </button>
                        )}
                    </div>
                    <p className="destination-subtitle">{t('dealDetails.packagesAvailable', { count: destinationDeals.length })}</p>
                    <div className="destination-meta">
                        <span className="meta-item">
                            <PlaneTakeoff size={16} className="meta-icon" />
                            {t('dealDetails.flightTime', { time: tc(mainDeal, 'flightTime') })}
                        </span>
                        <span className="meta-item">
                            <BadgeDollarSign size={16} className="meta-icon money" />
                            {t('dealDetails.fromPrice', { price: price(Math.min(...destinationDeals.map(d => d.price))) })}
                        </span>
                        <span className="meta-item">
                            <Star size={16} className="meta-icon star" />
                            {t('dealDetails.avgRating', { rating: (destinationDeals.reduce((sum, d) => sum + d.rating, 0) / destinationDeals.length).toFixed(1) })}
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
                            <Info size={32} color="#1e90ff" style={{ marginInlineEnd: 8 }} />
                            <h2>{t('dealDetails.beforeYouFly', { destination: tc(destinationInfo, 'destination') })}</h2>
                        </div>
                        <ul className="destination-info-list">
                            {(tc(destinationInfo, 'info') || []).map((item, idx) => (
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
                            <label>{t('common.sortBy')}</label>
                            <select
                                className="filter-select"
                                value={sortPackagesBy}
                                onChange={(e) => setSortPackagesBy(e.target.value)}
                            >
                            <option value="price">{t('dealDetails.sortPrice')}</option>
                            <option value="rating">{t('dealDetails.sortRating')}</option>
                            <option value="discount">{t('dealDetails.sortDiscount')}</option>
                            <option value="date">{t('dealDetails.sortDate')}</option>
                        </select>
                        </div>

                        <div className="filter-group details-filter-action">
                            <label>{t('dealDetails.compare')}</label>
                            <button
                                className={`btn-compare ${compareMode ? 'active' : ''}`}
                                onClick={() => setCompareMode(!compareMode)}
                            >
                                {compareMode ? t('dealDetails.compareActive') : t('dealDetails.compareBtn')}
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
                        <span>{t('dealDetails.selectedForCompare', { count: compareSelection.length })}</span>
                        <div className="compare-actions">
                            <button 
                                className="btn-view-comparison"
                                onClick={() => setSelectedPackage('compare')}
                            >
                                {t('dealDetails.viewComparison')}
                            </button>
                            <button 
                                className="btn-clear-comparison"
                                onClick={() => setCompareSelection([])}
                            >
                                {t('common.clear')}
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
                                {deal.rating >= 4.8 && <span className="best-seller">{t('dealDetails.bestSeller')}</span>}
                                {deal.isKosherFriendly && <span className="kosher-package-badge">{t('dealDetails.kosherFriendly')}</span>}
                            </div>

                            <button
                                className={`favorite-heart ${isFavorite({ _id: dealId, type: 'deal' }) ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(dealId); }}
                                aria-label={isFavorite({ _id: dealId, type: 'deal' }) ? t('common.removeFav') : t('common.addFav')}
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
                                                <option key={d} value={d}>{tDate(d)}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="dates-text">{tDate(getSelectedDate(deal))}</span>
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
                                        <strong>{tc(deal, 'airline')}</strong>
                                        <span>{deal.flightDetails?.departure || 'N/A'} - {deal.flightDetails?.arrival || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-icon" aria-hidden="true">
                                        <Hotel size={20} />
                                    </span>
                                    <div className="detail-text">
                                        <strong>{tc(deal, 'hotelName') || tc(deal, 'hotel')}</strong>
                                        <span>{tc(deal, 'hotel')}</span>
                                    </div>
                                </div>

                                <div className="detail-item full-width">
                                    <span className="detail-icon" aria-hidden="true">
                                        <Sparkles size={20} />
                                    </span>
                                    <div className="detail-text">
                                        <strong>{t('dealDetails.recommendedAttractions')}</strong>
                                        <span>{tc(deal, 'attractions')?.join(', ') || t('dealDetails.variousAttractions')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="package-included">
                                <h4>{t('dealDetails.whatsIncluded')}</h4>
                                <ul className="included-compact">
                                    {(tc(deal, 'included') || []).map((item, idx) => (
                                        <li key={idx}>✓ {item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="package-footer">
                                <div className="price-display">
                                    <span className="original-price-small">{price(deal.originalPrice)}</span>
                                    <span className="current-price-large">{price(deal.price)}</span>
                                    <span className="price-per">{t('common.perAdult')}</span>
                                </div>
                                <div className="package-actions">
                                    <button 
                                        className="btn-details"
                                        onClick={() => setSelectedPackage(deal)}
                                    >
                                        {t('dealDetails.fullDetails')}
                                    </button>
                                    <button
                                        className="btn-book-now"
                                        onClick={(e) => openBookingModal(deal, e)}
                                    >
                                        {t('common.bookNow')}
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
                            <img src={selectedPackage.image} alt={tc(selectedPackage, 'destination')} className="deal-modal-hero-image" />
                            <div className="deal-modal-header deal-modal-header-overlay">
                                <h2>{tc(selectedPackage, 'destination')}</h2>
                                <p className="deal-modal-dates">{tDate(getSelectedDate(selectedPackage))}</p>
                            </div>
                        </div>
                        <div className="deal-modal-body">
                            <div className="deal-modal-details">
                                <div className="detail-section">
                                    <h3>{t('dealDetails.flightDetails')}</h3>
                                    <p><strong>{t('dealDetails.airline')}</strong> {tc(selectedPackage, 'airline')}</p>
                                    <p><strong>{t('dealDetails.flightDuration')}</strong> {tc(selectedPackage, 'flightTime')}</p>
                                    <p><strong>{t('dealDetails.departure')}</strong> {selectedPackage.flightDetails?.departure || 'N/A'}</p>
                                    <p><strong>{t('dealDetails.arrival')}</strong> {selectedPackage.flightDetails?.arrival || 'N/A'}</p>
                                    <p><strong>{t('dealDetails.class')}</strong> {(isEn && selectedPackage.en?.flightClass) || selectedPackage.flightDetails?.class || t('dealDetails.economy')}</p>
                                </div>

                                <div className="detail-section">
                                    <h3>{t('dealDetails.hotelDetails')}</h3>
                                    <p><strong>{t('dealDetails.hotel')}</strong> {tc(selectedPackage, 'hotelName') || tc(selectedPackage, 'hotel')}</p>
                                    <p><strong>{t('dealDetails.type')}</strong> {tc(selectedPackage, 'hotel')}</p>
                                    <p><strong>{t('dealDetails.rating')}</strong> {selectedPackage.rating} ⭐ {t('common.reviewsCount', { count: selectedPackage.reviewsCount })}</p>
                                </div>

                                <div className="detail-section">
                                    <h3>{t('dealDetails.whatsIncludedTitle')}</h3>
                                    <ul>
                                        {(tc(selectedPackage, 'included') || []).map((item, idx) => (
                                            <li key={idx}>✓ {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {selectedPackage.attractions && (
                                    <div className="detail-section">
                                        <h3>{t('dealDetails.recommendedAttractionsTitle')}</h3>
                                        <ul>
                                            {(tc(selectedPackage, 'attractions') || []).map((attr, idx) => (
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
                                        <p className="original-price-line">{t('dealDetails.originalPrice')} <span>{price(selectedPackage.originalPrice)}</span></p>
                                        <p className="discount-line">{t('dealDetails.discount')} <span className="discount-amount">-{selectedPackage.discount}%</span></p>
                                        <p className="final-price-line">{t('dealDetails.finalPrice')} <span className="final-price">{price(selectedPackage.price)}</span></p>
                                    </div>
                                    <button
                                        className="deal-btn-modal-book"
                                        onClick={(e) => {
                                            setSelectedPackage(null);
                                            openBookingModal(selectedPackage, e);
                                        }}
                                    >
                                        {t('dealDetails.bookThis')}
                                    </button>
                                </div>

                                <Reviews itemType="deal" itemKey={selectedPackage.destination} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Options Modal (shared with the cart) */}
            {bookingDeal && (
                <DealBookingModal
                    deal={bookingDeal}
                    dateLabel={tDate(getSelectedDate(bookingDeal))}
                    onClose={() => setBookingDeal(null)}
                    onConfirm={confirmBooking}
                    confirmLabel={t('common.addToCart')}
                    note={t('booking.addNote')}
                />
            )}

            {/* Comparison Modal */}
            {selectedPackage === 'compare' && compareSelection.length > 0 && (
                <div className="deal-modal-overlay" onClick={() => setSelectedPackage(null)}>
                    <div className="deal-modal-content deal-comparison-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="deal-close-btn" onClick={() => setSelectedPackage(null)}>✕</button>
                        <h2 className="comparison-title">{t('dealDetails.comparisonTitle', { destination: tc(mainDeal, 'destination') })}</h2>
                        
                        <div className="comparison-grid">
                            {compareSelection.map(dealId => {
                                const deal = destinationDeals.find(d => getDealId(d) === dealId);
                                if (!deal) return null;
                                
                                return (
                                    <div key={getDealId(deal)} className="comparison-column">
                                        <div className="comparison-header">
                                            <h3>{tDate(getSelectedDate(deal))}</h3>
                                            <span className="comparison-price">{price(deal.price)}</span>
                                            <span className="comparison-discount">-{deal.discount}%</span>
                                        </div>
                                        
                                        <div className="comparison-body">
                                            <div className="comparison-row">
                                                <strong>{t('dealDetails.rating')}</strong>
                                                <span>{deal.rating} ⭐</span>
                                            </div>
                                            <div className="comparison-row">
                                                <strong>{t('dealDetails.airline')}</strong>
                                                <span>{tc(deal, 'airline')}</span>
                                            </div>
                                            <div className="comparison-row">
                                                <strong>{t('dealDetails.flightHours')}</strong>
                                                <span>{deal.flightDetails?.departure} - {deal.flightDetails?.arrival}</span>
                                            </div>
                                            <div className="comparison-row">
                                                <strong>{t('dealDetails.hotel')}</strong>
                                                <span>{tc(deal, 'hotelName') || tc(deal, 'hotel')}</span>
                                            </div>
                                            <div className="comparison-row includes-row">
                                                <strong>{t('dealDetails.includes')}</strong>
                                                <ul className="comparison-list">
                                                    {(tc(deal, 'included') || []).map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="comparison-row">
                                                <strong>{t('dealDetails.savings')}</strong>
                                                <span className="savings">{price(deal.originalPrice - deal.price)}</span>
                                            </div>
                                        </div>
                                        
                                        <button
                                            className="btn-select-package"
                                            onClick={(e) => {
                                                setSelectedPackage(null);
                                                openBookingModal(deal, e);
                                            }}
                                        >
                                            {t('dealDetails.selectThis')}
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
