import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import HSLHistogram from '../HSLHistogram';
import HSLViolin from '../HSLViolin';
import HSLViolinPie from '../HSLViolinPie';

class FigureBoard extends Component {
  render() {
    return (
      <Grid container alignContent='center' direction='column' justify='center' spacing={8}>
        <Grid item>
          <HSLHistogram settings={{
            width: 600,
            height: 200,
            xmin: 0,
            xmax: 360,
            select: 0,
            color: 'red',
          }} data={this.props.data}/>
          <HSLHistogram settings={{
            width: 600,
            height: 200,
            xmin: 0,
            xmax: 1,
            select: 1,
            color: 'green',
          }} data={this.props.data}/>
          <HSLHistogram settings={{
            width: 600,
            height: 200,
            xmin: 0,
            xmax: 1,
            select: 2,
            color: 'blue',
          }} data={this.props.data}/>
        </Grid>
        <Grid item>
          <HSLViolin settings={{
            width: 600,
            height: 200,
            sqrt: false,
            transitionOn: true,
            select: 1,
          }} data={this.props.data}/>
          <HSLViolin settings={{
            width: 600,
            height: 200,
            sqrt: true,
            select: 2,
          }} data={this.props.data}/>
        </Grid>
        <Grid item>
          <HSLViolinPie settings={{
            outerR: 200,
            innerR: 100,
            // imgPath: 'example.png',
            sqrt: true,
            select: 2,
          }} data={this.props.data}/>
          <HSLViolinPie settings={{
            outerR: 200,
            innerR: 100,
            imgPath: 'example.png',
            sqrt: true,
            select: 1,
          }} data={this.props.data}/>
        </Grid>
      </Grid>
    );
  }
}

export default FigureBoard;
