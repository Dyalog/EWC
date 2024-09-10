import { useEffect, useState } from 'react';

const useActiveElement = () => {
  const [activeElementId, setActiveElementId] = useState(null);
  useEffect(() => {
    const handleFocusIn = () => {
      const activeElement = document.activeElement;
      setActiveElementId(activeElement ? activeElement.id : null);
    };

    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []); // Empty dependency array ensures that the effect runs only once during component mount

  return activeElementId;
};

export default useActiveElement;
