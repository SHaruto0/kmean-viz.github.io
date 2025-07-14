// Initialize the visualizer when the page loads
document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  window.visualizer = new KMeansVisualizer(canvas);
});
