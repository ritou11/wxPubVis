import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default class VisReadnumLine extends React.Component {
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
          xAxis: {
            type: 'datetime',
          },
          yAxis: {
            min: 0,
            max: 100000,
            title: {
              text: '阅读量',
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
            name: '阅读量',
            type: 'scatter',
            turboThreshold: 10000,
            data,
            tooltip: {
              headerFormat: '<span style="color:{point.color}">●</span> <span style="font-size: 10px">{point.key}</span><br/>',
              pointFormat: '阅读量: <b>{point.y}</b><br/>',
            },
          }],
        }}
      />
    );
  }
}
