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

    d3.select('button.pause').on('click', function() {
      d3.select("line").interrupt();
    });
    
    d3.select('button.continue').on('click', function() {
     d3.select("line").transition()
        .ease(d3.easeLinear)
        .duration(359 * 1000)
        .attr("x1",1795)
        .attr("x2",1795);
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

  flattenArray(array) {
    return array.reduce((acc, val) => acc.concat(val), []);
  }

  calculateTimeScale() {
    let size = Math.ceil(this.call_length / 30);
    let tick_values = [];
    for (let i = 0; i < size; i++) {
      tick_values.push(this.convertToHHmmss(Math.round(i * 30)));
    }
    return tick_values;
  }

  convertToHHmmss(duration) {
    var s = (duration % 60 == 0) ? '00' : Math.floor((duration) % 60);
    var m = Math.floor((duration / 60) % 60);

    if (duration > 3600) {
      var h = Math.floor((duration / (60 * 60)) % 24);
      return h + ':' + m + ':' + s + '';
    } else {
      return m + ':' + s + '';
    }
  }

  drawWaveform(data, dom, color) {

    let tick_size = Math.round(30 * 7.82);

    let width = this.call_length * 5;
    let height = 75;

    var node = d3.select(dom).append("svg")
      .attr("class", "chart")
      .attr("width", width)
      .attr("height", height);

    var max_val = d3.max(data, function (d) { return Math.abs(d[1] - d[0]); });
    var y = d3.scaleLinear().domain([-max_val, max_val]).range([height, -height]);
    // var x = d3.scaleLinear().domain([0, this.data_length]);
    var bar_width = width / this.data_length;

    var chart = node.attr("width", width).attr("height", height);
    chart.append('line')
      .style('stroke', 'black')
      // .style('stroke-width', '5px')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 5)
      .attr('y2', height)
      // .attr("transform", "translate(0, 50)")

    var bar = chart.selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function (d, i) {
        return "translate(" + i * bar_width + ",0)";
      });

    bar.append("rect")
      .attr("y", function (d) {
        return height - Math.abs(y(d[1] - d[0]) / 2) - height / 2 + 2;
      })
      .attr("height", function (d) {
        return Math.abs(y(d[1] - d[0]));
      })
      .attr("width", bar_width);

    chart.style('fill', color);

    let scale = d3.scaleLinear().domain([0, this.data_length]).range([0, max_val])

    let labels = this.calculateTimeScale();
    console.log("labels: " + labels);
    // let scale = d3.scaleBand()
    //   // .domain(labels)
    //   .range([0, width])
    //   // .round(true)
    //   .paddingOuter(1);

    console.log("data length: " + this.data_length);

    /*
    var xAxis = d3.axisBottom()
      .scale(scale)
      .ticks(1)

    bar.append("g")
      .attr('transform', 'translate(0, 55)')
      .attr("class", "axis")
      .call(xAxis)
      .select(".domain").remove();

    d3.selectAll(".tick")
      .style("display", function (d, i) {
        return i % tick_size ? "none" : "initial"
      });

    */

    // var w = 500, h = 100;
    /*var svg = d3.select("scale")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var scale2 = d3.scaleBand()
      .domain("ABCDEFGHIJKL".split(""))
      .range([20, width - 20])
      .paddingOuter(0)

    var axis = d3.axisBottom(scale2);

    var gX = svg.append("g")
      .attr("transform", "translate(0,50)")
      .call(axis)
    */

  }

}
