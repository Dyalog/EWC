import ReactApexChart from 'react-apexcharts';
import { useAppData } from '../../hooks';
import { setStyle } from '../../utils';
import { useEffect, useRef, useState } from 'react';

const Chart = ({ data }) => {
  const { Options, Posn, Series, Size, ChartType, Event } = data?.Properties;

  const [chartSvg, setChartSvg] = useState(null);
  const { socket, handleData } = useAppData();
  const styles = setStyle(data?.Properties);

  const stringifyCircularJSON = (obj) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (k, v) => {
      if (v !== null && typeof v === 'object') {
        if (seen.has(v)) return;
        seen.add(v);
      }
      return v;
    });
  };

  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      setTimeout(() => {
        const chartInstance = chartRef.current.chart.paper(); 
        const svg = chartInstance.svg();
        if (svg) {
          setChartSvg(svg);
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
  

  const sendEvent = (event, chartContext, config, chartConfig) => {
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
        // Info: [stringifyCircularJSON(chartContext), stringifyCircularJSON(config)],
        Info: [JSON.stringify(obj)],
      },
    });
    console.log(Event);
    socket.send(Event);
  };
  
  // const options = {
  //   chart: {
  //     parentHeightOffset: 0,
  //     toolbar: { show: false },
  //   },
  //   plotOptions: {
  //     bar: {
  //       borderRadius: 6,
  //       borderRadiusApplication: 'end',
  //       distributed: true,
  //       columnWidth: '35%',
  //       startingShape: 'rounded',
  //       dataLabels: { position: 'top' },
  //     },
  //   },
  //   legend: { show: false },
  //   tooltip: { enabled: false },
  //   dataLabels: {
  //     offsetY: -15,
  //     // formatter: (val) => `${val}k`,
  //     style: {
  //       fontWeight: 600,
  //       fontSize: '1rem',
  //       colors: ['#4b465c'],
  //     },
  //   },
  //   grid: {
  //     show: false,
  //   },
  //   xaxis: {
  //     axisTicks: { show: false },
  //     axisBorder: {
  //       color: 'gray',
  //     },
  //     categories: Options?.xaxis.categories,
  //     labels: {
  //       style: {
  //         fontSize: '13px',
  //         colors: [1, 2].map(() => 'red'),
  //         fontWeight: 400,
  //         fontFamily: 'Poppins',
  //       },
  //     },
  //   },
  //   yaxis: {
  //     min: Options?.yMin,
  //     max: Options?.yMax,
  //     tickAmount: Options?.Intervals,
  //     labels: {
  //       offsetX: -15,
  //       style: {
  //         fontSize: '13px',
  //         fontWeight: 400,
  //         colors: ['#22292f80'],
  //         fontFamily: 'Poppins',
  //       },
  //     },
  //   },
  //   responsive: [
  //     {
  //       options: {
  //         plotOptions: {
  //           bar: { columnWidth: '60%' },
  //         },
  //         grid: {
  //           padding: { right: 20 },
  //         },
  //       },
  //     },
  //   ],
  // };

  console.log("chart",chartSvg)
  // console.log("chart", data)


  // const getCurve = {
  //   bar: "straight",
  //   MOVAVG:"straight",
  // }

  

  const options = {
    ...Options,
    chart: {
      events: {
        ...(Event?.some((item) => item[0] === 'click') && {
          click: (chartContext, config, chartConfig) =>
            sendEvent('click', chartContext, config, chartConfig),
        }),
        ...(Event?.some((item) => item[0] === 'legendclick') && {
          legendClick: (chartContext, config, chartConfig) =>
            sendEvent('legendclick', chartContext, config, chartConfig),
        }),
      },
    },
    // stroke: { curve: 'smooth'}
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
