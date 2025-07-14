class KMeansVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.points = [];
    this.centroids = [];
    this.k = 3;
    this.isRunning = false;
    this.isPaused = false;
    this.iteration = 0;
    this.converged = false;
    this.speed = 5;
    this.maxPoints = 50;
    this.draggedPoint = null;

    this.colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F06292",
      "#AED581",
      "#FFB74D",
    ];

    this.setupEventListeners();
    this.updateDisplay();
  }

  setupEventListeners() {
    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    this.canvas.addEventListener("contextmenu", (e) =>
      this.handleRightClick(e)
    );
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));

    document.getElementById("kValue").addEventListener("input", (e) => {
      this.k = parseInt(e.target.value);
      document.getElementById("kValueDisplay").textContent = this.k;
      this.reset();
    });

    document.getElementById("speed").addEventListener("input", (e) => {
      this.speed = parseInt(e.target.value);
      document.getElementById("speedDisplay").textContent = this.speed;
    });

    document
      .getElementById("startBtn")
      .addEventListener("click", () => this.start());
    document
      .getElementById("pauseBtn")
      .addEventListener("click", () => this.pause());
    document
      .getElementById("stepBtn")
      .addEventListener("click", () => this.step());
    document
      .getElementById("resetBtn")
      .addEventListener("click", () => this.reset());
    document
      .getElementById("clearBtn")
      .addEventListener("click", () => this.clearPoints());
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  handleClick(e) {
    if (this.isRunning && !this.converged) return;

    const pos = this.getMousePos(e);
    if (this.points.length < this.maxPoints) {
      this.points.push(new Point(pos.x, pos.y));

      // If we were converged and now have new points, restart clustering
      if (this.converged && this.centroids.length > 0) {
        this.converged = false;
        this.isRunning = true;
        this.updateStatus("running");
        this.runAnimation();
      }

      this.draw();
      this.updateDisplay();
    }
  }

  handleRightClick(e) {
    e.preventDefault();
    if (this.isRunning && !this.converged) return;

    const pos = this.getMousePos(e);
    const pointIndex = this.findNearestPoint(pos.x, pos.y, 15);

    if (pointIndex !== -1) {
      this.points.splice(pointIndex, 1);

      // If we were converged and points were removed, restart clustering
      if (
        this.converged &&
        this.centroids.length > 0 &&
        this.points.length > 0
      ) {
        this.converged = false;
        this.isRunning = true;
        this.updateStatus("running");
        this.runAnimation();
      }

      this.draw();
      this.updateDisplay();
    }
  }

  handleMouseDown(e) {
    if (this.isRunning && !this.converged) return;

    const pos = this.getMousePos(e);
    const pointIndex = this.findNearestPoint(pos.x, pos.y, 15);

    if (pointIndex !== -1) {
      this.draggedPoint = pointIndex;
      this.canvas.style.cursor = "grabbing";
    }
  }

  handleMouseMove(e) {
    if (this.draggedPoint !== null) {
      const pos = this.getMousePos(e);
      this.points[this.draggedPoint].x = pos.x;
      this.points[this.draggedPoint].y = pos.y;
      this.draw();
    }
  }

  handleMouseUp(e) {
    if (this.draggedPoint !== null) {
      this.draggedPoint = null;
      this.canvas.style.cursor = "crosshair";

      // If we were converged and a point was moved, restart clustering
      if (this.converged && this.centroids.length > 0) {
        this.converged = false;
        this.isRunning = true;
        this.updateStatus("running");
        this.runAnimation();
      }

      this.draw();
      this.updateDisplay();
    }
  }

  findNearestPoint(x, y, threshold) {
    for (let i = 0; i < this.points.length; i++) {
      const dist = Math.sqrt(
        Math.pow(this.points[i].x - x, 2) + Math.pow(this.points[i].y - y, 2)
      );
      if (dist < threshold) {
        return i;
      }
    }
    return -1;
  }

  initializeCentroids() {
    this.centroids = [];
    for (let i = 0; i < this.k; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.centroids.push(new Centroid(x, y, this.colors[i]));
    }
  }

  assignPointsToClusters() {
    for (let point of this.points) {
      let minDistance = Infinity;
      let closestCentroid = 0;

      for (let i = 0; i < this.centroids.length; i++) {
        const distance = point.distanceTo(this.centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = i;
        }
      }

      point.prevCluster = point.cluster;
      point.cluster = closestCentroid;
    }
  }

  updateCentroids() {
    // Clear previous assignments
    for (let centroid of this.centroids) {
      centroid.points = [];
    }

    // Assign points to centroids
    for (let point of this.points) {
      if (point.cluster !== -1) {
        this.centroids[point.cluster].points.push(point);
      }
    }

    // Update centroid positions
    for (let centroid of this.centroids) {
      centroid.update();
    }
  }

  checkConvergence() {
    return this.centroids.every((centroid) => centroid.hasConverged());
  }

  step() {
    if (this.points.length === 0) return;

    if (this.centroids.length === 0) {
      this.initializeCentroids();
    }

    this.assignPointsToClusters();
    this.updateCentroids();
    this.iteration++;

    this.converged = this.checkConvergence();

    if (this.converged) {
      this.isRunning = false;
      this.updateStatus("converged");
    } else {
      this.updateStatus("running");
    }

    this.draw();
    this.updateDisplay();
  }

  start() {
    if (this.points.length === 0) return;

    this.isRunning = true;
    this.isPaused = false;
    this.updateStatus("running");

    if (this.centroids.length === 0) {
      this.initializeCentroids();
    }

    this.runAnimation();
  }

  pause() {
    this.isPaused = !this.isPaused;
    if (!this.isPaused && this.isRunning) {
      this.runAnimation();
    }
  }

  runAnimation() {
    if (!this.isRunning || this.isPaused || this.converged) return;

    this.step();

    if (this.isRunning && !this.converged) {
      const delay = 1100 - this.speed * 100;
      setTimeout(() => this.runAnimation(), delay);
    }
  }

  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.iteration = 0;
    this.converged = false;
    this.centroids = [];

    for (let point of this.points) {
      point.cluster = -1;
      point.prevCluster = -1;
    }

    this.updateStatus("ready");
    this.draw();
    this.updateDisplay();
  }

  clearPoints() {
    this.points = [];
    this.reset();
  }

  updateStatus(status) {
    const statusText = document.getElementById("statusText");
    const indicator = statusText.querySelector(".status-indicator");

    switch (status) {
      case "ready":
        indicator.className = "status-indicator status-ready";
        statusText.innerHTML =
          '<span class="status-indicator status-ready"></span>Ready';
        break;
      case "running":
        indicator.className = "status-indicator status-running";
        statusText.innerHTML =
          '<span class="status-indicator status-running"></span>Running';
        break;
      case "converged":
        indicator.className = "status-indicator status-converged";
        statusText.innerHTML =
          '<span class="status-indicator status-converged"></span>Converged';
        break;
    }
  }

  updateDisplay() {
    document.getElementById("pointCount").textContent = this.points.length;
    document.getElementById("iterationCount").textContent = this.iteration;
    document.getElementById("convergedStatus").textContent = this.converged
      ? "Yes"
      : "No";
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections from points to centroids
    for (let point of this.points) {
      if (point.cluster !== -1 && this.centroids[point.cluster]) {
        const centroid = this.centroids[point.cluster];
        this.ctx.strokeStyle = centroid.color + "40";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        this.ctx.lineTo(centroid.x, centroid.y);
        this.ctx.stroke();
      }
    }

    // Draw points
    for (let point of this.points) {
      const color = point.cluster !== -1 ? this.colors[point.cluster] : "#333";
      point.draw(this.ctx, color);
    }

    // Draw centroids
    for (let centroid of this.centroids) {
      centroid.draw(this.ctx);
    }
  }
}
