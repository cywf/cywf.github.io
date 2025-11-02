import { useEffect, useRef } from 'react';
import { Chart, type ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface ChartProps {
  type: 'doughnut' | 'bar' | 'line';
  data: any;
  options?: any;
}

export function ChartComponent({ type, data, options = {} }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        ...options,
      },
    };

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options]);

  return <canvas ref={canvasRef} />;
}

export function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-base-300 rounded-lg"></div>
    </div>
  );
}
