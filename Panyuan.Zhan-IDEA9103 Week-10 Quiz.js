let song;
let fft;
let circles = [];
let radius = 10;
let spacing = 12;
let lerpFactor = 0.85;
let spectralCentroid = 0;
let tailLength = 20; 
let tailOpacity = 40; 


function preload() {
  song = loadSound('assets/sample-visualisation.mp3');
}

function setup() {
  createCanvas(1350, 750);
  fft = new p5.FFT(0.8, 128);
  song.connect(fft);
  stroke(255);
  strokeWeight(1);

  // Create paragraph elements for user control with specified text color
   radiusDescription = createP('Circle Radius:');
   radiusDescription.position(20, 2);
   radiusDescription.style('color', 'white');
 
   spacingDescription = createP('Circle Spacing:');
   spacingDescription.position(20, 32);
   spacingDescription.style('color', 'white');
 
   lerpDescription = createP('Lerp Factor:');
   lerpDescription.position(20, 62);
   lerpDescription.style('color', 'white');

  // Add sliders for user control
  let radiusSlider = createSlider(5, 20, radius, 1);
  radiusSlider.position(130, 20);
  radiusSlider.input(function() {
    radius = radiusSlider.value();
  });
  
  let spacingSlider = createSlider(5, 30, spacing, 1);
  spacingSlider.position(130, 50);
  spacingSlider.input(function() {
    spacing = spacingSlider.value();
  });

  let lerpSlider = createSlider(0.1, 1, lerpFactor, 0.05);
  lerpSlider.position(130, 80);
  lerpSlider.input(function() {
    lerpFactor = lerpSlider.value();
  });

  //Initializes the array of circle movement tracks
  for (let i = 0; i < tailLength; i++) {
    circles.push([]);
  }
}

function draw() {
  if (getAudioContext().state !== 'running') {
    background(27, 73, 101);
    fill(255);
    text('Single click the mouse to start or stop the audio', 325, 350);
    textSize(30);
    return;
  }

  background(27, 73, 101, 40);

  // Use FFT analysis
  let spectrum = fft.analyze();
  let circleCount = spectrum.length;

  for (let i = 0; i < circleCount; i++) {
     // Arrange at the bottom, add some offset
    let x = i * spacing + 5;
    let y = height - radius - 10;
    // Calculate the target position based on the intensity of the audio spectrum
    let targetY = y + map(spectrum[i], 0, 255, 0, -height);

    // Gradients are generated according to the audio spectrum
    fill(random(150, 255), i * (255 / spectrum.length), random(100, 200));

    // Draw the trajectory of the circle
    for (let i = circles.length - 1; i > 0; i--) {
      circles[i] = createVector(circles[i - 1].x, circles[i - 1].y);
      ellipse(circles[i].x, circles[i].y, radius, radius);
    }

    circles[0] = createVector(x, lerp(y, targetY, lerpFactor));
    ellipse(circles[0].x, circles[0].y, radius, radius);

  }

  // Calculate spectral centroid
  let nyquist = 22050;
  spectralCentroid = fft.getCentroid();
  let mean_freq_index = spectralCentroid / (nyquist / spectrum.length);
  let mapPosition = map(log(mean_freq_index), 0, log(spectrum.length), 0, width);
  stroke(255);
  line(mapPosition, 0, mapPosition, height);
}

function mousePressed() {
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.play();
  }
}

