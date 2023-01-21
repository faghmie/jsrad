import BaseShape from "./BaseShape.js";

export default class LineRight extends BaseShape {
	create_shape() {
		var canvas = this.ctrl[0];

		var ctx = canvas.getContext('2d');
		var size = canvas.width / 4;
		var startX = 0;
		var startY = canvas.height / 2;

		var arrow_height = Math.sqrt(Math.pow(size, 2) + Math.pow(size, 2))
		var width = startX + canvas.width - parseInt(this.style['border-width']);
		var arrowX = width - size;
		var arrowTopY = startY - arrow_height;
		var arrowBottomY = startY + arrow_height;

		ctx.save();

		ctx.clearRect(0, 0, canvas.width * 10, canvas.height * 10);

		ctx.lineWidth = parseInt(this.style['border-width']);
		ctx.strokeStyle = this.style['border-color'];

		ctx.beginPath();

		ctx.moveTo(startX, startY);
		ctx.lineTo(width, startY);
		ctx.moveTo(width, startY + parseInt(this.style['border-width']) / 4);
		ctx.lineTo(arrowX, arrowTopY);
		ctx.moveTo(width, startY - parseInt(this.style['border-width']) / 4);
		ctx.lineTo(arrowX, arrowBottomY);
		ctx.stroke();
		ctx.restore();

		return this;
	}
}