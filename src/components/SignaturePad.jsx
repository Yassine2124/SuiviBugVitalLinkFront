import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const SignaturePad = forwardRef(function SignaturePad({ onChange, height = 180 }, ref) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const length = useRef(0);
  const signed = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ratio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a1a1a';
  }, []);

  const point = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };

  const handleMove = (e) => {
    if (!drawing.current) return;
    const p = point(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    length.current += Math.hypot(p.x - last.current.x, p.y - last.current.y);
    last.current = p;
    if (!signed.current && length.current > 25) {
      signed.current = true;
      if (onChange) onChange(true);
    }
  };

  const handleUp = () => { drawing.current = false; };

  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      length.current = 0;
      signed.current = false;
      if (onChange) onChange(false);
    },
    toDataURL() {
      return canvasRef.current.toDataURL('image/png');
    }
  }));

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      style={{
        width: '100%',
        height,
        background: 'white',
        border: '1.5px dashed #c8c8c2',
        borderRadius: 10,
        touchAction: 'none',
        cursor: 'crosshair',
        display: 'block'
      }}
    />
  );
});

export default SignaturePad;