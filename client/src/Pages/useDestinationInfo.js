import { useState, useEffect } from 'react';

const useDestinationInfo = (destination) => {
  const [info, setInfo] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (!destination) return;

    // חילוץ שם העיר בלבד (לפני הפסיק)
    const cityName = destination.split(",")[0].trim();

    fetch(`${API_BASE_URL}/destination-info?destination=${encodeURIComponent(cityName)}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => setInfo(data))
      .catch(() => setInfo(null));
  }, [destination, API_BASE_URL]);

  return info;
};

export default useDestinationInfo;
