import { rgbColor } from '../../utils';

import { useRef, useEffect } from 'react';

const Poly = ({ data }) => {
  const { FCol, FillCol, LWidth, Points, FStyle, Visible } = data?.Properties;

  const parentSize = JSON.parse(localStorage.getItem('formDimension'));
  const hasFCol = data?.Properties.hasOwnProperty('FCol');

  return (
    <div id={data?.ID} style={{ position: 'absolute', display: Visible == 0 ? 'none' : 'block' }}>
      <svg height={parentSize && parentSize[0]} width={parentSize && parentSize[1]}>
        {Points?.map((polygonPoints, index) => {
          const flatArray =
            polygonPoints && polygonPoints[0].map((x, i) => [polygonPoints[1][i], x]);

          return (
            <polygon
              id={index}
              key={index}
              points={flatArray && flatArray.flat().join(' ')}
              fill={FStyle && FStyle[index] == '-1' ? 'none' : FillCol && rgbColor(FillCol[index])}
              stroke={hasFCol ? FCol && rgbColor(FCol[index]) : 'rgb(0,0,0)'}
              stroke-width={LWidth && LWidth[index]}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default Poly;
