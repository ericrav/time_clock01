import './style.css';
import p5 from 'p5';
import SunCalc from 'suncalc';

const sketch = (p: p5) => {
  let position: GeolocationPosition;
  let date = new Date();
  let sunGraphic: p5.Graphics;
  let moonGraphic: p5.Graphics;
  p.setup = () => {
    p.createCanvas(800, 800);

    navigator.geolocation.getCurrentPosition((pos) => {
      position = pos;
      console.log(pos);
    });

    sunGraphic = p.createGraphics(800, 800);
    sunGraphic.translate(sunGraphic.width / 2, sunGraphic.height / 2);
    moonGraphic = p.createGraphics(800, 800);
    moonGraphic.translate(sunGraphic.width / 2, sunGraphic.height / 2);
  };

  const bg = '#000a12';
  const moon = '#e6e6b4';

  p.draw = () => {
    date = new Date(date.getTime() + 1000 * 300);
    p.translate(p.width / 2, p.height / 2);
    if (!position) return;
    const c = p.color(bg);
    c.setAlpha(10);
    sunGraphic.background(p.color(c));
    c.setAlpha(80);
    moonGraphic.background(p.color(c));

    p.background(bg);
    p.image(sunGraphic, -p.width / 2, -p.height / 2);
    p.blendMode(p.LIGHTEST);
    p.image(moonGraphic, -p.width / 2, -p.height / 2);
    p.blendMode(p.NORMAL);

    p.noFill();
    p.stroke(255);
    p.strokeWeight(4);
    const s = 550;
    p.ellipse(0, 0, s, s);

    const c2 = p.color(bg);
    c2.setAlpha(220);
    p.fill(c2);
    p.arc(0, 0, s, s, 0, Math.PI);

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
    sunGraphic.noStroke();
    sunGraphic.fill(255, 255, 0);
    sunGraphic.ellipse(sunX, sunY, 40, 40);

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
        moonGraphic.fill(moon);
        moonGraphic.ellipse(moonX, moonY, 20, 20);
        moonGraphic.fill(bg);
        moonGraphic.ellipse(moonX - 20 * phaseOffset, moonY, 20, 20);
      } else {
        moonGraphic.fill(bg);
        moonGraphic.ellipse(moonX, moonY, 20, 20);
        moonGraphic.fill(moon);
        moonGraphic.ellipse(moonX + phaseOffset, moonY, 20 * fraction, 20);
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
