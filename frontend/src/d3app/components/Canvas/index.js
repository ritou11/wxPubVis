import React, { Component } from 'react';
import * as _ from 'lodash';

import { rgb2hsl } from '../../utils';

class Canvas extends Component {
  componentDidMount() {
    const { canvas, image } = this.refs;
    image.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const imageAspectRatio = image.width / image.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      let renderableHeight; let renderableWidth; let xStart; let
        yStart;

      if (imageAspectRatio < canvasAspectRatio) {
        renderableHeight = canvas.height;
        renderableWidth = image.width * (renderableHeight / image.height);
        xStart = (canvas.width - renderableWidth) / 2;
        yStart = 0;
      } else if (imageAspectRatio > canvasAspectRatio) {
        renderableWidth = canvas.width;
        renderableHeight = image.height * (renderableWidth / image.width);
        xStart = 0;
        yStart = (canvas.height - renderableHeight) / 2;
      } else {
        renderableHeight = canvas.height;
        renderableWidth = canvas.width;
        xStart = 0;
        yStart = 0;
      }
      ctx.drawImage(image, xStart, yStart, renderableWidth, renderableHeight);

      const { data } = ctx.getImageData(xStart, yStart, renderableWidth, renderableHeight);
      const hsldata = _.map(_.chunk(data, 4), (dt) => rgb2hsl(dt[0], dt[1], dt[2]));
      this.props.storeImgData(hsldata);
    };
  }

  render() {
    return (
      <div>
        <canvas ref="canvas" width={this.props.width} height={this.props.height}>
          Target image
        </canvas>
        <img ref="image" src={this.props.src} className="hidden" alt="img"/>
      </div>
    );
  }
}

export default Canvas;
