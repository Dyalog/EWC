import ReactApexChart from 'react-apexcharts';
import { useAppData } from '../../hooks';
import { setStyle } from '../../utils';
import { useEffect, useRef } from 'react';

const Chart = ({ data }) => {
  const { Options, Posn, Series, Size, ChartType, Event } = data?.Properties;

  const { socket, handleData } = useAppData();
  const styles = setStyle(data?.Properties);

  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      setTimeout(() => {
        const chartInstance = chartRef.current.chart.paper(); 
        const svg = chartInstance.svg();
        if (svg) {
          localStorage.setItem(data.ID, JSON.stringify(svg));
          handleData(
            {
              ID: data?.ID,
              Properties: {
                SVG: svg,
              },
            },
            'WS'
          );
        }
      }, 500); 
    }
  }, [chartRef.current]);
  

  const sendEvent = (event, chartConfig) => {
    const obj = {
      dataPointIndex: chartConfig?.dataPointIndex,
      seriesIndex: chartConfig?.seriesIndex,
      series: chartConfig?.config?.series,
      xaxis: chartConfig?.config?.xaxis,
      yaxis: chartConfig?.config?.yaxis,
    };

    const Event = JSON.stringify({
      Event: {
        ID: data?.ID,
        EventName: event,
        Info: [JSON.stringify(obj)],
      },
    });
    socket.send(Event);
  };
  
  const options = {
    ...Options,
    chart: {
      events: {
        ...(Event?.some((item) => item[0] === 'click') && {
          click: (chartConfig) =>
            sendEvent('click', chartConfig),
        }),
        ...(Event?.some((item) => item[0] === 'legendclick') && {
          legendClick: (chartConfig) =>
            sendEvent('legendclick', chartConfig),
        }),
      },
    },
  };

  return (
    <div style={{ position: 'absolute', top: Posn && Posn[0], left: Posn && Posn[1], ...styles }}>
      <ReactApexChart
        ref={chartRef}  
        options={options}
        width={Size && Size[1]}
        height={Size && Size[0]}
        type={ChartType}
        series={Series}
      />
    </div>
  );
};

export default Chart;
