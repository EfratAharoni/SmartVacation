import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, Hotel, PlaneTakeoff, Sparkles, BadgeDollarSign, Star } from 'lucide-react';
import './DealDetails.css';

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

    // All deals data (same as in Deals.jsx)
    const allDeals = [
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
            hotelName: 'Hotel Eiffel Trocadero',
            included: ['טיסות הלוך חזור', 'מלון + ארוחת בוקר', 'העברות'],
            reviewsCount: 342,
            flightDetails: {
                departure: '06:00',
                arrival: '10:30',
                class: 'תיירים'
            },
            attractions: ['מגדל אייפל', 'לובר', 'שאנז אליזה']
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
            hotelName: 'Rome Cavalieri Waldorf Astoria',
            included: ['טיסות הלוך חזור', 'מלון במרכז העיר', 'סיור חינם'],
            reviewsCount: 428,
            flightDetails: {
                departure: '07:30',
                arrival: '11:30',
                class: 'תיירים'
            },
            attractions: ['קולוסיאום', 'ותיקן', 'פונטנה די טרווי']
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
            hotelName: 'Hotel Arts Barcelona',
            included: ['טיסות', 'מלון ליד החוף', 'ארוחת בוקר'],
            reviewsCount: 289,
            flightDetails: {
                departure: '08:00',
                arrival: '12:30',
                class: 'תיירים'
            },
            attractions: ['סגרדה פמיליה', 'פארק גואל', 'רמבלס']
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
            hotelName: 'Waldorf Astoria Amsterdam',
            included: ['טיסות', 'מלון במרכז', 'כרטיס למוזיאונים'],
            reviewsCount: 315,
            flightDetails: {
                departure: '09:00',
                arrival: '14:00',
                class: 'תיירים'
            },
            attractions: ['מוזיאון ואן גוך', 'בית אנה פרנק', 'תעלות']
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
            hotelName: 'The Savoy London',
            included: ['טיסות', 'מלון במרכז לונדון', 'ארוחות בוקר'],
            reviewsCount: 502,
            flightDetails: {
                departure: '06:30',
                arrival: '12:00',
                class: 'תיירים'
            },
            attractions: ['ביג בן', 'ארמון בקינגהאם', 'טאור בריג\'']
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
            hotelName: 'Burj Al Arab',
            included: ['טיסות', 'מלון יוקרה', 'ספא', 'העברות'],
            reviewsCount: 681,
            flightDetails: {
                departure: '02:00',
                arrival: '06:30',
                class: 'עסקים'
            },
            attractions: ['בורג\' חליפה', 'דובאי מול', 'ספארי במדבר']
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
            hotelName: 'Four Seasons Bali',
            included: ['טיסות', 'וילה עם בריכה', 'ארוחות', 'סיורים'],
            reviewsCount: 445,
            flightDetails: {
                departure: '22:00',
                arrival: '16:00+1',
                class: 'תיירים'
            },
            attractions: ['מקדש טנה לוט', 'אובוד', 'חופי קוטה']
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
            hotelName: 'Park Hyatt Tokyo',
            included: ['טיסות', 'מלון במרכז טוקיו', 'JR Pass'],
            reviewsCount: 523,
            flightDetails: {
                departure: '01:00',
                arrival: '17:00',
                class: 'תיירים'
            },
            attractions: ['הר פוג\'י', 'שיבויה', 'מקדש סנסוג\'י']
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
            hotelName: 'The Plaza New York',
            included: ['טיסות', 'מלון 4 כוכבים', 'סיור בעיר'],
            reviewsCount: 629,
            flightDetails: {
                departure: '08:00',
                arrival: '12:00',
                class: 'תיירים'
            },
            attractions: ['פסל החירות', 'טיימס סקוור', 'סנטרל פארק']
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
            hotelName: 'Fontainebleau Miami Beach',
            included: ['טיסות', 'מלון על הים', 'השכרת רכב'],
            reviewsCount: 384,
            flightDetails: {
                departure: '10:00',
                arrival: '15:00',
                class: 'תיירים'
            },
            attractions: ['סאות\' ביץ\'', 'אוונגליידס', 'ארט דקו']
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
            hotelName: 'Moon Palace Cancun',
            included: ['טיסות', 'מלון הכל כלול', 'פעילויות מים'],
            reviewsCount: 467,
            flightDetails: {
                departure: '11:00',
                arrival: '17:00',
                class: 'תיירים'
            },
            attractions: ['צ\'יצ\'ן איצה', 'שנורקלינג', 'טולום']
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
            hotelName: 'Canaves Oia Suites',
            included: ['טיסות', 'מלון רומנטי', 'שייט בשקיעה'],
            reviewsCount: 591,
            flightDetails: {
                departure: '09:30',
                arrival: '13:30',
                class: 'תיירים'
            },
            attractions: ['אויה', 'פירה', 'חופים שחורים']
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
            hotelName: 'Four Seasons Prague',
            included: ['טיסות', 'מלון בעיר העתיקה', 'סיורים'],
            reviewsCount: 398,
            flightDetails: {
                departure: '07:00',
                arrival: '11:30',
                class: 'תיירים'
            },
            attractions: ['גשר קארל', 'טירת פראג', 'שעון אסטרונומי']
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
            hotelName: 'Mandarin Oriental Bangkok',
            included: ['טיסות', 'מלון יוקרה', 'ספא', 'סיורים'],
            reviewsCount: 512,
            flightDetails: {
                departure: '23:00',
                arrival: '14:00+1',
                class: 'תיירים'
            },
            attractions: ['ארמון המלך', 'ואט פו', 'שוקים צפים']
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
            hotelName: 'Conrad Maldives',
            included: ['טיסות', 'בונגלו פרטי', 'הכל כלול', 'ספא'],
            reviewsCount: 734,
            flightDetails: {
                departure: '03:00',
                arrival: '12:00',
                class: 'עסקים'
            },
            attractions: ['צלילה', 'ספא', 'שקיעות']
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
            hotelName: 'Four Seasons Ritz Lisbon',
            included: ['טיסות', 'מלון מרכזי', 'סיור יינות'],
            reviewsCount: 423,
            flightDetails: {
                departure: '08:30',
                arrival: '13:30',
                class: 'תיירים'
            },
            attractions: ['טירת סאו חורחה', 'בה-ירם', 'חשמלית 28']
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
            hotelName: 'Four Seasons Sultanahmet',
            included: ['טיסות', 'מלון במרכז', 'סיור בוספורוס'],
            reviewsCount: 468,
            flightDetails: {
                departure: '06:00',
                arrival: '09:30',
                class: 'תיירים'
            },
            attractions: ['האיה סופיה', 'הארמון הכחול', 'בזאר הגדול']
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
            hotelName: 'Le Meurice Paris',
            included: ['טיסות הלוך חזור', 'מלון + ארוחת בוקר'],
            reviewsCount: 198,
            flightDetails: {
                departure: '12:00',
                arrival: '16:30',
                class: 'תיירים'
            },
            attractions: ['מגדל אייפל', 'לובר', 'שאנז אליזה']
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
            hotelName: 'Shangri-La Paris',
            included: ['טיסות', 'מלון', 'ארוחת בוקר', 'העברות'],
            reviewsCount: 214,
            flightDetails: {
                departure: '14:00',
                arrival: '18:30',
                class: 'תיירים'
            },
            attractions: ['ורסאי', 'מונמארטר', 'סן ז\'רמן']
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
            hotelName: 'Hotel Hassler Roma',
            included: ['טיסות', 'מלון ליד הקולוסיאום'],
            reviewsCount: 312,
            flightDetails: {
                departure: '09:00',
                arrival: '13:00',
                class: 'תיירים'
            },
            attractions: ['קולוסיאום', 'ותיקן', 'פונטנה די טרווי']
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
            hotelName: 'Hotel Artemide',
            included: ['טיסות', 'מלון', 'סיור רומאי'],
            reviewsCount: 276,
            flightDetails: {
                departure: '15:00',
                arrival: '19:00',
                class: 'תיירים'
            },
            attractions: ['פורום רומאי', 'פנתיאון', 'טרווי']
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
            hotelName: 'W Barcelona',
            included: ['טיסות', 'מלון מרכזי', 'ארוחת בוקר'],
            reviewsCount: 241,
            flightDetails: {
                departure: '10:30',
                arrival: '15:00',
                class: 'תיירים'
            },
            attractions: ['סגרדה פמיליה', 'פארק גואל', 'רמבלס']
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
            hotelName: 'Cotton House Hotel',
            included: ['טיסות', 'מלון', 'העברות'],
            reviewsCount: 198,
            flightDetails: {
                departure: '06:30',
                arrival: '11:00',
                class: 'תיירים'
            },
            attractions: ['קאזה באטלו', 'גותי רבע', 'חוף ברצלונטה']
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
            hotelName: 'Hilton London',
            included: ['טיסות', 'מלון ליד תחבורה ציבורית'],
            reviewsCount: 287,
            flightDetails: {
                departure: '11:00',
                arrival: '16:30',
                class: 'תיירים'
            },
            attractions: ['ביג בן', 'לונדון איי', 'מוזיאון בריטי']
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
            hotelName: 'Shangri-La London',
            included: ['טיסות', 'מלון'],
            reviewsCount: 221,
            flightDetails: {
                departure: '08:00',
                arrival: '13:30',
                class: 'תיירים'
            },
            attractions: ['שוקי חג המולד', 'אוקספורד סטריט', 'וסט אנד']
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
            hotelName: 'Atlantis The Palm',
            included: ['טיסות', 'מלון', 'העברות'],
            reviewsCount: 354,
            flightDetails: {
                departure: '01:30',
                arrival: '06:00',
                class: 'תיירים'
            },
            attractions: ['בורג\' חליפה', 'דובאי מול', 'ג\'ומיירה']
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
            hotelName: 'Armani Hotel Dubai',
            included: ['טיסות', 'מלון', 'ספא'],
            reviewsCount: 482,
            flightDetails: {
                departure: '03:00',
                arrival: '07:30',
                class: 'עסקים'
            },
            attractions: ['ספארי מדבר', 'גולד סוק', 'מרינה']
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
            hotelName: 'Marriott Marquis',
            included: ['טיסות', 'מלון 4 כוכבים'],
            reviewsCount: 411,
            flightDetails: {
                departure: '07:00',
                arrival: '11:30',
                class: 'תיירים'
            },
            attractions: ['טיימס סקוור', '5th אווניו', 'ברודווי']
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
            hotelName: 'The Peninsula New York',
            included: ['טיסות', 'מלון'],
            reviewsCount: 528,
            flightDetails: {
                departure: '09:00',
                arrival: '13:00',
                class: 'תיירים'
            },
            attractions: ['סנטרל פארק', 'מוזיאון המודרני', 'וול סטריט']
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
            hotelName: 'Faena Miami Beach',
            included: ['טיסות', 'מלון', 'השכרת רכב'],
            reviewsCount: 329,
            flightDetails: {
                departure: '08:30',
                arrival: '13:30',
                class: 'תיירים'
            },
            attractions: ['סאות\' ביץ\'', 'וינווד', 'קי ווסט']
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
            hotelName: 'Grand Fiesta Americana',
            included: ['טיסות', 'מלון', 'פעילויות מים'],
            reviewsCount: 375,
            flightDetails: {
                departure: '10:00',
                arrival: '16:00',
                class: 'תיירים'
            },
            attractions: ['צ\'יצ\'ן איצה', 'איסלה מוחרס', 'סנוטים']
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
            hotelName: 'Mystique Santorini',
            included: ['טיסות', 'מלון רומנטי', 'ארוחת בוקר'],
            reviewsCount: 366,
            flightDetails: {
                departure: '13:00',
                arrival: '17:00',
                class: 'תיירים'
            },
            attractions: ['שקיעה באויה', 'יקבים', 'חוף רד ביץ\'']
        },
        {
            id: 33,
            destination: 'פריז, צרפת',
            image: '/images/parisZ.jpg',
            price: 2199,
            originalPrice: 3299,
            discount: 33,
            dates: '12-19 ינואר 2026',
            rating: 4.6,
            airline: 'Transavia',
            flightTime: '4.5 שעות',
            category: 'europe',
            hotel: 'מלון 3 כוכבים',
            hotelName: 'Hotel de Crillon',
            included: ['טיסות', 'מלון'],
            reviewsCount: 154,
            flightDetails: {
                departure: '07:00',
                arrival: '11:30',
                class: 'תיירים'
            },
            attractions: ['מגדל אייפל', 'לובר', 'שאנז אליזה']
        },
        {
            id: 34,
            destination: 'רומא, איטליה',
            image: '/images/romeI.jpg',
            price: 2599,
            originalPrice: 3399,
            discount: 24,
            dates: '10-17 מרץ 2026',
            rating: 4.8,
            airline: 'Ryanair',
            flightTime: '4 שעות',
            category: 'europe',
            hotel: 'מלון 4 כוכבים',
            hotelName: 'Palazzo Naiadi',
            included: ['טיסות', 'מלון', 'ארוחת בוקר'],
            reviewsCount: 301,
            flightDetails: {
                departure: '11:00',
                arrival: '15:00',
                class: 'תיירים'
            },
            attractions: ['קולוסיאום', 'פנתיאון', 'פיאצה נבונה']
        },
        {
            id: 35,
            destination: 'ברצלונה, ספרד',
            image: '/images/barcelonaS.jpg',
            price: 2899,
            originalPrice: 3899,
            discount: 26,
            dates: '1-8 אוגוסט 2026',
            rating: 4.7,
            airline: 'Iberia',
            flightTime: '4.5 שעות',
            category: 'europe',
            hotel: 'מלון ליד החוף',
            hotelName: 'Majestic Hotel & Spa',
            included: ['טיסות', 'מלון', 'ארוחת בוקר'],
            reviewsCount: 412,
            flightDetails: {
                departure: '14:00',
                arrival: '18:30',
                class: 'תיירים'
            },
            attractions: ['סגרדה פמיליה', 'בארסלונטה', 'רבע גותי']
        },
        {
            id: 36,
            destination: 'לונדון, אנגליה',
            image: '/images/londonA.jpg',
            price: 2499,
            originalPrice: 3599,
            discount: 30,
            dates: '15-22 פברואר 2026',
            rating: 4.5,
            airline: 'Wizz Air',
            flightTime: '5.5 שעות',
            category: 'europe',
            hotel: 'מלון 3 כוכבים',
            hotelName: 'Park Plaza Westminster',
            included: ['טיסות', 'מלון'],
            reviewsCount: 189,
            flightDetails: {
                departure: '09:30',
                arrival: '15:00',
                class: 'תיירים'
            },
            attractions: ['ביג בן', 'ארמון בקינגהאם', 'לונדון איי']
        },
        {
            id: 37,
            destination: 'דובאי, איחוד האמירויות',
            image: '/images/dubai.jpg',
            price: 3899,
            originalPrice: 5299,
            discount: 26,
            dates: '20-27 אפריל 2026',
            rating: 4.9,
            airline: 'Emirates',
            flightTime: '4.5 שעות',
            category: 'asia',
            hotel: 'מלון 5 כוכבים',
            hotelName: 'Jumeirah Beach Hotel',
            included: ['טיסות', 'מלון', 'ספא', 'העברות'],
            reviewsCount: 603,
            flightDetails: {
                departure: '02:30',
                arrival: '07:00',
                class: 'עסקים'
            },
            attractions: ['בורג\' חליפה', 'מסגד זאיד', 'פארק מים']
        },
        {
            id: 38,
            destination: 'ניו יורק, ארה"ב',
            image: '/images/new-yorkA.jpg',
            price: 4399,
            originalPrice: 5999,
            discount: 27,
            dates: '10-18 פברואר 2026',
            rating: 4.6,
            airline: 'United',
            flightTime: '13 שעות',
            category: 'america',
            hotel: 'מלון 4 כוכבים',
            hotelName: 'Lotte New York Palace',
            included: ['טיסות', 'מלון'],
            reviewsCount: 344,
            flightDetails: {
                departure: '06:00',
                arrival: '10:00',
                class: 'תיירים'
            },
            attractions: ['סנטרל פארק', 'רוקפלר סנטר', 'חג המולד']
        },
        {
            id: 39,
            destination: 'מיאמי, ארה"ב',
            image: '/images/miami.jpg',
            price: 4699,
            originalPrice: 6299,
            discount: 25,
            dates: '5-15 ינואר 2026',
            rating: 4.8,
            airline: 'American Airlines',
            flightTime: '14 שעות',
            category: 'america',
            hotel: 'מלון על החוף',
            hotelName: '1 Hotel South Beach',
            included: ['טיסות', 'מלון', 'השכרת רכב'],
            reviewsCount: 492,
            flightDetails: {
                departure: '11:00',
                arrival: '16:00',
                class: 'תיירים'
            },
            attractions: ['סאות\' ביץ\'', 'אוונגליידס', 'ליטל הוואנה']
        },
        {
            id: 40,
            destination: 'טוקיו, יפן',
            image: '/images/tokyoY.jpg',
            price: 5199,
            originalPrice: 6999,
            discount: 26,
            dates: '5-15 מאי 2026',
            rating: 4.9,
            airline: 'ANA',
            flightTime: '12 שעות',
            category: 'asia',
            hotel: 'מלון מרכזי',
            hotelName: 'Aman Tokyo',
            included: ['טיסות', 'מלון', 'JR Pass'],
            reviewsCount: 467,
            flightDetails: {
                departure: '23:00',
                arrival: '15:00+1',
                class: 'תיירים'
            },
            attractions: ['שיבויה', 'אקיהברה', 'אסאקוסה']
        },
        {
            id: 41,
            destination: 'באלי, אינדונזיה',
            image: '/images/baliI.jpg',
            price: 3999,
            originalPrice: 5599,
            discount: 29,
            dates: '1-15 פברואר 2026',
            rating: 4.7,
            airline: 'Qatar Airways',
            flightTime: '14 שעות',
            category: 'asia',
            hotel: 'ריזורט',
            hotelName: 'Bulgari Resort Bali',
            included: ['טיסות', 'מלון', 'ארוחות'],
            reviewsCount: 288,
            flightDetails: {
                departure: '20:00',
                arrival: '14:00+1',
                class: 'תיירים'
            },
            attractions: ['אובוד', 'אולוואטו', 'טרסות אורז']
        },
        {
            id: 42,
            destination: 'סנטוריני, יוון',
            image: '/images/santorini.jpg',
            price: 2899,
            originalPrice: 4199,
            discount: 31,
            dates: '10-17 מרץ 2026',
            rating: 4.6,
            airline: 'Aegean',
            flightTime: '4 שעות',
            category: 'europe',
            hotel: 'מלון בוטיק',
            hotelName: 'Grace Santorini',
            included: ['טיסות', 'מלון'],
            reviewsCount: 201,
            flightDetails: {
                departure: '08:00',
                arrival: '12:00',
                class: 'תיירים'
            },
            attractions: ['אויה', 'פירה', 'חוף קאמארי']
        },
        {
            id: 43,
            destination: 'פראג, צ\'כיה',
            image: '/images/prague.jpg',
            price: 1799,
            originalPrice: 2599,
            discount: 31,
            dates: '5-12 פברואר 2026',
            rating: 4.7,
            airline: 'Smartwings',
            flightTime: '4.5 שעות',
            category: 'europe',
            hotel: 'מלון 3 כוכבים',
            hotelName: 'Hotel Paris Prague',
            included: ['טיסות', 'מלון'],
            reviewsCount: 233,
            flightDetails: {
                departure: '10:00',
                arrival: '14:30',
                class: 'תיירים'
            },
            attractions: ['גשר קארל', 'טירה', 'שעון']
        },
        {
            id: 44,
            destination: 'איסטנבול, טורקיה',
            image: '/images/istanbul.jpg',
            price: 1899,
            originalPrice: 2699,
            discount: 30,
            dates: '1-8 אפריל 2026',
            rating: 4.8,
            airline: 'Pegasus',
            flightTime: '3.5 שעות',
            category: 'asia',
            hotel: 'מלון מרכזי',
            hotelName: 'Ciragan Palace Kempinski',
            included: ['טיסות', 'מלון', 'סיור'],
            reviewsCount: 341,
            flightDetails: {
                departure: '05:00',
                arrival: '08:30',
                class: 'תיירים'
            },
            attractions: ['האיה סופיה', 'הארמון הכחול', 'בזאר']
        },
        {
            id: 45,
            destination: 'פורטוגל - ליסבון',
            image: '/images/lisbon.jpg',
            price: 2199,
            originalPrice: 3199,
            discount: 31,
            dates: '10-17 נובמבר 2026',
            rating: 4.7,
            airline: 'TAP Portugal',
            flightTime: '5 שעות',
            category: 'europe',
            hotel: 'מלון בוטיק',
            hotelName: 'Pestana Palace Lisboa',
            included: ['טיסות', 'מלון', 'סיור קולינרי'],
            reviewsCount: 295,
            flightDetails: {
                departure: '09:00',
                arrival: '14:00',
                class: 'תיירים'
            },
            attractions: ['בלם', 'אלפמה', 'חשמלית']
        },
        {
            id: 50,
            destination: 'ברלין, גרמניה',
            image: '/images/berlin.jpg',
            price: 2199,
            originalPrice: 3129,
            discount: 30,
            dates: '5-10 מאי 2026',
            rating: 4.6,
            airline: 'Lufthansa',
            flightTime: '4.5 שעות',
            category: 'europe',
            hotel: 'מלון 4 כוכבים במרכז',
            hotelName: 'Hilton Berlin',
            included: ['טיסות הלוך חזור', 'מלון + ארוחת בוקר'],
            reviewsCount: 214,
            flightDetails: {
                departure: '07:00',
                arrival: '11:30',
                class: 'תיירים'
            },
            attractions: ['שער ברנדנבורג', 'אי המוזיאונים', 'אלכסנדרפלאץ']
        },
        {
            id: 51,
            destination: 'ברלין, גרמניה',
            image: '/images/berlin.jpg',
            price: 1999,
            originalPrice: 2749,
            discount: 27,
            dates: '18-23 יוני 2026',
            rating: 4.5,
            airline: 'easyJet',
            flightTime: '4.5 שעות',
            category: 'europe',
            hotel: 'מלון 3 כוכבים',
            hotelName: 'MEININGER Berlin',
            included: ['טיסות', 'מלון', 'תחבורה ציבורית חופשית'],
            reviewsCount: 176,
            flightDetails: {
                departure: '12:30',
                arrival: '17:00',
                class: 'תיירים'
            },
            attractions: ['חומת ברלין', 'צ׳קפוינט צ׳ארלי', 'פוטסדאמר פלאץ']
        },
        {
            id: 52,
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
            hotelName: 'Hotel Zoo Berlin',
            included: ['טיסות', 'מלון מרכזי', 'ארוחת בוקר'],
            reviewsCount: 263,
            flightDetails: {
                departure: '06:15',
                arrival: '10:45',
                class: 'תיירים'
            },
            attractions: ['קתדרלת ברלין', 'טירגארטן', 'Hackescher Markt']
        },
        {
            id: 53,
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
            hotelName: 'InterContinental Berlin',
            included: ['טיסות', 'מלון', 'ספא', 'ארוחת בוקר'],
            reviewsCount: 301,
            flightDetails: {
                departure: '09:30',
                arrival: '14:00',
                class: 'תיירים'
            },
            attractions: ['מגדל הטלוויזיה', 'Kurfürstendamm', 'גן החיות של ברלין']
        },
        {
            id: 54,
            destination: 'ברלין, גרמניה',
            image: '/images/berlin.jpg',
            price: 2099,
            originalPrice: 3019,
            discount: 30,
            dates: '5-10 דצמבר 2026',
            rating: 4.4,
            airline: 'Ryanair',
            flightTime: '4.5 שעות',
            category: 'europe',
            hotel: 'מלון ליד שווקי חג המולד',
            hotelName: 'Mercure Berlin Mitte',
            included: ['טיסות', 'מלון', 'סיור חורפי מודרך'],
            reviewsCount: 189,
            flightDetails: {
                departure: '15:00',
                arrival: '19:30',
                class: 'תיירים'
            },
            attractions: ['שווקי חג המולד', 'Gendarmenmarkt', 'סיור אורות חורף']
        }
    ];

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

    return (
        <div className="deal-details-page">
            {/* Hero Section with Destination Background */}
            <section className="destination-hero" style={{ backgroundImage: `url(${mainDeal.image})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content-details">
                    <button onClick={() => navigate('/deals')} className="btn-back-floating">
                        ← חזרה לדילים
                    </button>
                    <h1 className="destination-title">{mainDeal.destination}</h1>
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
