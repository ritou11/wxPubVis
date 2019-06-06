import React, { Component } from 'react';
import * as _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import * as d3 from 'd3';
import 'd3-selection-multi';

const colormap = (n) => {
  let b;
  if (!n) return 'hsl(0,0%,80%)';
  if (n < 0.5) b = 0;
  else b = (n - 0.5) * 2;
  return `hsl(${180 - 180 * b},50%,50%)`;
};

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

class VisRelated extends Component {
  constructor(props) {
    super(props);
    this.name = this.constructor.name.toLowerCase();
    this.id = _.uniqueId(`${this.name}-`);
    this.defaultSettings = {
      margin: { top: 10, right: 0, bottom: 10, left: 0 },
      textMargin: { top: 10, right: 30, bottom: 10, left: 10 },
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
        width: this.settings.outerR * 2
          + this.settings.margin.left + this.settings.margin.right
          + this.settings.textMargin.left + this.settings.textMargin.right,
        height: this.settings.outerR * 2
          + this.settings.margin.top + this.settings.margin.bottom
          + this.settings.textMargin.top + this.settings.textMargin.bottom,
      });
    this.mainGroup = this.svg.append('g')
      .attr('transform', `translate(${this.settings.margin.left
        + this.settings.textMargin.left + this.settings.outerR * 2},${this.settings.margin.top
        + this.settings.textMargin.top})rotate(90)`);
  }

  drawChart() {
    if (!this.props.data || !this.props.data.length) return;
    const { data, classes } = this.props;
    const sts = this.settings;

    const drawData = _.slice(data, 1);
    const rScale = d3.scaleLinear()
      .domain([0, _.maxBy(drawData, (d) => d.simi).simi])
      .range([0, sts.outerR]);
    const sumread = _.sumBy(drawData, (d) => d.info.readNum);
    const aScale = d3.scaleLinear()
      .domain([0, sumread])
      .range([0, Math.PI * 2]);
    let tread = 0;
    for (let i = 0; i < drawData.length; i += 1) {
      drawData[i].a0 = aScale(tread);
      tread += drawData[i].info.readNum;
      drawData[i].a1 = aScale(tread);
    }

    const toolTips = d3.select('body').append('div')
      .attr('class', 'toolTips')
      .style('opacity', 0)
      .style('position', 'absolute');

    const arcs = this.mainGroup.selectAll('.arcs')
      .data(drawData)
      .enter()
      .append('g')
      .attr('class', (d, i) => `g-violin single-violin-${i}`)
      .attr('transform', `translate(${sts.outerR},${sts.outerR})`);
    arcs.append('a')
      .attr('xlink:href', (d) => `postvis?pid=${d.pId}`)
      .append('path')
      .attr('fill', (d) => colormap(d.info.senti))
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius((d) => rScale(d.simi))
        .startAngle((d) => d.a1)
        .endAngle((d) => d.a0)
        .padAngle(0.01))
      .on('mouseover', (dd, i, nodes) => {
        d3.select(nodes[i])
          .transition()
          .style('opacity', 0.7)
          .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(1.2 * rScale(dd.simi))
            .startAngle(dd.a1)
            .endAngle(dd.a0)
            .padAngle(0.01))
          .ease(d3.easeBounceOut);
      })
      .on('mousemove', (d) => {
        const mouseX = d3.event.clientX + 30;
        const mouseY = d3.event.clientY - 30;
        toolTips.html(`<div class="border ${classes.toltip}">
            <p>${d.info.title}</p>
            <p>阅读量:${d.info.readNum} 点赞数:${d.info.likeNum}</p>
          </div>`)
          .style('opacity', 1)
          .style('left', `${mouseX}px`)
          .style('top', `${mouseY}px`);
      })
      .on('mouseout', (dd, i, nodes) => {
        d3.select(nodes[i])
          .transition()
          .style('opacity', 1)
          .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(rScale(dd.simi))
            .startAngle(dd.a1)
            .endAngle(dd.a0)
            .padAngle(0.01))
          .ease(d3.easeBounceOut);
        toolTips.style('opacity', 0);
        toolTips.html('');
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

export default withStyles(styles)(VisRelated);
