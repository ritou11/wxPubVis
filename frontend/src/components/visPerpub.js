import React, { Component } from 'react';
import * as _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import * as d3 from 'd3';
import 'd3-selection-multi';

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
    background: 'rgba(200, 200, 200, 0.9)',
    color: 'white',
    borderRadius: '3px',
    '& p': {
      margin: '0',
      textAlign: 'left',
    },
    zIndex: 1000,
    width: '200px',
    height: '250px',
  },
};

class VisPerpub extends Component {
  state = {
    tooltip: {
      x: 0,
      y: 0,
      opacity: 0,
      hidden: true,
    },
  };

  constructor(props) {
    super(props);
    this.name = this.constructor.name.toLowerCase();
    this.id = _.uniqueId(`${this.name}-`);
    this.defaultSettings = {
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      textMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    };
    this.settings = _.merge(this.defaultSettings, props.settings);
  }

  componentDidMount() {
    this.initChart();
    this.update(this.root);
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
    const sts = this.settings;
    const widthAval = sts.width - sts.margin.left - sts.margin.right
                    - sts.textMargin.left - sts.textMargin.right;
    const heightAval = sts.height - sts.margin.top - sts.margin.bottom
                    - sts.textMargin.top - sts.textMargin.bottom;
    this.treemap = d3.treemap()
      .size([widthAval, heightAval])
      .padding(3);
    const { data } = this.props;
    const pdata = {
      name: 'root',
      children: data,
    };
    this.root = d3.hierarchy(pdata);
    this.root.sum((d) => (d.children && d.children.length) ? 0 : d.importance);
  }

  color = d3.scaleOrdinal(d3.schemeCategory10);

  update = () => {
    const { classes } = this.props;
    const duration = 500;
    this.treemap(this.root);
    const nodes = this.root.descendants();

    const gNodes = this.mainGroup.selectAll(`.${classes.node}`)
      .data(nodes.filter((d) => !d.children), (nd) => nd.data.name);
    const nodeEnter = gNodes.enter()
      .append('g')
      .attr('class', classes.node)
      .on('click', (d) => {
        if (d3.event.altKey) {
          if (d.parent && d.parent.children) {
            d.parent._children = d.parent.children;
            d.parent.children = null;
            this.update(d);
          }
        } else if (!d.children && !d._children) {
          this.update(d);
        } else if (d.children) {
          d._children = d.children;
          d.children = null;
          this.update(d);
        } else {
          d.children = d._children;
          d._children = null;
          this.update(d);
        }
      });

    nodeEnter.append('rect')
      .attr('id', (d, i) => `${this.id}-rect-${i}`)
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .style('fill', (d) => {
        let p = d;
        while (p.depth > 1) p = p.parent;
        return this.color(p.data.name);
      })
      .style('stroke', (d) => {
        let p = d;
        while (p.depth > 1) p = p.parent;
        return this.color(p.data.name);
      })
      .style('fill-opacity', (d) => 2.5 / (1 + d.depth));

    const nodeEnterLabel = nodeEnter.append('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    nodeEnterLabel.append('defs')
      .append('clipPath')
      .attr('id', (d) => `${this.id}-mask-${d.data.name}`)
      .style('pointer-events', 'none')
      .append('rect')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0);
    nodeEnterLabel
      .append('text')
      .attr('clip-path', (d) => `url(#${this.id}-mask-${d.data.name})`)
      .attr('dy', '1.5em')
      .style('visibility', (d) => d.depth >= this.settings.textMaxDepth ? 'hidden' : 'visible')
      .style('font-size', (d) => `${2 / (d.depth + 1)}em`)
      .selectAll('tspan')
      .data((d) => [d.data.name])
      .join('tspan')
      .attr('x', '0.5em')
      .attr('dy', '1.5em')
      .text((d) => d);

    nodeEnter.on('mouseover', (dd, i, nds) => {
      d3.select(nds[i])
        .select('rect')
        .transition()
        .attr('x', (d) => d.x0 - 2)
        .attr('y', (d) => d.y0 - 2)
        .attr('width', (d) => d.x1 - d.x0 + 4)
        .attr('height', (d) => d.y1 - d.y0 + 4)
        .style('opacity', 0.7)
        .ease(d3.easeBounceOut);
    })
      .on('mousemove', (d) => {
        const mouseX = d3.event.clientX + 15;
        const mouseY = d3.event.clientY - 200;
        this.setState({
          tooltip: {
            x: mouseX,
            y: mouseY,
            opacity: 1,
            hidden: false,
          },
          words: d.data.keywords,
          title: d.data.name,
        });
      })
      .on('mouseout', (dd, i, nds) => {
        d3.select(nds[i])
          .select('rect')
          .transition()
          .attr('x', (d) => d.x0)
          .attr('y', (d) => d.y0)
          .attr('width', (d) => d.x1 - d.x0)
          .attr('height', (d) => d.y1 - d.y0)
          .style('opacity', 1)
          .ease(d3.easeBounceOut);
        this.setState({
          tooltip: {
            opacity: 0,
            hidden: true,
          },
        });
      });

    const nodeExit = gNodes
      .exit()
      .transition()
      .duration(duration)
      .style('opacity', 0)
      .remove();

    nodeExit.select('text')
      .style('fill-opacity', 1e-6);
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
          <Typography variant="h6" color="textSecondary">
            {this.state.title}
          </Typography>
          <Typography variant="body2" color="textPrimary">
            {_.join(this.state.words, ', ')}
          </Typography>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(VisPerpub);
