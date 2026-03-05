import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import { CalendarDays, X } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './Deals.css';

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
    const [selectedDestination, setSelectedDestination] = useState('all');
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

    const deals = [
        {
            id: 1,
            destination: 'פריז, צרפת',
            image: '/images/parisZ.jpg',
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
            image: '/images/romeI.jpg',
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
            image: '/images/barcelonaS.jpg',
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
            image: '/images/amsterdamH.jpg',
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
            image: '/images/londonA.jpg',
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
            image: '/images/baliI.jpg',
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
            image: '/images/tokyoY.jpg',
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
            image: '/images/new-yorkA.jpg',
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
        },
            {
        id: 18,
        destination: 'פריז, צרפת',
        image: '/images/parisZ.jpg',
        price: 2699,
        originalPrice: 3599,
        discount: 25,
        dates: '1-8 יוני 2026',
        rating: 4.7,
        airline: 'Air France',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון בוטיק במרכז',
        included: ['טיסות הלוך חזור', 'מלון + ארוחת בוקר'],
        reviewsCount: 198
    },
    {
        id: 19,
        destination: 'פריז, צרפת',
        image: '/images/parisZ.jpg',
        price: 2599,
        originalPrice: 3499,
        discount: 26,
        dates: '10-17 נובמבר 2026',
        rating: 4.8,
        airline: 'אל על',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון 4 כוכבים + ספא',
        included: ['טיסות', 'מלון', 'ארוחת בוקר', 'העברות'],
        reviewsCount: 214
    },
    {
        id: 20,
        destination: 'רומא, איטליה',
        image: '/images/romeI.jpg',
        price: 2399,
        originalPrice: 3199,
        discount: 25,
        dates: '18-25 ספטמבר 2026',
        rating: 4.8,
        airline: 'ITA Airways',
        flightTime: '4 שעות',
        category: 'europe',
        hotel: 'מלון 4 כוכבים',
        included: ['טיסות', 'מלון ליד הקולוסיאום'],
        reviewsCount: 312
    },
    {
        id: 21,
        destination: 'רומא, איטליה',
        image: '/images/romeI.jpg',
        price: 2299,
        originalPrice: 2899,
        discount: 21,
        dates: '5-12 אוקטובר 2026',
        rating: 4.7,
        airline: 'Wizz Air',
        flightTime: '4 שעות',
        category: 'europe',
        hotel: 'מלון 3 כוכבים במרכז',
        included: ['טיסות', 'מלון', 'סיור רומאי'],
        reviewsCount: 276
    },
    {
        id: 22,
        destination: 'ברצלונה, ספרד',
        image: '/images/barcelonaS.jpg',
        price: 2499,
        originalPrice: 3399,
        discount: 27,
        dates: '5-12 ספטמבר 2026',
        rating: 4.6,
        airline: 'Vueling',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון 4 כוכבים',
        included: ['טיסות', 'מלון מרכזי', 'ארוחת בוקר'],
        reviewsCount: 241
    },
    {
        id: 23,
        destination: 'ברצלונה, ספרד',
        image: '/images/barcelonaS.jpg',
        price: 2199,
        originalPrice: 3099,
        discount: 29,
        dates: '25-31 אוגוסט 2026',
        rating: 4.5,
        airline: 'Ryanair',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון בוטיק',
        included: ['טיסות', 'מלון', 'העברות'],
        reviewsCount: 198
    },
    {
        id: 24,
        destination: 'לונדון, אנגליה',
        image: '/images/londonA.jpg',
        price: 3099,
        originalPrice: 4199,
        discount: 26,
        dates: '10-17 אוקטובר 2026',
        rating: 4.7,
        airline: 'easyJet',
        flightTime: '5.5 שעות',
        category: 'europe',
        hotel: 'מלון 3 כוכבים',
        included: ['טיסות', 'מלון ליד תחבורה ציבורית'],
        reviewsCount: 287
    },
    {
        id: 25,
        destination: 'לונדון, אנגליה',
        image: '/images/londonA.jpg',
        price: 2799,
        originalPrice: 3699,
        discount: 24,
        dates: '3-10 דצמבר 2026',
        rating: 4.6,
        airline: 'British Airways',
        flightTime: '5.5 שעות',
        category: 'europe',
        hotel: 'מלון 4 כוכבים + ארוחות בוקר',
        included: ['טיסות', 'מלון'],
        reviewsCount: 221
    },
    {
        id: 26,
        destination: 'דובאי, איחוד האמירויות',
        image: '/images/dubai.jpg',
        price: 3299,
        originalPrice: 4699,
        discount: 30,
        dates: '12-19 מרץ 2026',
        rating: 4.8,
        airline: 'FlyDubai',
        flightTime: '4.5 שעות',
        category: 'asia',
        hotel: 'מלון 4 כוכבים',
        included: ['טיסות', 'מלון', 'העברות'],
        reviewsCount: 354
    },
    {
        id: 27,
        destination: 'דובאי, איחוד האמירויות',
        image: '/images/dubai.jpg',
        price: 3599,
        originalPrice: 4999,
        discount: 28,
        dates: '22-29 נובמבר 2026',
        rating: 4.9,
        airline: 'Emirates',
        flightTime: '4.5 שעות',
        category: 'asia',
        hotel: 'מלון יוקרה + ארוחות',
        included: ['טיסות', 'מלון', 'ספא'],
        reviewsCount: 482
    },
    {
        id: 28,
        destination: 'ניו יורק, ארה"ב',
        image: '/images/new-yorkA.jpg',
        price: 4599,
        originalPrice: 6099,
        discount: 25,
        dates: '10-18 ספטמבר 2026',
        rating: 4.6,
        airline: 'American Airlines',
        flightTime: '12.5 שעות',
        category: 'america',
        hotel: 'מלון בטיימס סקוור',
        included: ['טיסות', 'מלון 4 כוכבים'],
        reviewsCount: 411
    },
    {
        id: 29,
        destination: 'ניו יורק, ארה"ב',
        image: '/images/new-yorkA.jpg',
        price: 4999,
        originalPrice: 6399,
        discount: 22,
        dates: '1-10 נובמבר 2026',
        rating: 4.8,
        airline: 'Delta',
        flightTime: '13 שעות',
        category: 'america',
        hotel: 'מלון במנהטן + ארוחות בוקר',
        included: ['טיסות', 'מלון'],
        reviewsCount: 528
    },
    {
        id: 30,
        destination: 'מיאמי, ארה"ב',
        image: '/images/miami.jpg',
        price: 4099,
        originalPrice: 5699,
        discount: 28,
        dates: '8-17 אוקטובר 2026',
        rating: 4.6,
        airline: 'United',
        flightTime: '14 שעות',
        category: 'america',
        hotel: 'מלון על החוף + רכב',
        included: ['טיסות', 'מלון', 'השכרת רכב'],
        reviewsCount: 329
    },
    {
        id: 31,
        destination: 'קנקון, מקסיקו',
        image: '/images/cancun.jpg',
        price: 4199,
        originalPrice: 5399,
        discount: 22,
        dates: '12-20 נובמבר 2026',
        rating: 4.9,
        airline: 'Aeromexico',
        flightTime: '15 שעות',
        category: 'america',
        hotel: 'אול אינקלוסיב + פעילויות',
        included: ['טיסות', 'מלון', 'פעילויות מים'],
        reviewsCount: 375
    },
    {
        id: 32,
        destination: 'סנטוריני, יוון',
        image: '/images/santorini.jpg',
        price: 3499,
        originalPrice: 4699,
        discount: 26,
        dates: '1-8 אוקטובר 2026',
        rating: 4.8,
        airline: 'Ryanair',
        flightTime: '4 שעות',
        category: 'europe',
        hotel: 'מלון עם נוף לקלדרה',
        included: ['טיסות', 'מלון רומנטי', 'ארוחת בוקר'],
        reviewsCount: 366
    },
        {
        id: 33,
        destination: 'פריז, צרפת',
        image: '/images/parisZ.jpg',
        price: 2199, // חורף – זול
        originalPrice: 3299,
        discount: 33,
        dates: '12-19 ינואר 2026',
        rating: 4.6,
        airline: 'Transavia',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון 3 כוכבים',
        included: ['טיסות', 'מלון'],
        reviewsCount: 154
    },
    {
        id: 34,
        destination: 'רומא, איטליה',
        image: '/images/romeI.jpg',
        price: 2599, // עונת כתף
        originalPrice: 3399,
        discount: 24,
        dates: '10-17 מרץ 2026',
        rating: 4.8,
        airline: 'Ryanair',
        flightTime: '4 שעות',
        category: 'europe',
        hotel: 'מלון 4 כוכבים',
        included: ['טיסות', 'מלון', 'ארוחת בוקר'],
        reviewsCount: 301
    },
    {
        id: 35,
        destination: 'ברצלונה, ספרד',
        image: '/images/barcelonaS.jpg',
        price: 2899, // קיץ – יקר
        originalPrice: 3899,
        discount: 26,
        dates: '1-8 אוגוסט 2026',
        rating: 4.7,
        airline: 'Iberia',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון ליד החוף',
        included: ['טיסות', 'מלון', 'ארוחת בוקר'],
        reviewsCount: 412
    },
    {
        id: 36,
        destination: 'לונדון, אנגליה',
        image: '/images/londonA.jpg',
        price: 2499, // חורף
        originalPrice: 3599,
        discount: 30,
        dates: '15-22 פברואר 2026',
        rating: 4.5,
        airline: 'Wizz Air',
        flightTime: '5.5 שעות',
        category: 'europe',
        hotel: 'מלון 3 כוכבים',
        included: ['טיסות', 'מלון'],
        reviewsCount: 189
    },
    {
        id: 37,
        destination: 'דובאי, איחוד האמירויות',
        image: '/images/dubai.jpg',
        price: 3899, // עונת שיא
        originalPrice: 5299,
        discount: 26,
        dates: '20-27 אפריל 2026',
        rating: 4.9,
        airline: 'Emirates',
        flightTime: '4.5 שעות',
        category: 'asia',
        hotel: 'מלון 5 כוכבים',
        included: ['טיסות', 'מלון', 'ספא', 'העברות'],
        reviewsCount: 603
    },
    {
        id: 38,
        destination: 'ניו יורק, ארה"ב',
        image: '/images/new-yorkA.jpg',
        price: 4399, // חורף
        originalPrice: 5999,
        discount: 27,
        dates: '10-18 פברואר 2026',
        rating: 4.6,
        airline: 'United',
        flightTime: '13 שעות',
        category: 'america',
        hotel: 'מלון 4 כוכבים',
        included: ['טיסות', 'מלון'],
        reviewsCount: 344
    },
    {
        id: 39,
        destination: 'מיאמי, ארה"ב',
        image: '/images/miami.jpg',
        price: 4699, // חורף – מבוקש
        originalPrice: 6299,
        discount: 25,
        dates: '5-15 ינואר 2026',
        rating: 4.8,
        airline: 'American Airlines',
        flightTime: '14 שעות',
        category: 'america',
        hotel: 'מלון על החוף',
        included: ['טיסות', 'מלון', 'השכרת רכב'],
        reviewsCount: 492
    },
    {
        id: 40,
        destination: 'טוקיו, יפן',
        image: '/images/tokyoY.jpg',
        price: 5199, // עונת כתף
        originalPrice: 6999,
        discount: 26,
        dates: '5-15 מאי 2026',
        rating: 4.9,
        airline: 'ANA',
        flightTime: '12 שעות',
        category: 'asia',
        hotel: 'מלון מרכזי',
        included: ['טיסות', 'מלון', 'JR Pass'],
        reviewsCount: 467
    },
    {
        id: 41,
        destination: 'באלי, אינדונזיה',
        image: '/images/baliI.jpg',
        price: 3999, // עונת גשמים – זול
        originalPrice: 5599,
        discount: 29,
        dates: '1-15 פברואר 2026',
        rating: 4.7,
        airline: 'Qatar Airways',
        flightTime: '14 שעות',
        category: 'asia',
        hotel: 'ריזורט',
        included: ['טיסות', 'מלון', 'ארוחות'],
        reviewsCount: 288
    },
    {
        id: 42,
        destination: 'סנטוריני, יוון',
        image: '/images/santorini.jpg',
        price: 2899, // חורף
        originalPrice: 4199,
        discount: 31,
        dates: '10-17 מרץ 2026',
        rating: 4.6,
        airline: 'Aegean',
        flightTime: '4 שעות',
        category: 'europe',
        hotel: 'מלון בוטיק',
        included: ['טיסות', 'מלון'],
        reviewsCount: 201
    },
    {
        id: 43,
        destination: 'פראג, צ\'כיה',
        image: '/images/prague.jpg',
        price: 1799, // חורף
        originalPrice: 2599,
        discount: 31,
        dates: '5-12 פברואר 2026',
        rating: 4.7,
        airline: 'Smartwings',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון 3 כוכבים',
        included: ['טיסות', 'מלון'],
        reviewsCount: 233
    },
    {
        id: 44,
        destination: 'איסטנבול, טורקיה',
        image: '/images/istanbul.jpg',
        price: 1899, // כתף
        originalPrice: 2699,
        discount: 30,
        dates: '1-8 אפריל 2026',
        rating: 4.8,
        airline: 'Pegasus',
        flightTime: '3.5 שעות',
        category: 'asia',
        hotel: 'מלון מרכזי',
        included: ['טיסות', 'מלון', 'סיור'],
        reviewsCount: 341
    },
    {
        id: 45,
        destination: 'פורטוגל - ליסבון',
        image: '/images/lisbon.jpg',
        price: 2199, // כתף
        originalPrice: 3199,
        discount: 31,
        dates: '10-17 נובמבר 2026',
        rating: 4.7,
        airline: 'TAP Portugal',
        flightTime: '5 שעות',
        category: 'europe',
        hotel: 'מלון בוטיק',
        included: ['טיסות', 'מלון', 'סיור קולינרי'],
        reviewsCount: 295
    },
        {
        id: 50,
        destination: 'ברלין, גרמניה',
        image: '/images/berlin.jpg',
        price: 2199,
        originalPrice: 2999,
        discount: 27,
        dates: '5-10 מאי 2026',
        rating: 4.6,
        airline: 'Lufthansa',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון 4 כוכבים במרכז',
        included: ['טיסות הלוך חזור', 'מלון + ארוחת בוקר'],
        reviewsCount: 214
    },
    {
        id: 46,
        destination: 'ברלין, גרמניה',
        image: '/images/berlin.jpg',
        price: 1999,
        originalPrice: 2799,
        discount: 29,
        dates: '18-23 יוני 2026',
        rating: 4.5,
        airline: 'easyJet',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון 3 כוכבים',
        included: ['טיסות', 'מלון', 'תחבורה ציבורית חופשית'],
        reviewsCount: 176
    },
    {
        id: 47,
        destination: 'ברלין, גרמניה',
        image: '/images/berlin.jpg',
        price: 2399,
        originalPrice: 3299,
        discount: 27,
        dates: '10-15 אוגוסט 2026',
        rating: 4.7,
        airline: 'Eurowings',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון בוטיק',
        included: ['טיסות', 'מלון מרכזי', 'ארוחת בוקר'],
        reviewsCount: 263
    },
    {
        id: 48,
        destination: 'ברלין, גרמניה',
        image: '/images/berlin.jpg',
        price: 2599,
        originalPrice: 3499,
        discount: 26,
        dates: '20-26 ספטמבר 2026',
        rating: 4.8,
        airline: 'אל על',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון 4 כוכבים + ספא',
        included: ['טיסות', 'מלון', 'ספא', 'ארוחת בוקר'],
        reviewsCount: 301
    },
    {
        id: 49,
        destination: 'ברלין, גרמניה',
        image: '/images/berlin.jpg',
        price: 2099,
        originalPrice: 2899,
        discount: 28,
        dates: '5-10 דצמבר 2026',
        rating: 4.4,
        airline: 'Ryanair',
        flightTime: '4.5 שעות',
        category: 'europe',
        hotel: 'מלון ליד שווקי חג המולד',
        included: ['טיסות', 'מלון', 'סיור חורפי מודרך'],
        reviewsCount: 189
    },
    ];

    const destinations = [
        { id: 'all', name: 'כל היעדים' },
        { id: 'europe', name: 'אירופה' },
        { id: 'asia', name: 'אסיה' },
        { id: 'america', name: 'אמריקה' }
    ];

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
    }, [selectedDestination, destinationKeyword, priceRange, sortBy, dateRangeSelection, isDateRangeActive]);

    useEffect(() => {
        const destinationFromQuery = (searchParams.get('destination') || '').trim();
        const startDateQuery = searchParams.get('startDate');
        const endDateQuery = searchParams.get('endDate');

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
        const deal = deals.find(d => d.id === dealId);
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
        // First filter deals by basic criteria
        let filtered = deals;

        if (selectedDestination !== 'all') {
            filtered = filtered.filter(deal => deal.category === selectedDestination);
        }

        if (destinationKeyword.trim()) {
            filtered = filtered.filter((deal) =>
                deal.destination.toLowerCase().includes(destinationKeyword.toLowerCase())
            );
        }

        filtered = filtered.filter(deal =>
            deal.price >= priceRange[0] && deal.price <= priceRange[1]
        );

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
                                {destCard.packageCount > 1 && (
                                    <span className="package-count">{destCard.packageCount} חבילות</span>
                                )}
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
                                        <span>{destCard.packageCount} אופציות זמינות</span>
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