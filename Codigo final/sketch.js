//Audio:
let mic;
let fft;

let volumen = 0;
let graves = 0;
let agudos = 0;

let tiempoAplauso = 0;
let volumenAnterior = 0;

//Otras variables:
let anguloRotacion = 0;
let TodosAlCentro = 0;
let TodosAfuera = 0;

let animacionActiva = false;

let factorOrbita = 0;

let separacionVolumen = 0;

let separacionMaxima = 0;

function setup() {

  createCanvas(800, 800);
  rectMode(CENTER);

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);
}

function mousePressed() {
  userStartAudio();
}

function draw() {
//Para el audio:
  volumen = mic.getLevel();

  fft.analyze();

  graves =
    (
      fft.getEnergy("bass") +
      fft.getEnergy("lowMid")
    ) / 2;

  agudos =
    (
      fft.getEnergy("highMid") +
      fft.getEnergy("treble")
    ) / 2;

   // CALCULAR DIFERENCIA
   /* print(
  "Graves:", graves,
  "Agudos:", agudos,
  "Diferencia:", agudos - graves
);*/

  actualizarInteracciones();

  let colorFondo = calcularColorFondo();

  background(colorFondo);

  translate(width / 2, height / 2);
  stroke(0);
  strokeWeight(2);

  let orbitaX = 0;
  let orbitaY = 0;

  //Figura capa fondo izquierda:
  let izqX =
    lerp(-120, 0, TodosAlCentro) - separacionVolumen;

  izqX = lerp(izqX, -350, TodosAfuera);

  let izqY = 0;

  let MovFondoIzq =
    animacionActiva ?
      sin(frameCount * 0.03) * 10 : 0;

  push();

  translate(izqX + MovFondoIzq - orbitaX, izqY - orbitaY);

  rotate(anguloRotacion);

  stroke(0);
  strokeWeight(2);

  for (let i = -180; i <= 130; i += 8) {

    let achique =
      map(i, -50, 220, 0, 80);

    let y1 = -260 + achique;

    let y2;

    if (i < 0) {

      y2 = 300;

    } else {

      let achiqueAbajo =
        map(i, 0, 120, 0, 80);

      y2 = 300 - achiqueAbajo;
    }

    line(i, y1, i, y2);
  }

  pop();

  //Figura capa fondo derecha:
  let derX =
    lerp(120, 0, TodosAlCentro)
    + separacionVolumen;

  derX = lerp(derX, 350, TodosAfuera);

  let derY = 0;

  let MovFondoDerecha =
    animacionActiva ?
      sin(frameCount * 0.03) * 10 :
      0;

  push();

  translate(derX + MovFondoDerecha + orbitaX, derY + orbitaY);

  rotate(anguloRotacion);

  stroke(0);
  strokeWeight(2);


  for (let i = -120; i <= 180; i += 8) {

    let achique =
      map(i, 130, -120, 0, 80);

    let y2 = 280 - achique;

    let y1;

    if (i > 0) {

      y1 = -300;

    } else {

      let achiqueArriba =
        map(i, 0, -120, 0, 80);

      y1 =
        -300 + achiqueArriba;
    }

    line(i, y1, i, y2);
  }

  pop();

  //Figura capa intermedia arriba/superior:
  let supX = lerp(40, 0, TodosAlCentro);

  let supY =
    lerp(-120, 0, TodosAlCentro)
    - separacionVolumen;

  supY = lerp(supY, -300, TodosAfuera);

  let movArriba =
    animacionActiva ?
      sin(frameCount * 0.06) * 10 : 0;

  push();

  translate(supX - orbitaX, supY + movArriba + orbitaY);

  rotate(anguloRotacion);

  stroke(0);
  strokeWeight(5);

  for (let i = -280; i <= 140; i += 10) {

    line(i + 80, -130, i, 120);

  }

  pop();

//Figura capa intermedia abajo/inferior:
  let infX = lerp(40, 0, TodosAlCentro);

  let infY =
    lerp(90, 0, TodosAlCentro)
    + separacionVolumen;

  infY = lerp(infY, 300, TodosAfuera);

  let MovAbajo =
    animacionActiva ? sin(frameCount * 0.06) * 10 : 0;

  push();

  translate(infX + orbitaX, infY - MovAbajo - orbitaY);

  rotate(anguloRotacion);

  stroke(0);
  strokeWeight(5);

  for (let i = -280; i <= 140; i += 10) {

    line(i + 80, -90, i, 160);

  }

  pop();

 //Centro:
  let cenX = 0;
  let cenY = 0;

  let MovCentro =
    animacionActiva ?
      sin(frameCount * 0.06) * 10 : 0;

  push();

  translate(cenX, cenY + MovCentro);

  rotate(-anguloRotacion);

  stroke(0);
  strokeWeight(9);

  for (let i = -150; i <= 150; i += 13) {

    line(i, -150, i, 145);

  }

  pop();

  push();

  resetMatrix();

  dibujarMarco(colorFondo);

  pop();

}

//Interacciones con audio:
function actualizarInteracciones() {

  animacionActiva =
    volumen > 0.02;

  let destinoAngulo = 0;

if (volumen > 0.03) {

  let diferencia = agudos - graves;

let velocidadRotacion =
map(
    diferencia,
    -250,
    100,
    -4,
    4
);

velocidadRotacion =
constrain(
    velocidadRotacion,
    -2,
    2
);

anguloRotacion += radians(velocidadRotacion);

}

  if (volumen > 0.01) {

    let separacionObjetivo = map(volumen, 0.01, 0.15, 0, 180);

    separacionObjetivo = constrain(separacionObjetivo, 0, 180);

    separacionVolumen = lerp(separacionVolumen, separacionObjetivo, 0.2);
  }
  let dispersionObjetivo =
    map(volumen, 0, 0.15, 0, 1);

  dispersionObjetivo =
    constrain(dispersionObjetivo, 0, 1);

  factorOrbita =
    lerp(factorOrbita, dispersionObjetivo, 0.45);

  TodosAlCentro =
    lerp(TodosAlCentro, 0, 0.58);

  TodosAfuera = 0;

}

function calcularColorFondo() {

  let mezcla = map(agudos - graves, -250, 100, 0, 1);

  mezcla = constrain(mezcla, 0, 1);
  let colorAzul = color(0, 0, 255)
  let colorRosa = color(255, 5, 180);

  return lerpColor(colorAzul, colorRosa, mezcla);

}

function dibujarMarco(colorFondo) {

  noStroke();
  fill(colorFondo);

  const margen = 40;

  //Arriba
  rectMode(CORNER);
  rect(0, 0, width, margen);

  //Abajo
  rect(0, height - margen, width, margen);

  //Izquierda
  rect(0, margen, margen, height - margen * 2);

  //Derecha
  rect(width - margen, margen, margen, height - margen * 2);

}