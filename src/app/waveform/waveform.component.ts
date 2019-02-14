import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.scss']
})
export class WaveformComponent implements OnInit {

  wav_json = '../../assets/connect.json';
  data: any;
  left = [];
  right = [];
  sample_rate;
  data_length;
  call_length: number;

  constructor() { }

  ngOnInit() {
    d3.json(this.wav_json).then((json) => {
      console.log('success retrieving json file');
      this.data = json.data;
      this.sample_rate = json.sample_rate;
      this.data_length = json.length;
      this.call_length = Math.round(this.data_length / 7.82);
      console.log(this.call_length);

      let channelsData = this.splitChannelData(this.data);

      //left channel
      this.drawWaveform(channelsData[0], '.waveform', '#66CCFF');

      // create the time axis
      this.drawAxis();

    });

    // cursor animation
    d3.select('button.pause').on('click', function() {
      d3.select("line").interrupt();
    });
    
    d3.select('button.continue').on('click', function() {
     d3.select("line").transition()
        .ease(d3.easeLinear)
        .duration(359 * 1000)
        .attr("x1",900)
        .attr("x2",900);
    }).dispatch('click');

  }

  splitChannelData(data) {

    let left_channel = [];
    let right_channel = [];
    let left_flag = true;
    while (data.length > 0) {

      if (left_flag === true) {
        left_channel.push(data.splice(0, 2));
        left_flag = !left_flag;
      }
      if (left_flag === false) {
        right_channel.push(data.splice(0, 2));
        left_flag = !left_flag;
      }
    }

    return [left_channel, right_channel];

  }

  // flattenArray(array) {
  //   return array.reduce((acc, val) => acc.concat(val), []);
  // }

  // calculates the time labels for the call based on the call length
  calculateTimeScale() {
    let size = Math.ceil(this.call_length / 30);
    let tick_values = [];
    for (let i = 0; i < size; i++) {
      tick_values.push(this.secondsToHms(Math.round(i * 30)));
    }
    return tick_values;
  }

secondsToHms(d) {
  d = Number(d);

  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  if (h == 0) {
    return ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
  } else {
    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
  }
}

  drawWaveform(data, dom, color) {

    let width = 900;
    let height = 75;

    // create the svg object
    let node = d3.select(dom).append("svg")
      .attr("class", "chart")
      .attr("width", width)
      .attr("height", height);

    // setting max value, y scale, and bar width
    let max_val = d3.max(data, function (d) { return Math.abs(d[1] - d[0]); });
    let y = d3.scaleLinear().domain([-max_val, max_val]).range([height, -height]);
    let bar_width = width / this.data_length;

    let chart = node.attr("width", width).attr("height", height);

    // create a cursor to indicate audio location
    chart.append('line')
      .style('stroke', 'black')
      .style('stroke-width', '2px')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 5)
      .attr('y2', height)

    let bar = chart.selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function (d, i) {
        return "translate(" + i * bar_width + ",0)";
      });

    // for every pair of min and max, plot the bar
    bar.append("rect")
      .attr("y", function (d) {
        return height - Math.abs(y(d[1] - d[0]) / 2) - height / 2 + 2;
      })
      .attr("height", function (d) {
        return Math.abs(y(d[1] - d[0]));
      })
      .attr("width", bar_width);

    // color the chart
    chart.style('fill', color);

  }

  // function to draw an axis for the waveform
  drawAxis() {
    let labels = this.calculateTimeScale();
    let scale = d3.scaleBand()
      .domain(labels)
      .range([0, 900])
      .paddingOuter(0);

    let svg = d3.select(".time-axis")
      .append("svg")
      .attr("width", 900)
      .attr("height", 20);

    let axis = d3.axisBottom(scale);

    svg.append("g")
      // .attr("transform", "translate(0,50)")
      .call(axis)
      .select(".domain").remove();
    
  }

}
