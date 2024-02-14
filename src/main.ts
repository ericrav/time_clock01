import './style.css';
import p5 from 'p5';
import SunCalc from 'suncalc';

const sketch = (p: p5) => {
  let position: GeolocationPosition;
  let date = new Date();
  let hasChangedDate = false;
  let sunGraphic: p5.Graphics;
  let moonGraphic: p5.Graphics;
  let slider: p5.Element;
  p.setup = () => {
    p.createCanvas(800, 800);

    navigator.geolocation.getCurrentPosition((pos) => {
      position = pos;
    });

    sunGraphic = p.createGraphics(800, 800);
    sunGraphic.translate(sunGraphic.width / 2, sunGraphic.height / 2);
    moonGraphic = p.createGraphics(800, 800);
    moonGraphic.translate(sunGraphic.width / 2, sunGraphic.height / 2);

    slider = p.createSlider(0, 20, 0);
    slider.position(10, 10);
    slider.size(100);

    const input = p.createInput(date.toISOString().slice(0, 10));
    input.attribute('type', 'date');
    input.position(10, 40);
    // @ts-ignore
    input.changed(() => {
      hasChangedDate = true;
      date = new Date(input.value());
    });
  };

  const bg = '#000a12';
  const moon = '#e6e6b4';

  p.draw = () => {
    const speed = +slider.value();
    if (speed > 0) {
      hasChangedDate = true;
    }
    if (hasChangedDate) {
      date = new Date(date.getTime() + 1000 * speed * p.deltaTime);
    } else {
      date = new Date();
    }
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

    p.noStroke();
    const c2 = p.color(bg);

    for (let i = 0; i < 12; i++) {
      c2.setAlpha(Math.pow(i, 1.2) * 5);
      p.fill(c2);
      const r = 1 - (i / 12)*0.2;
      p.arc(0, 0, s*r -4, s*r -4, 0, Math.PI);
    }

    p.noStroke();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    if (hasChangedDate) {
      p.text(date.toLocaleDateString(), 0, -14);
      p.text(formatTime(date), 0, 14);
    }

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
    const sunX = -s * 0.58 * Math.cos(azimuth - Math.PI / 2);
    const sunY = (-s / 2) * (altitude / (Math.PI / 2));
    const sunZ = -s * 0.58 * Math.sin(azimuth - Math.PI / 2);
    const size = 20 + 20 * distance(sunX, sunZ) / (s / 2);
    sunGraphic.noStroke();
    sunGraphic.fill(255, 255, 0);
    sunGraphic.ellipse(sunX, sunY, size, size);

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

    const yesterday = SunCalc.getTimes(
      new Date(date.getTime() - 1000 * 60 * 60 * 12),
      position.coords.latitude,
      position.coords.longitude
    );

    const ratio = date.getTime() >= sunrise.getTime() && date.getTime() <= sunset.getTime()
      ? (date.getTime() - sunrise.getTime()) / (sunset.getTime() - sunrise.getTime())
      : ((date.getTime() - yesterday.sunset.getTime()) / (yesterday.sunrise.getTime() + (1000 * 60 * 60 * 24) - yesterday.sunset.getTime())) + 1;

    p.stroke(255);
    p.strokeWeight(4);
    p.noFill();
    p.push();
    const angle = -Math.PI * ratio;
    p.rotate(angle);
    p.line(s/2-8, 0, s/2+8, 0);
    p.pop();
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

// function radiansToDegrees(radians: number) {
//   return ((radians * 180) / Math.PI).toFixed(2);
// }

function distance(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}
