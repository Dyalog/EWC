import { useRef, useEffect } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);

  const draw = (ctx) => {
    ctx.beginPath();
    ctx.rect(0, 0, 220, 220);
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    //Our draw come here
    draw(context);
  }, [draw]);

  return <canvas style={{ background: 'red', width: '220px', height: '220px' }} ref={canvasRef} />;
};

export default Canvas;
