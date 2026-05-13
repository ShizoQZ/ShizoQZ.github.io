// Variables globales
let figuras = [];
let estadoActual = "NORMAL"; // Estados: "NORMAL", "SHH", "SEPARADAS"
let colorRosa, colorVerde, colorAzul;

function setup() {
  createCanvas(800, 480);
  
  colorRosa = color(255, 105, 180); 
  colorVerde = color(34, 139, 34);  
  colorAzul = color(0, 100, 255);   
  
  // Creamos las 3 figuras
  figuras.push(new FiguraLineal(width/2 - 60, height/2 - 40, 250, 300));
  figuras.push(new FiguraLineal(width/2 + 60, height/2 + 40, 250, 300));
  figuras.push(new FiguraLineal(width/2, height/2, 250, 300));
}

function draw() {
  // 1. CALCULAR COLOR DE FONDO
  let colorFondo;
  if (mouseX < width / 2) {
    let proporcion = map(mouseX, 0, width / 2, 0, 1);
    colorFondo = lerpColor(colorRosa, colorVerde, proporcion);
  } else {
    let proporcion = map(mouseX, width / 2, width, 0, 1);
    colorFondo = lerpColor(colorVerde, colorAzul, proporcion);
  }
  background(colorFondo);

  // 2. CALCULAR ROTACIÓN BASE
  let rotacionObjetivo = map(mouseX, 0, width, -PI/4, PI/4);

  // 3. ACTUALIZAR Y DIBUJAR FIGURAS
  for (let i = 0; i < figuras.length; i++) {
    figuras[i].actualizar(rotacionObjetivo, estadoActual);
    // Ahora le pasamos el estado a dibujar() para que las líneas sepan qué hacer
    figuras[i].dibujar(estadoActual); 
  }
}

// 4. INTERACCIONES DE TECLADO
function keyPressed() {
  if (key === 's' || key === 'S') {
    estadoActual = "SHH";
  } else if (key === 'a' || key === 'A') {
    estadoActual = "SEPARADAS"; // Ahora esto desarmará las líneas
  } else if (key === 'r' || key === 'R') {
    estadoActual = "NORMAL";
  }
}
function keyReleased() {
 if (key === 's' || key === 'S') {
    estadoActual = "NORMAL";
}else if (key === 'a' || key === 'A') {
    estadoActual = "NORMAL"; 
  } 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- CLASE FIGURA LINEAL ACTUALIZADA ---
class FiguraLineal {
  constructor(x, y, ancho, alto) {
    this.xBase = x; 
    this.yBase = y;
    this.xActual = x; 
    this.yActual = y;
    this.ancho = ancho;
    this.alto = alto;
    this.rotacionActual = 0;
    this.espaciadoLineas = 8;
    
    // NUEVO: Arreglo para guardar la información INDIVIDUAL de cada línea
    this.lineas = [];
    
    for (let posX = -this.ancho / 2; posX <= this.ancho / 2; posX += this.espaciadoLineas) {
      this.lineas.push({
        baseX: posX,         // Su posición X original dentro de la figura
        actualX: posX,       // Su posición X actual (que se moverá)
        actualY: 0,          // Su posición Y actual
        grosor: map(abs(posX), 0, this.ancho / 2, 4, 1), // Más grueso al centro
        // Ruido Perlin: Semillas aleatorias únicas para que cada línea flote distinto
        ruidoX: random(1000), 
        ruidoY: random(1000)
      });
    }
  }

  actualizar(rotacionObjetivo, estado) {
    let xDestino, yDestino, rotacionDestino;

    if (estado === "NORMAL" || estado === "SEPARADAS") {
      // El "centro" de la figura se mantiene en su lugar original
      // Las líneas se escaparán de este centro en dibujar()
      xDestino = this.xBase;
      yDestino = this.yBase;
      rotacionDestino = rotacionObjetivo;
    } 
    else if (estado === "SHH") {
      // El bloque entero se va al centro de la pantalla
      xDestino = width / 2;
      yDestino = height / 2;
      rotacionDestino = 0; 
      xDestino += random(-5, 5); // Temblor
      yDestino += random(-5, 5);
    } 

    this.xActual = lerp(this.xActual, xDestino, 0.08);
    this.yActual = lerp(this.yActual, yDestino, 0.08);
    this.rotacionActual = lerp(this.rotacionActual, rotacionDestino, 0.1);
  }

  dibujar(estado) {
    push();
    translate(this.xActual, this.yActual);
    rotate(this.rotacionActual);
    
    stroke(0); 
    strokeCap(SQUARE);
    
    // NUEVO BUCLE: Repasamos nuestra lista de líneas guardadas
    for (let i = 0; i < this.lineas.length; i++) {
      let l = this.lineas[i];
      let destinoLineaX, destinoLineaY;
      
      if (estado === "SEPARADAS") {
        // Hacemos avanzar el tiempo del ruido Perlin para que la línea se mueva
        l.ruidoX += 0.005;
        l.ruidoY += 0.005;
        
        // noise() devuelve un valor entre 0 y 1. Lo mapeamos para que las 
        // líneas vuelen muy lejos de la figura (hasta -800 y +800 píxeles de distancia)
        destinoLineaX = map(noise(l.ruidoX), 0, 1, -800, 800);
        destinoLineaY = map(noise(l.ruidoY), 0, 1, -800, 800);
      } else {
        // Si es NORMAL o SHH, su destino es volver a armar el cuadrado perfecto
        destinoLineaX = l.baseX;
        destinoLineaY = 0;
      }
      
      // La línea viaja suavemente a su destino (ya sea a armarse o a flotar)
      l.actualX = lerp(l.actualX, destinoLineaX, 0.05);
      l.actualY = lerp(l.actualY, destinoLineaY, 0.05);
      
      // El efecto de destiempo vertical (la ondulación de la obra de Stanczak)
      let desfaseY = sin(frameCount * 0.05 + l.baseX * 0.1) * 15;
      
      strokeWeight(l.grosor);
      // Dibujamos la línea usando su X e Y individual
      line(
        l.actualX, 
        -this.alto / 2 + l.actualY + desfaseY, 
        l.actualX, 
        this.alto / 2 + l.actualY + desfaseY
      );
    }
    pop();
  }
}
