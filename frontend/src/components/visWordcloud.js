import React, { Component } from 'react';
import * as _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import 'd3-selection-multi';

const styles = {
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  toltip: {
    padding: '8px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderRadius: '3px',
    '& p': {
      margin: '0',
    },
  },
};

class VisWordcloud extends Component {
  constructor(props) {
    super(props);
    this.name = this.constructor.name.toLowerCase();
    this.id = _.uniqueId(`${this.name}-`);
    this.defaultSettings = {
      margin: { top: 10, right: 0, bottom: 10, left: 0 },
      textMargin: { top: 10, right: 30, bottom: 10, left: 20 },
      color: 'blue',
      sqrt: false,
    };
    this.settings = _.merge(this.defaultSettings, props.settings);
  }

  componentDidMount() {
    this.initChart();
    this.drawChart();
  }

  componentDidUpdate() {
    if (this.settings.outerR !== this.props.settings.outerR
        || this.settings.margin !== this.props.settings.margin
        || this.settings.textMargin !== this.props.settings.textMargin) {
      if (this.svg) this.svg.remove();
      this.initChart();
    }
    this.settings = _.merge(this.defaultSettings, this.props.settings);
    this.mainGroup.selectAll('*').remove();
    this.drawChart();
  }

  initChart() {
    this.svg = d3.select(this.container)
      .append('svg')
      .attrs({
        class: `${this.name}-svg`,
        width: this.settings.width
          + this.settings.margin.left + this.settings.margin.right
          + this.settings.textMargin.left + this.settings.textMargin.right,
        height: this.settings.height
          + this.settings.margin.top + this.settings.margin.bottom
          + this.settings.textMargin.top + this.settings.textMargin.bottom,
      });
    this.mainGroup = this.svg.append('g')
      .attr('transform', `translate(${this.settings.margin.left
        + this.settings.textMargin.left},${this.settings.margin.top
        + this.settings.textMargin.top + this.settings.height / 2})`);
    this.axisGroup = this.svg.append('g')
      .attr('transform', `translate(${this.settings.margin.left
        + this.settings.textMargin.left},${this.settings.margin.top
        + this.settings.textMargin.top + this.settings.height / 2})`);
  }

  drawChart() {
    if (!this.props.data || !this.props.data.length) return;
    const { data } = this.props;
    const sts = this.settings;

    _.forEach(data, (th) => {
      _.forEach(th.words, (wd) => { wd.freq *= th.weight; });
    });
    const countMax = _.max(_.map(data, (th) => _.maxBy(th.words, (d) => d.freq).freq));
    const sizeScale = d3.scaleLinear().domain([0, countMax]).range([8, _.max([sts.width, sts.height]) / 5]);

    const totalWeight = _.sumBy(data, (th) => th.weight);
    let cum = 0;
    for (let i = 0; i < data.length; i += 1) {
      data[i].dx = cum / totalWeight * sts.width + data[0].weight / totalWeight * sts.width / 2;
      cum += data[i].weight;
    }

    this.mainGroup.selectAll('.tgroup')
      .data(data)
      .enter()
      .append('g')
      .attrs((d) => ({
        id: `${d.theme}-group`,
        class: 'tgroup',
        transform: `translate(${d.dx},${0})`,
      }));

    _.forEach(data, (th) => {
      const drawData = _.map(th.words, (d) => ({
        text: d.name,
        size: sizeScale(d.freq),
      }));
      cloud().size([th.weight / totalWeight * sts.width, sts.height])
        .words(drawData)
        .rotate(0)
        .fontSize((d) => d.size)
        .on('end', (words) => {
          this.mainGroup.select(`#${th.theme}-group`)
            .selectAll('text')
            .data(words)
            .enter()
            .append('text')
            .style('font-size', (d) => `${d.size}px`)
            .style('font-weight', '400')
            .style('font-family', 'Roboto', 'Helvetica', 'Arial', 'sans-serif')
            .style('fill', (d, i) => d3.schemeCategory10[i % 10])
            .attr('text-anchor', 'middle')
            .attr('transform', (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
            .text((d) => d.text);
        })
        .start();
    });

    this.axisGroup.selectAll('.hline')
      .append('line')
      .attrs({
        class: 'hline',
        x1: 0,
        y1: 0,
        x2: sts.width,
        y2: 0,
        stroke: 'black',
        'stroke-width': 1.5,
        'marker-end': `url(#${this.id}-arrow)`,
      });
  }

  render() {
    return (
      <div className={`${this.name}-chart`} id={this.id}
        ref={(c) => { this.container = c; }} style={{ textAlign: 'center' }}>
      </div>
    );
  }
}

export default withStyles(styles)(VisWordcloud);
