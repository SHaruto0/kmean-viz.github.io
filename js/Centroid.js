class Centroid {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.prevX = x;
    this.prevY = y;
    this.points = [];
  }

  update() {
    if (this.points.length === 0) return;

    this.prevX = this.x;
    this.prevY = this.y;

    let sumX = 0,
      sumY = 0;
    for (let point of this.points) {
      sumX += point.x;
      sumY += point.y;
    }

    this.x = sumX / this.points.length;
    this.y = sumY / this.points.length;
  }

  hasConverged(threshold = 1) {
    return (
      Math.abs(this.x - this.prevX) < threshold &&
      Math.abs(this.y - this.prevY) < threshold
    );
  }

  draw(ctx, size = 12) {
    // Draw centroid
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw X mark
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - 6, this.y - 6);
    ctx.lineTo(this.x + 6, this.y + 6);
    ctx.moveTo(this.x + 6, this.y - 6);
    ctx.lineTo(this.x - 6, this.y + 6);
    ctx.stroke();
  }
}
