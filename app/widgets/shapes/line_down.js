import BaseShape from "./BaseShape.js";

export default class LineDown extends BaseShape {
	create_shape() {
		var canvas = this.ctrl[0];

		var ctx = canvas.getContext('2d');

		var border_width = parseInt(this.style['border-width']);
		var size = canvas.width / 6;

		ctx.save();

		ctx.clearRect(0, 0, canvas.width * 10, canvas.height * 10);

		ctx.lineWidth = parseInt(this.style['border-width']);
		ctx.strokeStyle = this.style['border-color']

		ctx.beginPath();

		ctx.moveTo((canvas.width - border_width)/2, border_width);
		ctx.lineTo((canvas.width - border_width)/2, canvas.height - border_width);
		ctx.lineTo((canvas.width - border_width)/2 - size, canvas.height - border_width - size);
		ctx.moveTo((canvas.width - border_width)/2, canvas.height - border_width);
		ctx.lineTo((canvas.width - border_width)/2 + size, canvas.height - border_width - size);

		ctx.stroke();
		ctx.restore();

		return this;
	}
}