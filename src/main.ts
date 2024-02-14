import './style.css';
import p5 from 'p5';
import SunCalc from 'suncalc';

const sketch = (p: p5) => {
  let position: GeolocationPosition;
  p.setup = () => {
    p.createCanvas(800, 800);

    navigator.geolocation.getCurrentPosition((pos) => {
      position = pos;
      console.log(pos);
    });
  };

  p.draw = () => {
    p.translate(p.width / 2, p.height / 2);
    if (!position) return;
    p.background(0);
    p.noFill();
    p.stroke(255);
    p.strokeWeight(4);
    const s = 550;
    p.ellipse(0, 0, s, s);

    const times = SunCalc.getTimes(new Date(), position.coords.latitude, position.coords.longitude);
    const positions = SunCalc.getPosition(new Date(), position.coords.latitude, position.coords.longitude);
    console.log(times);
    console.log(positions);
    const { sunrise, sunset, solarNoon } = times;

    p.noStroke();
    p.fill(255);
    p.textSize(21);
    p.textAlign(p.RIGHT)
    p.text(formatTime(sunset), -s / 2 - 16, 0);
    p.textAlign(p.LEFT)
    p.text(formatTime(sunrise), s / 2 + 16, 0);
    p.textAlign(p.CENTER)
    p.text(formatTime(solarNoon), 0, - s / 2 - 16);

    p.noLoop();
  };
};

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

new p5(sketch);
