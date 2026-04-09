import { useState, useEffect } from 'react';

const useDestinationInfo = (destination) => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!destination) return;

    // חילוץ שם העיר בלבד (לפני הפסיק)
    const cityName = destination.split(",")[0].trim();

    fetch(`/api/destination-info?destination=${encodeURIComponent(cityName)}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => setInfo(data))
      .catch(() => setInfo(null));
  }, [destination]);

  return info;
};

export default useDestinationInfo;
