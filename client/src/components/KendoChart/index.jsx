import '@progress/kendo-theme-default/dist/all.css';
import { Chart, ChartLegend, ChartLegendItem, ChartSeries, ChartSeriesItem } from '@progress/kendo-react-charts';

const KendoChart = ({ data }) => {
  const { Posn, Series, Size } = data?.Properties;

  const chartDefaultV4Colors = [
    "#ff6358",
    "#ffd246",
    "#78d237",
    "#28b4c8",
    "#2d73f5",
    "#aa46be",
  ];

  return (
    <div style={{ position: 'absolute', top: Posn && Posn[0], left: Posn && Posn[1] }}>
      <Chart
        style={{ width: Size && Size[1], height: Size && Size[0] }}
        seriesColors={chartDefaultV4Colors}
        pannable
        zoomable
      >
        <ChartLegend labels={
          Series.map((_, i) =>
            <ChartLegendItem name={"series-" + i}/>
          ) 
        }/>
        <ChartSeries>
          {
            Series.map((s, i) =>
              <ChartSeriesItem data={s.data} type="column" name={"series-" + i} />
            )
          }
        </ChartSeries>
      </Chart>
    </div>
  );
};

export default KendoChart;
