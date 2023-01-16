import BaseShape from "./BaseShape.js";

export default class Diamond extends BaseShape {
    create_shape() {
        var canvas = this.ctrl[0];

        var ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var border_width = parseInt(this.style['border-width']);

        if (border_width < 0) border_width = 0;

        ctx.lineWidth = border_width;
        ctx.strokeStyle = this.style['border-color'];
        ctx.fillStyle = this.style['background-color'];
        ctx.beginPath();
        ctx.moveTo((canvas.width - border_width) / 2, border_width);
        ctx.lineTo(canvas.width - border_width, (canvas.height - border_width) / 2);
        ctx.lineTo((canvas.width - border_width) / 2, canvas.height - border_width);
        ctx.lineTo(border_width, (canvas.height - border_width) / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}