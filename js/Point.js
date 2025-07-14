class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.cluster = -1;
    this.prevCluster = -1;
  }

  distanceTo(other) {
    return Math.sqrt(
      Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)
    );
  }

  draw(ctx, color = "#333", size = 6) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
