// Referencia al canvas donde se dibujará la ruleta
const canvas = document.getElementById('ruleta');
const ctx = canvas.getContext('2d');

// Referencia al botón para girar la ruleta
const botonGirar = document.getElementById('boton-girar');

let opcionGanadora = -1;

// Opciones de la ruleta: cada porción tiene un color definido y probabilidades iguales
let opciones = [
    { color: '#DC143C', imagen: 'img/IMG-FAN.png', probabilidad: 1 / 8 }, // Naranja
    { color: '#FF4040', imagen: 'img/IMG-FAN.png', probabilidad: 1 / 8 }, // Verde
    { color: '#9B111E', imagen: 'img/IMG-FAN.png', probabilidad: 1 / 8 }, // Azul
    { color: '#E9967A', imagen: 'img/IMG-FAN.png', probabilidad: 1 / 8 }, // Amarillo
    { color: '#DC143C', imagen: 'img/IMG-FAN.png', probabilidad: 1 / 8 }, // Verde Claro
    { color: '#FF4040', imagen: 'img/IMG-FAN.png', probabilidad: 1 / 8 }, // Rojo
    { color: '#9B111E', imagen: 'img/IMG-FAN.png', probabilidad: 1 / 8 }, // Vino
    { color: '#E9967A', imagen: 'img/IMG-FAN.png', probabilidad: 1 / 8 }  // Morado
];

// Variable para almacenar las imágenes cargadas
let imagenes = [];

// Cargar todas las imágenes antes de dibujar la ruleta
function cargarImagenes() {
    let cargadas = 0;
    opciones.forEach(opcion => {
        let img = new Image();
        img.src = opcion.imagen;
        img.onload = () => {
            cargadas++;
            imagenes.push(img);
            if (cargadas === opciones.length) {
                dibujarRuleta(); // Dibuja la ruleta una vez todas las imágenes estén cargadas
            }
        };
    });
}

// Función para dibujar la ruleta
function dibujarRuleta() {
    const totalProbabilidad = opciones.reduce((sum, o) => sum + o.probabilidad, 0);
    let inicio = 0;

    opciones.forEach((opcion, index) => {
        const angulo = (opcion.probabilidad / totalProbabilidad) * 2 * Math.PI;

        // Dibuja el segmento
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, inicio, inicio + angulo);
        ctx.closePath();
        ctx.fillStyle = opcion.color; // Usar el color definido en la opción
        ctx.fill();

        // Dibuja la imagen dentro del segmento
        const img = imagenes[index];
        const radio = canvas.width / 2;

        // Cambia este valor para mover la imagen más cerca o más lejos del centro
        const distanciaImagen = radio * 0.8; // Ajusta este valor (0.8 aleja la imagen hacia el borde)

        const x = radio + Math.cos(inicio + angulo / 2) * distanciaImagen;
        const y = radio + Math.sin(inicio + angulo / 2) * distanciaImagen;

        // Tamaño de la imagen, ajusta este valor si quieres cambiar el tamaño de las imágenes
        const tamanoImagen = radio / 3; // Cambia este valor para modificar el tamaño de la imagen

        // Calculamos el ángulo en el que la imagen debe ser rotada
        const anguloImagen = inicio + angulo / 2 + Math.PI / 2; // Rotación para que siempre mire hacia abajo

        // Dibuja la imagen rotada
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(anguloImagen);
        ctx.drawImage(img, -tamanoImagen / 2, -tamanoImagen / 2, tamanoImagen, tamanoImagen);
        ctx.restore();

        // Agrega un borde fino al segmento
        ctx.strokeStyle = '#000'; // Negro
        ctx.lineWidth = 0.3; // Ancho del borde
        ctx.stroke();

        inicio += angulo; // Siguiente segmento
    });

    // Si se ha determinado una opción ganadora, dibuja la imagen grande
    if (opcionGanadora !== -1) {
        const imgGanadora = imagenes[opcionGanadora];
        const radio = canvas.width / 2;
        const x = radio;
        const y = radio;

        // Tamaño de la imagen ganadora, la hacemos mucho más grande
        const tamanoImagenGrande = radio * 1.5; // Ajusta este valor para cambiar el tamaño de la imagen ganadora

        // Dibuja la imagen ganadora en el centro de la ruleta
        ctx.drawImage(imgGanadora, x - tamanoImagenGrande / 2, y - tamanoImagenGrande / 2, tamanoImagenGrande, tamanoImagenGrande);
    }
}

// Función para girar la ruleta con desaceleración suave
function girarRuleta() {
    if (ruletaGirada) return;
    ruletaGirada = true;

    const duracion = 6000; // Tiempo total del giro en ms
    const fps = 60; // Cuadros por segundo
    let anguloActual = 0; // Ángulo actual de la ruleta
    let velocidad = 0.6; // Velocidad inicial (radianes por cuadro)

    const intervalo = setInterval(() => {
        // Dibuja la ruleta girando
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(anguloActual);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        dibujarRuleta();
        ctx.restore();

        // Actualiza el ángulo y disminuye la velocidad
        anguloActual += velocidad;
        velocidad *= 0.98; // Desaceleración gradual

        // Detiene el giro cuando la velocidad es muy baja
        if (velocidad < 0.005) {
            clearInterval(intervalo);

            // Una vez que la ruleta se ha detenido, calcula cuál es la opción ganadora
            const anguloFinal = anguloActual % (2 * Math.PI); // Ángulo final de la ruleta
            const totalAngulo = 2 * Math.PI;
            const anguloPorOpcion = totalAngulo / opciones.length;

            // Determina qué opción quedó al frente
            opcionGanadora = Math.floor(anguloFinal / anguloPorOpcion);
            console.log("Opción ganadora:", opcionGanadora);

            // Mostrar la imagen ganadora en pantalla completa
            const imgGanadora = imagenes[opcionGanadora];
            const imgElement = document.getElementById('imagen-ganadora-img');
            imgElement.src = imgGanadora.src; // Asigna la imagen ganadora al elemento

            // Muestra el contenedor con la imagen
            document.getElementById('imagen-ganadora').style.display = 'flex';

            // Opcional: Esconder la imagen después de un tiempo
            setTimeout(() => {
                document.getElementById('imagen-ganadora').style.display = 'none';
                ruletaGirada = false; // Permitir girar nuevamente
            }, 5000); // La imagen se muestra durante 5 segundos
        }
    }, 1000 / fps);
}

// Variable para determinar si la ruleta ya se giró
let ruletaGirada = false;

// Cargar las imágenes antes de dibujar la ruleta
cargarImagenes();

// Evento al hacer clic en el botón
botonGirar.addEventListener('click', girarRuleta);
