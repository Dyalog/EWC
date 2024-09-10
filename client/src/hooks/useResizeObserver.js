import { useEffect, useState } from 'react';

const useResizeObserver = (parent) => {
  const [dimensions, setDimensions] = useState({
    width: parent?.clientWidth,
    height: parent?.clientHeight,
  });

  useEffect(() => {
    if (!parent) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const { offsetWidth, offsetHeight } = entries[0].target;

      setDimensions({
        width: offsetWidth,
        height: offsetHeight,
      });
    });

    resizeObserver.observe(parent);

    return function cleanup() {
      resizeObserver.disconnect();
    };
  }, [parent]);

  return dimensions;
};

export default useResizeObserver;
