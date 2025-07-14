// Preset pattern generators
function generatePreset(pattern) {
  visualizer.clearPoints();

  switch (pattern) {
    case "random":
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * (visualizer.canvas.width - 40) + 20;
        const y = Math.random() * (visualizer.canvas.height - 40) + 20;
        visualizer.points.push(new Point(x, y));
      }
      break;

    case "clusters":
      const clusterCenters = [
        { x: 150, y: 150 },
        { x: 450, y: 150 },
        { x: 300, y: 350 },
      ];

      for (let center of clusterCenters) {
        for (let i = 0; i < 7; i++) {
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.random() * 60 + 20;
          const x = center.x + Math.cos(angle) * radius;
          const y = center.y + Math.sin(angle) * radius;
          visualizer.points.push(new Point(x, y));
        }
      }
      break;

    case "circle":
      const centerX = visualizer.canvas.width / 2;
      const centerY = visualizer.canvas.height / 2;
      const radius = 120;

      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * 2 * Math.PI;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        visualizer.points.push(new Point(x, y));
      }
      break;

    case "line":
      for (let i = 0; i < 15; i++) {
        const x = 50 + i * 35;
        const y = 250 + (Math.random() - 0.5) * 60;
        visualizer.points.push(new Point(x, y));
      }
      break;
  }

  visualizer.draw();
  visualizer.updateDisplay();
}
