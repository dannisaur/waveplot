import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import * as d3 from 'd3/dist/d3.node';
// import { selection, select, selectAll } from 'd3-selection';
import * as d3Select from 'd3-selection';
import 'd3-selection';
import { transition as d3Transition } from 'd3-transition';
import 'd3-transition';
import * as d3Fetch from 'd3-fetch';
import 'd3-fetch';
import * as d3Array from 'd3-array';
import 'd3-array';
import * as d3Scale from 'd3-scale';
import 'd3-scale';
import * as d3Axis from 'd3-axis';
import 'd3-axis';
import * as d3Ease from 'd3-ease';
import 'd3-ease';

@Component({
  selector: 'app-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.scss']
})
export class WaveformComponent implements OnInit {

  audio;
  waveform_location: any = 0;
  wav_json = '../../assets/test.json';
  data: any;
  left = [];
  right = [];
  sample_rate;
  data_length;
  call_length: number;
  rate: number = 1;
  last_tick: number = 0;
  container_width = 900;

  tags: any = [];

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {

    this.audio = document.getElementById('sound') as HTMLAudioElement;

    d3Fetch.json(this.wav_json).then((json) => {
      console.log('success retrieving json file');
      this.data = json.data;
      this.sample_rate = json.sample_rate;
      this.data_length = json.length;
      this.call_length = 50;

      let channelsData = this.splitChannelData(this.data);

      //left channel
      this.drawWaveform(channelsData[0], '.waveform', '#66CCFF');

      // create the time axis
      this.drawAxis('.time-axis');

    });

  }

  ngAfterViewInit() {
    
    d3Select.select('#sound')
      .on('playing', () => {
        let duration = 50 * 1000 + 100;
        let diff = (duration - (this.waveform_location + 1000)) / this.rate;

        console.log('selecting cursor');

        // selectAll('.cursor').transtion()
        d3Select.select('.cursor').transtion()
          .ease(d3Ease.easeLinear)
          .duration(diff)
          .attr('x1', this.container_width)
          .attr('x2', this.container_width)
      })
      .on('pause', () => {
        d3Select.selectAll('.cursor').interrupt();
        this.waveform_location = this.audio.currentTime;
      })
      .on('seeked', () => {
        this.waveform_location = this.audio.currentTime;
        let start_location = Math.round((this.waveform_location / this.call_length) * this.container_width);

        d3Select.selectAll('.cursor').interrupt();

        console.log('selecting cursor');
        d3Select.selectAll('.cursor')
          .attr('x1', start_location)
          .attr('x2', start_location)
          .attr('y1', 5)
          .attr('y2', 75)
      })
      /*
      .on('ratechange', () => {
        this.rate = this.audio.playbackRate;

        this.waveform_location = this.audio.currentTime;

        let duration = 50 * 1000 + 100;
        let diff = (duration - (this.waveform_location * 1000)) / this.rate;

        d3.selectAll('.cursor').transition()
          .ease(d3.easeLinear)
          .duration(diff)
          .attr('x1', this.container_width)
          .attr('x2', this.container_width)
      });*/

      this.cdr.detectChanges();
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

  // calculates the time labels for the call based on the call length
  calculateTimeScale(tick_width: number) {
    let size = Math.ceil(this.call_length / tick_width);
    let tick_values = [];
    for (let i = 0; i < size; i++) {
      if (i === size - 1) {
        this.last_tick = Math.round(i * tick_width);
      }
      tick_values.push(this.secondsToHms(Math.round(i * tick_width)));
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

    let width = this.container_width;
    let height = 75;

    // create the svg object
    let node = d3Select.select(dom).append("svg")
      .attr("class", "chart")
      .attr("width", width)
      .attr("height", height);

    // setting max value, y scale, and bar width
    let max_val = d3Array.max(data, function (d) { return Math.abs(d[1] - d[0]); });
    let y = d3Scale.scaleLinear().domain([-max_val, max_val]).range([height, -height]);
    let bar_width = width / this.data_length;

    let chart = node.attr("width", width).attr("height", height);

    // create a cursor to indicate audio location
    chart.append('line')
      .style('stroke', 'black')
      .style('stroke-width', '2px')
      .attr('class', 'cursor')
      .attr('id', dom.substring(1, dom.length) + '_' + color)
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 5)
      .attr('y2', height)

    console.log('cursor created');

    let bar = chart.selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function (d, i) {
        return "translate(" + i * bar_width + ",0)";
      });

    let class_name = dom.substring(1, dom.length) + 'bars';

    // for every pair of min and max, plot the bar
    bar.append("rect")
      .attr('class', class_name)
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
  drawAxis(dom) {
    let labels = this.calculateTimeScale(5);
    let range = Math.round(this.last_tick / this.call_length * this.container_width);
    let scale = d3Scale.scaleBand()
      .domain(labels)
      .range([0, range])
      .paddingInner(Math.round(this.container_width / labels.length));

    let svg = d3Select.select(dom)
      .append("svg")
      .attr("width", this.container_width)
      .attr("height", 20);

    let axis = d3Axis.axisBottom(scale);

    svg.append("g")
      .attr("transform", "translate(1,0)")
      .call(axis)
      .select(".domain").remove();

      d3Select.selectAll('.tick')
      .style('display', function (d, i) {
        return i === 0 ? 'none' : 'initial';
      })
  }

}
