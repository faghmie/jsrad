import BaseShape from "./BaseShape.js";

export default class LineLeft extends BaseShape {
	create_shape() {
		var canvas = this.ctrl[0];

		var ctx = canvas.getContext('2d');

		var border_width = parseInt(this.style['border-width']);
		var size = canvas.width / 6;

		ctx.save();

		ctx.clearRect(0, 0, canvas.width * 10, canvas.height * 10);

		ctx.lineWidth = parseInt(this.style['border-width']);
		ctx.strokeStyle = this.style['border-color']
		ctx.lineJoin = "round";

		ctx.beginPath();

		ctx.moveTo(canvas.width + border_width, (canvas.height - border_width) / 2);
		ctx.lineTo(border_width, (canvas.height - border_width) / 2);
		ctx.lineTo(border_width + size, (canvas.height - border_width) / 2 + size);
		ctx.moveTo(border_width, (canvas.height - border_width) / 2);
		ctx.lineTo(border_width + size, (canvas.height - border_width) / 2 - size);

		ctx.stroke();
		ctx.restore();
	}
}