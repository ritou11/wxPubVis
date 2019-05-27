import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default class VisActivityLine extends React.Component {
  render() {
    const { data, height, width, title } = this.props;
    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          chart: {
            zoomType: 'x',
            height,
            width,
          },
          title: {
            text: title,
          },
          tooltip: {
            enabled: false,
          },
          xAxis: {
            type: 'datetime',
          },
          yAxis: {
            min: 0,
            title: {
              text: '活跃度',
            },
          },
          legend: {
            enabled: false,
          },
          plotOptions: {
            scatter: {
              marker: {
                radius: 3,
              },
            },
          },
          series: [{
            name: '活跃度',
            type: 'area',
            turboThreshold: 10000,
            data,
          }],
        }}
      />
    );
  }
}
