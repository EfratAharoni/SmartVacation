import React, { useState, useEffect } from 'react';

const useDestinationInfo = (destination) => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch('/src/Pages/DestinationInfo.json')
      .then((res) => res.json())
      .then((data) => {
        // Try to match by destination or by country
        const found = data.find(
          (item) =>
            destination.includes(item.destination) ||
            destination.includes(item.country) ||
            item.destination.includes(destination)
        );
        setInfo(found);
      });
  }, [destination]);

  return info;
};

export default useDestinationInfo;
