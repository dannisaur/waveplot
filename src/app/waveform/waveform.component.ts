import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as moment from 'moment';

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
      this.drawWaveform(channelsData[0], '.waveform', 'blue');

      // right channel
      this.drawWaveform(channelsData[1], '.rwaveform', 'green');

    });

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

    return [this.flattenArray(left_channel), this.flattenArray(right_channel)];

  }

  flattenArray(array) {
    return array.reduce((acc, val) => acc.concat(val), []);
  }

  calculateTimeScale() {
    let size = Math.ceil(this.call_length / 30) + 1;
    let tick_values = [];
    for (let i = 0; i < size; i++) {
      tick_values.push(Math.round(i * 30 * 7.82));
    }
    return tick_values;
  }

  convertToHHmmss(duration) {
    var s = ( duration % 60 == 0 ) ? '00' : Math.floor( (duration) % 60 );
    var m = Math.floor( (duration / 60) % 60 );

    if (duration > 3600) {
      var h = Math.floor( (duration/(60 * 60)) % 24 );
      return h + ':' + m + ':' + s + '';
    } else {
      return m + ':' + s + '';
    }
  }

  drawWaveform(data, dom, color) {

    let width = this.call_length * 5;
    let height = 100;

    var node = d3.select(dom).append("svg")
      .attr("class", "chart")
      .attr("width", width)
      .attr("height", height);

    var y = d3.scaleLinear().range([height, -height]);
    var max_val = d3.max(data, function (d) { return d; });
    y.domain([-max_val, max_val]);
    var x = d3.scaleLinear().domain([0, data.length]);
    var bar_width = width / data.length;

    var chart = node.attr("width", width).attr("height", height);

    var bar = chart.selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function (d, i) {
        return "translate(" + i * bar_width + ",0)";
      });

    bar.append("rect")
      .attr("y", function (d) {
        var yv = height - Math.abs(y(d) / 2) - height / 2 + 2;
        return yv;
      })
      .attr("height", function (d) {
        return Math.abs(y(d));
      })
      .attr("width", bar_width);

    chart.style('fill', color);

    let ticks = this.calculateTimeScale();
    // let ticks_label = ticks[1];
    // console.log(ticks);
    let scale = d3.scaleLinear()
      .domain([0, this.data_length]).range([0, d3.max(data)]);
    console.log(this.data_length);

    var axis = d3.axisBottom()
      .tickValues(ticks)
      .tickFormat((d, i) => {
        console.log(d);
        return this.convertToHHmmss(i * 20);
      })
      .scale(scale);

    node.append('g')
      .attr('transform', 'translate(0,80)')
      .call(axis);
  }

}
