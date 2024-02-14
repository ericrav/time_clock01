import './style.css';
import p5 from 'p5';
import SunCalc from 'suncalc';

const sketch = (p: p5) => {
  let position: GeolocationPosition;
  let date = new Date();
  p.setup = () => {
    p.createCanvas(800, 800);

    navigator.geolocation.getCurrentPosition((pos) => {
      position = pos;
      console.log(pos);
    });
  };

  const bg = '#000a12';
  const moon = '#e6e6b4';

  p.draw = () => {
    date = new Date(date.getTime() + 1000 * 300);
    p.translate(p.width / 2, p.height / 2);
    if (!position) return;
    p.background(bg);
    p.noFill();
    p.stroke(255);
    p.strokeWeight(4);
    const s = 550;
    p.ellipse(0, 0, s, s);

    p.noStroke();
    p.fill(255);
    p.text(date.toLocaleDateString(), 0, -20);
    p.text(formatTime(date), 0, 0);

    const times = SunCalc.getTimes(
      date,
      position.coords.latitude,
      position.coords.longitude
    );
    const positions = SunCalc.getPosition(
      date,
      position.coords.latitude,
      position.coords.longitude
    );
    const { azimuth, altitude } = positions;

    p.text(radiansToDegrees(altitude), 0, 20);
    p.text(radiansToDegrees(azimuth), 0, 40);

    const sunX = -s * 0.58 * Math.cos(azimuth - Math.PI / 2);
    const sunY = (-s / 2) * (altitude / (Math.PI / 2));
    p.noStroke();
    p.fill(255, 255, 0);
    p.ellipse(sunX, sunY, 40, 40);

    {
      const moonPositions = SunCalc.getMoonPosition(
        date,
        position.coords.latitude,
        position.coords.longitude
      );
      const { azimuth, altitude } = moonPositions;
      const { phase, fraction } = SunCalc.getMoonIllumination(date);
      const moonX = -s * 0.58 * Math.cos(azimuth - Math.PI / 2);
      const moonY = (-s / 2) * (altitude / (Math.PI / 2));
      const phaseOffset = (1 - 2 * Math.abs(phase - 0.5)) * (phase < 0.5 ? 1 : -1);
      if (fraction < 0.5) {
        p.fill(moon);
        p.ellipse(moonX, moonY, 20, 20);
        p.fill(bg);
        p.ellipse(moonX - 20 * phaseOffset, moonY, 20, 20);
      } else {
        p.fill(bg);
        p.ellipse(moonX, moonY, 20, 20);
        p.fill(moon);
        p.ellipse(moonX + phaseOffset, moonY, 20 * fraction, 20);
      }
    }

    const { sunrise, sunset, solarNoon } = times;

    p.fill(255);
    p.textSize(21);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text(formatTime(sunset), -s / 2 - 16, 0);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(formatTime(sunrise), s / 2 + 16, 0);
    p.textAlign(p.CENTER, p.BASELINE);
    p.text(formatTime(solarNoon), 0, -s / 2 - 16);

    // p.noLoop();
  };
};

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

new p5(sketch);

function radiansToDegrees(radians: number) {
  return ((radians * 180) / Math.PI).toFixed(2);
}
