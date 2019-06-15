import React, { Component } from 'react';
import * as _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import * as d3 from 'd3';
import 'd3-selection-multi';

import VisWordcloud from './visWordcloud';

const styles = {
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  node: {
    '& text': {
      fill: 'white',
    },
    cursor: 'pointer',
  },
  tooltip: {
    position: 'fixed',
    padding: '8px',
    background: 'rgba(200, 200, 200, 0.7)',
    color: 'white',
    borderRadius: '3px',
    '& p': {
      margin: '0',
      textAlign: 'left',
    },
    zIndex: 1000,
  },
};

class VisThemebar extends Component {
  constructor(props) {
    super(props);
    this.name = this.constructor.name.toLowerCase();
    this.id = _.uniqueId(`${this.name}-`);
    this.defaultSettings = {
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      textMargin: { top: 0, right: 0, bottom: 0, left: 0 },
      color: 'blue',
      sqrt: false,
    };
    this.settings = _.merge(this.defaultSettings, props.settings);
    this.state = {
      tooltip: {
        x: 0,
        y: 0,
        opacity: 0,
        hidden: true,
      },
    };
  }

  componentDidMount() {
    this.initChart();
    this.drawChart();
  }

  componentDidUpdate() {
    // TODO: consider update
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
        + this.settings.textMargin.top})`);
  }

  drawChart() {
    if (!this.props.data || !this.props.data.length) return;
    const { data, classes } = this.props;
    const sts = this.settings;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const totalWeight = _.sumBy(data, (th) => th.weight);
    let cum = 0;
    for (let i = 0; i < data.length; i += 1) {
      data[i].dx = cum / totalWeight * sts.width;
      cum += data[i].weight;
    }

    const tgroup = this.mainGroup.selectAll(`.${classes.node}`)
      .data(data)
      .enter()
      .append('g')
      .attrs((d) => ({
        transform: `translate(${d.dx},${0})`,
        class: classes.node,
      }));

    tgroup.append('rect')
      .attrs((d) => ({
        class: 'trect',
        width: d.weight / totalWeight * sts.width,
        height: sts.height,
        fill: color(d.theme),
      }));

    tgroup
      .on('mouseover', (dd, i, nds) => {
        d3.select(nds[i])
          .select('rect')
          .transition()
          .style('opacity', 0.7)
          .ease(d3.easeBounceOut);
      })
      .on('mousemove', (d) => {
        const mouseX = d3.event.clientX + 15;
        const mouseY = d3.event.clientY - 30;
        this.setState({
          tooltip: {
            x: mouseX,
            y: mouseY,
            opacity: 1,
            hidden: false,
          },
          words: d.words,
          title: d.theme,
        });
      })
      .on('mouseout', (dd, i, nds) => {
        d3.select(nds[i])
          .select('rect')
          .transition()
          .style('opacity', 1)
          .ease(d3.easeBounceOut);
        this.setState({
          tooltip: {
            opacity: 0,
            hidden: true,
          },
        });
      });

    tgroup.append('defs')
      .append('clipPath')
      .attr('id', (d) => `${this.id}-mask-${d.theme}`)
      .style('pointer-events', 'none')
      .append('rect')
      .attrs((d) => ({
        width: d.weight / totalWeight * sts.width,
        height: sts.height,
      }));
    tgroup.append('text')
      .attrs((d) => ({
        'clip-path': `url(#${this.id}-mask-${d.theme})`,
        dx: '5px',
        dy: '1em',
        'text-anchor': 'start',
      }))
      .style('visibility', (d) => d.depth >= this.settings.textMaxDepth ? 'hidden' : 'visible')
      .style('font-size', '1em')
      .text((d) => d.theme);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={`${this.name}-chart`} id={this.id}
        ref={(c) => { this.container = c; }} style={{ textAlign: 'center' }}>
        <div className={classes.tooltip} id={`${this.id}-tooltip`}
          style={{
            left: this.state.tooltip.x,
            top: this.state.tooltip.y,
            opacity: this.state.tooltip.opacity,
            visibility: this.state.tooltip.hidden ? 'hidden' : 'visible',
          }}>
          <VisWordcloud data={this.state.words}
            title={this.state.title}
            settings={{
              width: 200,
              height: 200,
            }}/>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(VisThemebar);
