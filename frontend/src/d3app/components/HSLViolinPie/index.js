import React, { Component } from 'react';
import * as _ from 'lodash';
import * as d3 from 'd3';
import 'd3-selection-multi';
import { hslColorGenerator } from '../../utils';

class HSLViolinPie extends Component {
  constructor(props) {
    super(props);
    this.name = this.constructor.name.toLowerCase();
    this.id = _.uniqueId(`${this.name}-`);
    this.defaultSettings = {
      select: 1, // 1 for saturation; 2 for lightness
      xticks: 50,
      yticks: 10,
      margin: { top: 10, right: 0, bottom: 10, left: 0 },
      textMargin: { top: 10, right: 30, bottom: 10, left: 10 },
      color: 'blue',
      color1: '#ffffff',
      color2: '#eeeeee',
      sqrt: false,
    };
    this.settings = _.merge(this.defaultSettings, props.settings);
    if (!this.settings.imgPath) this.settings.innerR = 0;
  }

  componentDidMount() {
    this.initChart();
    this.drawChart();
  }

  componentDidUpdate() {
    if (this.settings.innerR !== this.props.settings.innerR
        || this.settings.outerR !== this.props.settings.outerR
        || this.settings.margin !== this.props.settings.margin
        || this.settings.textMargin !== this.props.settings.textMargin) {
      if (this.svg) this.svg.remove();
      this.initChart();
    }
    this.settings = _.merge(this.defaultSettings, this.props.settings);
    if (!this.settings.imgPath) this.settings.innerR = 0;
    this.mainGroup.selectAll('*').remove();
    this.axisGroup.selectAll('*').remove();
    this.drawChart();
  }

  initChart() {
    this.svg = d3.select(this.container)
      .append('svg')
      .attrs({
        class: `${this.name}-svg`,
        width: this.settings.outerR * 2
          + this.settings.margin.left + this.settings.margin.right
          + this.settings.textMargin.left + this.settings.textMargin.right,
        height: this.settings.outerR * 2
          + this.settings.margin.top + this.settings.margin.bottom
          + this.settings.textMargin.top + this.settings.textMargin.bottom,
      });
    this.imgGroup = this.svg.append('g')
      .attr('transform', `translate(${this.settings.margin.left
        + this.settings.textMargin.left},${this.settings.margin.top
        + this.settings.textMargin.top})`);
    this.mainGroup = this.svg.append('g')
      .attr('transform', `translate(${this.settings.margin.left
        + this.settings.textMargin.left + this.settings.outerR * 2},${this.settings.margin.top
        + this.settings.textMargin.top})rotate(90)`);
    this.axisGroup = this.svg.append('g')
      .attr('transform', `translate(${this.settings.margin.left},${this.settings.margin.top})`);
  }

  drawChart() {
    if (!this.props.data || !this.props.data.length) return;
    const sts = this.settings;
    const sqrt = sts.sqrt ? Math.sqrt : (d) => d;

    const xScale = d3.scaleLinear()
      .domain([0, 360])
      .range([0, Math.PI * 2]);
    const dvd = d3.histogram()
      .domain(xScale.domain())
      .thresholds(36)
      .value((d) => d[0]);
    const hbins = dvd(this.props.data);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([sts.innerR, sts.outerR]);
    const histogram = d3.histogram()
      .domain(yScale.domain())
      .thresholds(yScale.ticks(sts.xticks));

    const binWidth = xScale(hbins[0].x1) - xScale(hbins[0].x0);
    const maxX = _.max(_.map(hbins,
      (b) => _.max(_.map(histogram(
        _.map(b, (t) => t[sts.select]),
      ), (c) => c.length))));
    const xNum = d3.scaleLinear()
      .range([0, binWidth])
      .domain([-sqrt(maxX) * 0.8, sqrt(maxX) * 0.8]);

    const apt = this.mainGroup.selectAll('.g-violin')
      .data(hbins)
      .enter()
      .append('g')
      .attr('class', (d, i) => `g-violin single-violin-${i}`)
      .attr('transform', `translate(${sts.outerR},${sts.outerR})`);
    apt.append('path')
      .attr('fill', (d, i) => (i % 2 === 0 ? sts.color1 : sts.color2))
      .attr('d', d3.arc()
        .innerRadius(sts.innerR)
        .outerRadius(sts.outerR)
        .startAngle((d) => xScale(d.x1))
        .endAngle((d) => xScale(d.x0))
        .padAngle(0.01)
        .padRadius(sts.innerR));
    apt.append('defs')
      .append('clipPath')
      .attr('id', (d, i) => `${this.id}-mask-${i}`)
      .style('pointer-events', 'none')
      .append('path')
      // reverse transform
      .attr('transform', (d) => `rotate(${-d.x0})`)
      .attr('d', d3.arc()
        .innerRadius(sts.innerR)
        .outerRadius(sts.outerR)
        .startAngle((d) => xScale(d.x1))
        .endAngle((d) => xScale(d.x0))
        .padAngle(0.01)
        .padRadius(sts.innerR));
    apt.select('defs')
      .append('radialGradient')
      .attrs((d, i) => ({
        id: `${this.id}-area-gradient${i}`,
        gradientUnits: 'userSpaceOnUse',
        cx: 0,
        cy: 0,
        r: sts.outerR,
        fr: sts.innerR,
      }))
      .selectAll('stop')
      .data((d) => hslColorGenerator(sts.select, { h: (d.x0 + d.x1) / 2, s: 0.5, l: 0.5 }))
      .enter()
      .append('stop')
      .attr('offset', (d) => d.offset)
      .attr('stop-color', (d) => d.color);
    apt.append('path')
      .attr('transform', (d) => `rotate(${d.x0})`)
      .datum((d) => histogram(_.map(d, (t) => t[sts.select])))
      .style('stroke', 'none')
      .style('fill', (d, i) => `url(#${this.id}-area-gradient${i})`)
      .attr('clip-path', (d, i) => `url(#${this.id}-mask-${i})`)
      .attr('d', d3.areaRadial()
        .startAngle((d) => xNum(-sqrt(d.length)))
        .endAngle((d) => xNum(sqrt(d.length)))
        .radius((d) => yScale(d.x0))
        .curve(d3.curveCatmullRom));
    // -------- axis --------
    this.axisGroup.append('defs')
      .append('marker')
      .attrs({
        id: `${this.id}-arrow`,
        markerUnits: 'strokeWidth',
        markerWidth: 12,
        markerHeight: 12,
        viewBox: '0 0 12 12',
        refX: 6,
        refY: 6,
        orient: 'auto',
      })
      .append('path')
      .attrs({
        d: 'M2,2 L10,6 L2,10 L6,6 L2,2',
        style: 'fill: #000000;',
      });
    this.axisGroup.append('g')
      .attr('class', 'g-xAxis')
      .attr('transform', `translate(${sts.textMargin.left},${sts.textMargin.top})`)
      .append('line')
      .attrs({
        x1: sts.outerR,
        y1: sts.outerR,
        x2: sts.outerR * 2 + sts.textMargin.right,
        y2: sts.outerR,
        stroke: 'black',
        'stroke-width': 1.5,
        'marker-end': `url(#${this.id}-arrow)`,
      });
    this.axisGroup.append('g')
      .attr('class', 'g-yAxis')
      .attr('transform', `translate(${sts.textMargin.left + sts.outerR},${sts.textMargin.top})`)
      .append('path')
      .attrs({
        d: `M${-sts.outerR} ${sts.outerR} A${sts.outerR} ${sts.outerR} 0 1 1 0 ${sts.outerR * 2}`,
        stroke: 'black',
        fill: 'none',
        'stroke-width': 1.5,
        'marker-end': `url(#${this.id}-arrow)`,
      });
    this.axisGroup.append('text')
      .attrs({
        'text-anchor': 'middle',
        fill: 'black',
        'font-size': '12px',
        transform: `translate(${sts.outerR + sts.textMargin.left - 20},${sts.outerR * 2 + sts.textMargin.top})`,
      })
      .text('Hue');
    this.axisGroup.append('text')
      .attrs({
        'text-anchor': 'middle',
        fill: 'black',
        'font-size': '12px',
        transform: `translate(${sts.outerR * 2 + sts.textMargin.right - 20},${sts.outerR + 5})`,
      })
      .text((['Saturation', 'Lightness'])[sts.select - 1]);
    if (sts.imgPath) {
      this.imgGroup
        .append('image')
        .attrs({
          x: sts.outerR - sts.innerR * Math.sqrt(2) / 2,
          y: sts.outerR - sts.innerR * Math.sqrt(2) / 2,
          width: sts.innerR * Math.sqrt(2),
          height: sts.innerR * Math.sqrt(2),
          'xlink:href': sts.imgPath,
        });
    }
  }

  render() {
    return (
      <div className={`${this.name}-chart`} id={this.id}
        ref={(c) => { this.container = c; }} style={{ textAlign: 'center' }}>
      </div>
    );
  }
}

export default HSLViolinPie;
