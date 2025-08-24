import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeComponent({ value, size = 200, className }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      });
    }
  }, [value, size]);

  return (
    <div className={cn("flex justify-center", className)}>
      <canvas 
        ref={canvasRef}
        className="border border-border rounded-lg shadow-soft"
      />
    </div>
  );
}