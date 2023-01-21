import BaseShape from "./BaseShape.js";

export default class LineLeftAngleDown extends BaseShape {
	create_shape() {
		var canvas = this.ctrl[0];

		var ctx = canvas.getContext('2d');
		var border_width = parseInt(this.style['border-width']);
		var size = canvas.width / 6;

		var arrow_width = Math.sqrt(Math.pow(size, 2) + Math.pow(size, 2))

		ctx.save();

		ctx.clearRect(0, 0, canvas.width * 10, canvas.height * 10);

		ctx.lineWidth = parseInt(this.style['border-width']);
		ctx.strokeStyle = this.style['border-color']
		ctx.lineJoin = "round";

		ctx.beginPath();

		ctx.moveTo(canvas.width - border_width, border_width);
		ctx.lineTo(border_width + size, border_width);
		ctx.lineTo(border_width + size, canvas.height - border_width);
		ctx.lineTo(border_width, canvas.height - size - border_width);
		ctx.moveTo(border_width + size, canvas.height - border_width);
		ctx.lineTo(border_width + 2 * size, canvas.height - size - border_width);

		ctx.stroke();
		ctx.restore();
	}
}