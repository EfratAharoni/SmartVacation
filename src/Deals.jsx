import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Deals.css';

const Deals = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState('all');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [dateFilter, setDateFilter] = useState('all');
    const [filteredDeals, setFilteredDeals] = useState([]);
    const [sortBy, setSortBy] = useState('price-low');

    const deals = [
        {
            id: 1,
            destination: 'פריז, צרפת',
            image: '/images/paris.jpg',
            price: 2499,
            originalPrice: 3499,
            discount: 29,
            dates: '15-22 מאי 2026',
            rating: 4.8,
            airline: 'אל על',
            flightTime: '4.5 שעות',
            category: 'europe',
            hotel: 'מלון 4 כוכבים',
            included: ['טיסות הלוך חזור', 'מלון + ארוחת בוקר', 'העברות'],
            reviewsCount: 342
        },
        {
            id: 2,
            destination: 'רומא, איטליה',
            image: '/images/rome.jpg',
            price: 2199,
            originalPrice: 2999,
            discount: 27,
            dates: '3-10 יוני 2026',
            rating: 4.9,
            airline: 'Wizz Air',
            flightTime: '4 שעות',
            category: 'europe',
            hotel: 'מלון 5 כוכבים',
            included: ['טיסות הלוך חזור', 'מלון במרכז העיר', 'סיור חינם'],
            reviewsCount: 428
        },
        {
            id: 3,
            destination: 'ברצלונה, ספרד',
            image: '/images/barcelona.jpg',
            price: 2299,
            originalPrice: 3199,
            discount: 28,
            dates: '10-17 יולי 2026',
            rating: 4.7,
            airline: 'Ryanair',
            flightTime: '4.5 שעות',
            category: 'europe',
            hotel: 'מלון בוטיק',
            included: ['טיסות', 'מלון ליד החוף', 'ארוחת בוקר'],
            reviewsCount: 289
        },
        {
            id: 4,
            destination: 'אמסטרדם, הולנד',
            image: '/images/amsterdam.jpg',
            price: 2699,
            originalPrice: 3599,
            discount: 25,
            dates: '20-27 אפריל 2026',
            rating: 4.6,
            airline: 'KLM',
            flightTime: '5 שעות',
            category: 'europe',
            hotel: 'מלון 4 כוכבים',
            included: ['טיסות', 'מלון במרכז', 'כרטיס למוזיאונים'],
            reviewsCount: 315
        },
        {
            id: 5,
            destination: 'לונדון, אנגליה',
            image: '/images/london.jpg',
            price: 2899,
            originalPrice: 3899,
            discount: 26,
            dates: '5-12 מאי 2026',
            rating: 4.8,
            airline: 'British Airways',
            flightTime: '5.5 שעות',
            category: 'europe',
            hotel: 'מלון 4 כוכבים',
            included: ['טיסות', 'מלון במרכז לונדון', 'ארוחות בוקר'],
            reviewsCount: 502
        },
        {
            id: 6,
            destination: 'דובאי, איחוד האמירויות',
            image: '/images/dubai.jpg',
            price: 3499,
            originalPrice: 4999,
            discount: 30,
            dates: '1-8 יוני 2026',
            rating: 4.9,
            airline: 'Emirates',
            flightTime: '4.5 שעות',
            category: 'asia',
            hotel: 'מלון 5 כוכבים',
            included: ['טיסות', 'מלון יוקרה', 'ספא', 'העברות'],
            reviewsCount: 681
        },
        {
            id: 7,
            destination: 'באלי, אינדונזיה',
            image: '/images/bali.jpg',
            price: 4299,
            originalPrice: 5799,
            discount: 26,
            dates: '15-29 אוגוסט 2026',
            rating: 4.8,
            airline: 'Turkish Airlines',
            flightTime: '14 שעות',
            category: 'asia',
            hotel: 'וילה פרטית',
            included: ['טיסות', 'וילה עם בריכה', 'ארוחות', 'סיורים'],
            reviewsCount: 445
        },
        {
            id: 8,
            destination: 'טוקיו, יפן',
            image: '/images/tokyo.jpg',
            price: 5499,
            originalPrice: 7299,
            discount: 25,
            dates: '10-20 ספטמבר 2026',
            rating: 4.9,
            airline: 'ANA',
            flightTime: '12 שעות',
            category: 'asia',
            hotel: 'מלון מודרני',
            included: ['טיסות', 'מלון במרכז טוקיו', 'JR Pass'],
            reviewsCount: 523
        },
        {
            id: 9,
            destination: 'ניו יורק, ארה"ב',
            image: '/images/new-york.jpg',
            price: 4799,
            originalPrice: 6299,
            discount: 24,
            dates: '5-15 יולי 2026',
            rating: 4.7,
            airline: 'United',
            flightTime: '13 שעות',
            category: 'america',
            hotel: 'מלון במנהטן',
            included: ['טיסות', 'מלון 4 כוכבים', 'סיור בעיר'],
            reviewsCount: 629
        },
        {
            id: 10,
            destination: 'מיאמי, ארה"ב',
            image: '/images/miami.jpg',
            price: 4299,
            originalPrice: 5699,
            discount: 25,
            dates: '20-30 יוני 2026',
            rating: 4.6,
            airline: 'Delta',
            flightTime: '14 שעות',
            category: 'america',
            hotel: 'מלון על החוף',
            included: ['טיסות', 'מלון על הים', 'השכרת רכב'],
            reviewsCount: 384
        },
        {
            id: 11,
            destination: 'קנקון, מקסיקו',
            image: '/images/cancun.jpg',
            price: 3899,
            originalPrice: 5199,
            discount: 25,
            dates: '1-10 אוגוסט 2026',
            rating: 4.8,
            airline: 'Aeromexico',
            flightTime: '15 שעות',
            category: 'america',
            hotel: 'אול אינקלוסיב',
            included: ['טיסות', 'מלון הכל כלול', 'פעילויות מים'],
            reviewsCount: 467
        },
        {
            id: 12,
            destination: 'סנטוריני, יוון',
            image: '/images/santorini.jpg',
            price: 3299,
            originalPrice: 4499,
            discount: 27,
            dates: '15-22 יוני 2026',
            rating: 4.9,
            airline: 'Aegean',
            flightTime: '4 שעות',
            category: 'europe',
            hotel: 'מלון מול הים',
            included: ['טיסות', 'מלון רומנטי', 'שייט בשקיעה'],
            reviewsCount: 591
        },
        {
            id: 13,
            destination: 'פראג, צ\'כיה',
            image: '/images/prague.jpg',
            price: 1999,
            originalPrice: 2799,
            discount: 29,
            dates: '10-17 מאי 2026',
            rating: 4.7,
            airline: 'Czech Airlines',
            flightTime: '4.5 שעות',
            category: 'europe',
            hotel: 'מלון היסטורי',
            included: ['טיסות', 'מלון בעיר העתיקה', 'סיורים'],
            reviewsCount: 398
        },
        {
            id: 14,
            destination: 'בנגקוק, תאילנד',
            image: '/images/bangkok.jpg',
            price: 3799,
            originalPrice: 5099,
            discount: 26,
            dates: '5-15 יולי 2026',
            rating: 4.8,
            airline: 'Thai Airways',
            flightTime: '11 שעות',
            category: 'asia',
            hotel: 'מלון 5 כוכבים',
            included: ['טיסות', 'מלון יוקרה', 'ספא', 'סיורים'],
            reviewsCount: 512
        },
        {
            id: 15,
            destination: 'מלדיביים',
            image: '/images/maldives.jpg',
            price: 6999,
            originalPrice: 9499,
            discount: 26,
            dates: '10-20 ספטמבר 2026',
            rating: 5.0,
            airline: 'Emirates',
            flightTime: '9 שעות',
            category: 'asia',
            hotel: 'בונגלו על המים',
            included: ['טיסות', 'בונגלו פרטי', 'הכל כלול', 'ספא'],
            reviewsCount: 734
        },
        {
            id: 16,
            destination: 'פורטוגל - ליסבון',
            image: '/images/lisbon.jpg',
            price: 2399,
            originalPrice: 3299,
            discount: 27,
            dates: '1-8 יוני 2026',
            rating: 4.7,
            airline: 'TAP Portugal',
            flightTime: '5 שעות',
            category: 'europe',
            hotel: 'מלון בוטיק',
            included: ['טיסות', 'מלון מרכזי', 'סיור יינות'],
            reviewsCount: 423
        },
        {
            id: 17,
            destination: 'איסטנבול, טורקיה',
            image: '/images/istanbul.jpg',
            price: 2099,
            originalPrice: 2899,
            discount: 28,
            dates: '20-27 מאי 2026',
            rating: 4.8,
            airline: 'Turkish Airlines',
            flightTime: '3.5 שעות',
            category: 'asia',
            hotel: 'מלון 4 כוכבים',
            included: ['טיסות', 'מלון במרכז', 'סיור בוספורוס'],
            reviewsCount: 468
        }
    ];

    const destinations = [
        { id: 'all', name: 'כל היעדים' },
        { id: 'europe', name: 'אירופה' },
        { id: 'asia', name: 'אסיה' },
        { id: 'america', name: 'אמריקה' }
    ];

    const dateFilters = [
        { id: 'all', name: 'כל התאריכים' },
        { id: 'may', name: 'מאי 2026' },
        { id: 'june', name: 'יוני 2026' },
        { id: 'july', name: 'יולי 2026' },
        { id: 'august', name: 'אוגוסט 2026' },
        { id: 'september', name: 'ספטמבר 2026' }
    ];

    useEffect(() => {
        filterDeals();
    }, [selectedDestination, priceRange, dateFilter, sortBy]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const filterDeals = () => {
        let filtered = deals;

        // Filter by destination
        if (selectedDestination !== 'all') {
            filtered = filtered.filter(deal => deal.category === selectedDestination);
        }

        // Filter by price
        filtered = filtered.filter(deal => 
            deal.price >= priceRange[0] && deal.price <= priceRange[1]
        );

        // Filter by date
        if (dateFilter !== 'all') {
            const monthMap = {
                'may': 'מאי',
                'june': 'יוני',
                'july': 'יולי',
                'august': 'אוגוסט',
                'september': 'ספטמבר'
            };
            filtered = filtered.filter(deal => 
                deal.dates.includes(monthMap[dateFilter])
            );
        }

        // Sort deals
        filtered.sort((a, b) => {
            switch(sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'discount':
                    return b.discount - a.discount;
                default:
                    return 0;
            }
        });

        setFilteredDeals(filtered);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const scrollToSection = (sectionId) => {
        const element = document.querySelector(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsMobileMenuOpen(false);
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

    return (
        <div className="deals-page">
            {/* Header */}
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <nav>
                    <div className="logo" onClick={() => navigate('/')}>Smart Vacation ✈️</div>
                    <button className="mobile-menu-btn" onClick={toggleMobileMenu}>☰</button>
                    <div className={`nav-center ${isMobileMenuOpen ? 'active' : ''}`}>
                        <ul className="nav-links">
                            <li>
                                <a onClick={() => navigate("/")}>עמוד הבית</a>
                            </li>
                            <li>
                                 <a onClick={() => navigate("/")}>קצת עלינו</a>
                            </li>
                            <li>
                                <a className="active">חבילות נופש </a>
                            </li>
                            <li>
                                <a onClick={() => navigate("/attractions")}>אטרקציות</a>
                            </li>
                            <li>
                                <a onClick={() => navigate("/")}>צור קשר</a>
                            </li>
                            </ul>
                        <div className="auth-buttons">
                            <button className="btn btn-login" onClick={handleLogin}>התחברות</button>
                            <button className="btn btn-register" onClick={handleRegister}>הרשמה</button>
                        </div>
                    </div>
                </nav>
            </header>

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
                        {/* Destination Filter */}
                        <div className="filter-group">
                            <label>יעד</label>
                            <select 
                                value={selectedDestination} 
                                onChange={(e) => setSelectedDestination(e.target.value)}
                                className="filter-select"
                            >
                                {destinations.map(dest => (
                                    <option key={dest.id} value={dest.id}>{dest.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="filter-group">
                            <label>תאריכים</label>
                            <select 
                                value={dateFilter} 
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="filter-select"
                            >
                                {dateFilters.map(date => (
                                    <option key={date.id} value={date.id}>{date.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range Filter */}
                        <div className="filter-group price-filter">
                            <label>טווח מחיר: ₪{priceRange[0]} - ₪{priceRange[1]}</label>
                            <div className="price-inputs">
                                <input 
                                    type="number" 
                                    value={priceRange[0]} 
                                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                                    placeholder="מינימום"
                                />
                                <span>-</span>
                                <input 
                                    type="number" 
                                    value={priceRange[1]} 
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                    placeholder="מקסימום"
                                />
                            </div>
                        </div>

                        {/* Sort By */}
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
                    </div>
                </div>
            </section>

            {/* Deals Grid */}
            <section className="deals-grid-section">
                <div className="results-info">
                    <h2>נמצאו {filteredDeals.length} דילים</h2>
                    <p className="hot-tip">💡 מחירים כוללים טיסות + מלון</p>
                </div>

                <div className="deals-grid">
                    {filteredDeals.map(deal => (
                        <div key={deal.id} className="deal-card">
                            <div className="deal-badge">
                                <span className="discount">-{deal.discount}%</span>
                            </div>
                            
                            <div className="deal-image">
                                <img src={deal.image} alt={deal.destination} />
                            </div>

                            <div className="deal-content">
                                <h3>{deal.destination}</h3>
                                
                                <div className="rating-section">
                                    <div className="stars">
                                        {renderStars(deal.rating)}
                                    </div>
                                    <span className="rating-text">{deal.rating}</span>
                                    <span className="reviews">({deal.reviewsCount} ביקורות)</span>
                                </div>

                                <div className="deal-dates">
                                    <span className="date-icon">📅</span>
                                    <span>{deal.dates}</span>
                                </div>

                                <div className="flight-info">
                                    <div className="airline">
                                        <span className="plane-icon">✈️</span>
                                        <span>{deal.airline}</span>
                                    </div>
                                    <div className="flight-time">
                                        <span className="clock-icon">⏱️</span>
                                        <span>{deal.flightTime}</span>
                                    </div>
                                </div>

                                <div className="hotel-info">
                                    <span className="hotel-icon">🏨</span>
                                    <span>{deal.hotel}</span>
                                </div>

                                <div className="included-section">
                                    <h4>מה כלול:</h4>
                                    <ul className="included-list">
                                        {deal.included.map((item, index) => (
                                            <li key={index}>✓ {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="price-section">
                                    <div className="price-info">
                                        <span className="original-price">₪{deal.originalPrice}</span>
                                        <span className="current-price">₪{deal.price}</span>
                                    </div>
                                    <button className="book-btn">הזמן עכשיו</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredDeals.length === 0 && (
                    <div className="no-results">
                        <div className="no-results-icon">😕</div>
                        <h3>לא נמצאו דילים</h3>
                        <p>נסה לשנות את הפילטרים או לחפש יעד אחר</p>
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer>
                <div className="footer-content">
                    <div className="footer-links">
                        <a onClick={() => navigate('/')}>עמוד הבית</a>
                        <a onClick={() => navigate('/')}>אודות</a>
                        <a onClick={() => navigate('/')}>חבילות</a>
                        <a onClick={() => navigate('/attractions')}>אטרקציות</a>
                        <a className="active">דילים</a>
                        <a href="#">תנאי שימוש</a>
                        <a href="#">פרטיות</a>
                    </div>
                    <p>&copy; 2026 Smart Vacation Planner. כל הזכויות שמורות.</p>
                </div>
            </footer>
        </div>
    );
};

export default Deals;
