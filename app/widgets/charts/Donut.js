import { BaseChart } from "./BaseChart.js";

export default class DonutChart extends BaseChart {
	label = 'Donut';
	
	draw() {
		var data = [];
		for (var index = 0; index < this.value.data.length; index++) {
			data.push([this.value.ticks[index], this.value.data[index]]);
		}

		this.chart = $.jqplot(this.chart_area.attr('id'), [data], {
			//title: this.label,
			// Turns on animatino for all series in this plot.
			//animate: true,
			// Will animate plot on calls to plot1.replot({resetAxes:true})
			//animateReplot: true,
			seriesDefaults: {
				renderer: $.jqplot.DonutRenderer,
				rendererOptions: {
					showDataLabels: true
				}
			},
			legend: {
				show: true,
				location: 's',
				rendererOptions: {
					numberRows: 3,
				},
			},
			grid: this.chart_area_style

		});
	}
};