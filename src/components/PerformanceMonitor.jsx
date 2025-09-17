import { useEffect } from 'react';

const PerformanceMonitor = ({ componentName }) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime} milliseconds`);
    };
  }, [componentName]);

  return null;
};

export default PerformanceMonitor;