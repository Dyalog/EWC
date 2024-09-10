import { rgbColor } from '../../utils';

const Ecllipse = ({ data }) => {
  const parentSize = JSON.parse(localStorage.getItem('formDimension'));

  const { FillCol, Start, FCol, Size, End, Points } = data?.Properties;

  const generatePieChartPaths = (startAngles, Points) => {
    // const myPoints = Points && Points[0];
    // const myPoints2 = Points && Points[1];

    const cx = Size && Size[1] / 2 + 10;
    const cy = Size && Size[0] / 2 + 10;
    const rx = Size && Size[1] / 2;
    const ry = Size && Size[0] / 2;

    const paths = [];

    for (let i = 0; i < startAngles?.length; i++) {
      const startAngle = -startAngles[i];
      const endAngle = i === startAngles?.length - 1 ? 2 * Math.PI : -startAngles[i + 1];

      const startX = cx + rx * Math.cos(startAngle);
      const startY = cy + ry * Math.sin(startAngle);
      const endX = cx + rx * Math.cos(endAngle);
      const endY = cy + ry * Math.sin(endAngle);

      const path = `
                M ${cx},${cy}
                L ${startX},${startY}
                A ${rx},${ry} 0 0,0 ${endX},${endY}
                Z
            `;

      paths.push({
        d: path,
        fill: rgbColor(FillCol && FillCol[i]),
        stroke: 'black',
        strokeWidth: '1',
      });
    }

    return paths;
  };

  const generatePieChartPathsWithEnd = (startAngles, endAngles, Points) => {
    // console.log('1', Points && Points[0][0]);
    // console.log('2', Points && Points[1][0]);
    const cx = (Size && Size[1] / 2) + 10;
    const cy = (Size && Size[0] / 2) + 250;
    const rx = Size && Size[1] / 2;
    const ry = Size && Size[0] / 2;

    console.log({ Start });
    console.log({ End });

    const paths = [];

    for (let i = 0; i < startAngles.length; i++) {
      const startAngle = -startAngles[i];
      const endAngle = -endAngles[i];

      const startX = cx + rx * Math.cos(startAngle);
      const startY = cy + ry * Math.sin(startAngle);
      const endX = cx + rx * Math.cos(endAngle);
      const endY = cy + ry * Math.sin(endAngle);

      const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'; // Determine large arc flag

      const path = `
      M ${cx},${cy}
      L ${startX},${startY}
      A ${rx},${ry} 0 ${largeArcFlag},0 ${endX},${endY}
      Z
    `;

      paths.push({
        d: path,
        fill: rgbColor(FillCol && FillCol[i]),
        stroke: 'black',
        strokeWidth: '1',
      });
    }

    return paths;
  };

  const paths = !End
    ? generatePieChartPaths(Start, Points)
    : generatePieChartPathsWithEnd(Start, End, Points);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <svg height={parentSize && parentSize[0]} width={parentSize && parentSize[1]}>
        {/* <rect x='10' y='10' width='400' height='300' fill='none'> */}

        {paths.map((path, index) => (
          <path
            key={index}
            d={path.d}
            fill={path.fill}
            stroke={path.stroke}
            strokeWidth={path.strokeWidth}
          />
        ))}
      </svg>
    </div>
  );
};
export default Ecllipse;

// Correct value for the Pie Chart
/* <path
          d='M 210,160 L 410,160 A 200,150 0 0,0 357.682,53.097 Z'
          fill='#ff0000'
          stroke='black'
          strokeWidth='1'
        />
        <path
          d='M 210,160 L 357.682,53.097 A 200,150 0 0,0 70.757,59.502 Z'
          fill='#00ff00'
          stroke='black'
          strokeWidth='1'
        />
        <path
          d='M 210,160 L  70.757,59.502 A 200,150 0 0,0 151.36,309.94 Z'
          fill='#ffff00'
          stroke='black'
          strokeWidth='1'
        />
        <path
          d='M 210,160 L 151.36,309.94 A 200,150 0 0,0 410,160 Z'
          fill='#0000ff'
          stroke='black'
          strokeWidth='1'
        /> */
