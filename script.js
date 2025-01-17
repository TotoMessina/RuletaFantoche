// Referencia al canvas donde se dibujará la ruleta
const canvas = document.getElementById('ruleta');
const ctx = canvas.getContext('2d');

// Referencia al botón para girar la ruleta
const botonGirar = document.getElementById('boton-girar');

let opcionGanadora = -1;

// Opciones de la ruleta
let opciones = [
    { color: '#DC143C', imagen: 'img/a.png', probabilidad: 0.10 }, // 10%
    { color: '#FF4040', imagen: 'img/b.png', probabilidad: 0.10 }, // 10%
    { color: '#9B111E', imagen: 'img/c.png', probabilidad: 0.10 }, // 10%
    { color: '#E9967A', imagen: 'img/d.png', probabilidad: 0.20 }, // 20%
    { color: '#DC143C', imagen: 'img/e.png', probabilidad: 0.10 }, // 10%
    { color: '#FF4040', imagen: 'img/f.png', probabilidad: 0.05 }, // 5%
    { color: '#9B111E', imagen: 'img/g.png', probabilidad: 0.05 }, // 5%
    { color: '#E9967A', imagen: 'img/h.png', probabilidad: 0.20 }  // 20%
];

// Cargar imágenes
function cargarImagenes() {
    let cargadas = 0;
    opciones.forEach(opcion => {
        let img = new Image();
        img.src = opcion.imagen;
        img.onload = () => {
            cargadas++;
            opcion.imgElement = img;
            if (cargadas === opciones.length) {
                dibujarRuleta();
            }
        };
    });
}

function dibujarRuleta() {
    const anguloSegmento = (2 * Math.PI) / opciones.length; // Todos los segmentos iguales
    let inicio = 0;

    opciones.forEach(opcion => {
        // Dibuja el segmento
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, inicio, inicio + anguloSegmento);
        ctx.closePath();
        ctx.fillStyle = opcion.color;
        ctx.fill();

        // Dibuja la imagen dentro del segmento
        const img = opcion.imgElement;
        if (img) {
            const radio = canvas.width / 2;
            const distanciaImagen = radio * 0.7;
            const x = radio + Math.cos(inicio + anguloSegmento / 2) * distanciaImagen;
            const y = radio + Math.sin(inicio + anguloSegmento / 2) * distanciaImagen;
            const tamanoImagen = radio / 3; // Tamaño de la imagen

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(inicio + anguloSegmento / 2 + Math.PI / 2);
            ctx.drawImage(img, -tamanoImagen / 2, -tamanoImagen / 2, tamanoImagen, tamanoImagen);
            ctx.restore();
        }

        inicio += anguloSegmento; // Avanzar al siguiente segmento
    });
}

function calcularOpcionGanadora(anguloFinal) {
    const anguloSegmento = (2 * Math.PI) / opciones.length;

    // Normalizamos el ángulo entre 0 y 2 * PI
    anguloFinal %= 2 * Math.PI;

    // Calculamos el índice de la opción ganadora
    const indice = Math.floor(anguloFinal / anguloSegmento);
    return indice;
}

// Girar la ruleta
function girarRuleta() {
    if (ruletaGirada) return;
    ruletaGirada = true;

    const duracion = 6000; // Duración de 6 segundos
    const fps = 60;
    const vueltasCompletas = 6; // Más giros para que gire más tiempo
    const anguloFinalAleatorio = Math.random() * 2 * Math.PI;
    const anguloTotal = vueltasCompletas * 2 * Math.PI + anguloFinalAleatorio;

    let anguloActual = 0;
    let velocidadActual = anguloTotal / (duracion / (1000 / fps));

    const intervalo = setInterval(() => {
        anguloActual += velocidadActual;
        velocidadActual *= 0.995; // Freno más suave (menor desaceleración)

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(anguloActual);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        dibujarRuleta();
        ctx.restore();

        if (velocidadActual < 0.01) { // Frenar cuando la velocidad es muy baja
            clearInterval(intervalo);

            // Calcular la opción ganadora según el ángulo final de la ruleta
            anguloActual %= 2 * Math.PI;
            opcionGanadora = calcularOpcionGanadora(2 * Math.PI - anguloActual);
            mostrarGanador();
        }
    }, 1000 / fps);
}

function mostrarGanador() {
    const imgGanadora = opciones[opcionGanadora].imgElement;
    const imgElement = document.getElementById('imagen-ganadora-img');
    imgElement.src = imgGanadora.src;

    const contenedor = document.getElementById('imagen-ganadora');
    
    // Mostrar el contenedor de la imagen
    contenedor.style.display = 'flex';
    
    // Retrasar la opacidad para que se vea la transición
    setTimeout(() => {
        contenedor.style.opacity = 1; // Hacer visible gradualmente
    }, 10); // Asegura que el estilo se aplique después de un pequeño retraso
}

// Estado de la ruleta
let ruletaGirada = false;

// Cargar imágenes
cargarImagenes();

// Evento de giro
botonGirar.addEventListener('click', girarRuleta);
