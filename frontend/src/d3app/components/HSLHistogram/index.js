import React, { Component } from 'react';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { hslColorGenerator } from '../../utils';

class HSLHistogram extends Component {
  constructor(props) {
    super(props);
    this.name = this.constructor.name.toLowerCase();
    this.id = _.uniqueId(`${this.name}-`);
    this.defaultSettings = {
      width: 400,
      height: 200,
      xticks: 20,
      yticks: 10,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      textMargin: { top: 10, right: 10, bottom: 40, left: 40 },
      select: 1,
    };
    this.settings = _.merge(this.defaultSettings, props.settings);
  }

  componentDidMount() {
    this.initChart();
    this.drawChart();
  }

  componentDidUpdate() {
    if (this.settings.width !== this.props.settings.width
      || this.settings.height !== this.props.settings.height) {
      if (this.svg) this.svg.remove();
      this.initChart();
    }
    this.settings = _.merge(this.defaultSettings, this.props.settings);
    this.mainGroup.selectAll('*').remove();
    this.axisGroup.selectAll('*').remove();
    this.drawChart();
  }

  initChart() {
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.settings.width)
      .attr('height', this.settings.height);
    this.mainGroup = this.svg.append('g')
      .attr('transform', `translate(${this.settings.margin.left
        + this.settings.textMargin.left},${this.settings.margin.top
        + this.settings.textMargin.top})`);
    this.axisGroup = this.svg.append('g')
      .attr('transform', `translate(${this.settings.margin.left},${this.settings.margin.top})`);
  }

  drawChart() {
    if (!this.props.data || !this.props.data.length) return;
    const sts = this.settings;
    const widthAval = sts.width - sts.margin.left - sts.margin.right
                    - sts.textMargin.left - sts.textMargin.right;
    const heightAval = sts.height - sts.margin.top - sts.margin.bottom
                    - sts.textMargin.top - sts.textMargin.bottom;

    const data = _.map(this.props.data, (d) => d[sts.select]);

    const maxX = sts.xmax || _.max(data);
    const minX = sts.xmin || _.min(data);
    const xScale = d3.scaleLinear()
      .domain([minX, maxX])
      .range([0, widthAval]);
    const histogram = d3.histogram()
      .domain([minX, maxX])
      .thresholds(xScale.ticks(sts.xticks));
    const bins = histogram(data);
    const maxY = _.max(_.map(bins, (b) => b.length));

    // thought histogram use [x0, x1), we have to combine the last two bins to draw
    const lenBins = bins.length;
    if (lenBins > 1 && bins[lenBins - 1].x0 === bins[lenBins - 1].x1) {
      const xb0 = bins[lenBins - 2].x0;
      const xb1 = bins[lenBins - 2].x1;
      bins[lenBins - 2] = _.concat(bins[lenBins - 2], bins[lenBins - 1]);
      bins[lenBins - 2].x0 = xb0;
      bins[lenBins - 2].x1 = xb1;
      bins.pop();
    }

    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([heightAval, 0]);

    this.mainGroup.append('defs')
      .append('linearGradient')
      .attrs({
        id: `${this.id}-area-gradient`,
        gradientUnits: 'userSpaceOnUse',
        x1: sts.margin.left,
        y1: '0%',
        x2: sts.margin.left + widthAval,
        y2: '0%',
      })
      .selectAll('stop')
      .data(hslColorGenerator(sts.select, { h: 0, s: 0.5, l: 0.5 }))
      .enter()
      .append('stop')
      .attr('offset', (d) => d.offset)
      .attr('stop-color', (d) => d.color);

    this.mainGroup.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('id', (d, i) => `${this.id}-rect-${i}`)
      .attr('x', (d) => xScale(d.x0) + sts.margin.left)
      .attr('y', (d) => yScale(d.length))
      .attr('width', (d) => (xScale(d.x1) - xScale(d.x0)) * 0.98)
      .attr('height', (d) => heightAval - yScale(d.length))
      .attr('fill', `url(#${this.id}-area-gradient)`);
    // -------- axis --------
    const xAxis = d3.axisBottom()
      .scale(xScale)
      .ticks(_.min([20, sts.xticks]));
    const yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(sts.yticks)
      .tickFormat(d3.format('d'));
    this.axisGroup.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${sts.textMargin.left},${heightAval + sts.textMargin.top})`)
      .call(xAxis);
    this.axisGroup.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${sts.textMargin.left},${sts.textMargin.top})`)
      .call(yAxis);
    this.axisGroup.append('text')
      .attrs({
        'text-anchor': 'middle',
        fill: 'black',
        'font-size': '12px',
        transform: `translate(${widthAval / 2 + sts.textMargin.left},${heightAval + 30 + sts.textMargin.top})`,
      })
      .text(['Hue', 'Saturation', 'Lightness'][sts.select]);
  }

  render() {
    return (
      <div className={`${this.name}-chart`} id={this.id}
        ref={(c) => { this.container = c; }} style={{ textAlign: 'center' }}>
      </div>
    );
  }
}

export default HSLHistogram;
