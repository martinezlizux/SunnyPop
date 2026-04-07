# Caso de Estudio: SunnyPop - Aplicación Dinámica de Clima

**Descripción General:**
SunnyPop es un proyecto personal y educativo desarrollado en colaboración entre madre e hija. El propósito principal del proyecto es experimentar con herramientas de Inteligencia Artificial (IA) en el proceso de desarrollo de software, enseñar sobre el ciclo de creación de un producto digital desde cero y practicar la integración entre el diseño en Figma y la programación en código real (Vibe Coding).

## 1. El Propósito del Proyecto
- **Educativo:** Enseñar a mi hija cómo funciona la creación de productos digitales.
- **Experimentación:** Usar la inteligencia artificial como asistente de programación para acelerar el desarrollo y resolver problemas lógicos y visuales.
- **Integración Diseño-Código:** Trasladar exitosamente un diseño de interfaz gráfica desde Figma hacia un entorno web funcional utilizando variables, tokens de diseño y HTML/CSS/JS.

## 2. Desarrollo e Implementación Técnica

### 2.1. Arquitectura y Estilos (Figma a Código)
- **Importación de Variables de Figma:** Se comenzó estructurando el proyecto traduciendo los tokens de diseño de Figma a código. Se creó un sistema de archivos SCSS (`_primitives.scss`, `_components.scss`, etc.) para manejar paletas de colores primitivos (Rosa, Amarillo, Verde, Azul, Morado, Gris).
- **Herramientas de Frontend:** Se utilizó HTML5 básico, Bootstrap adaptado a SCSS para la grilla y utilidades, y animaciones 100% hechas en CSS/SCSS nativo (sin usar canvas o librerías de JS externas). Para íconos utilizamos SVG propios y FontAwesome consumido vía CDN.

### 2.2. Conexión a las APIs
El núcleo de la aplicación necesitaba reflejar el clima real del usuario. Para ello implementamos dos servicios externos (APIs) de forma gratuita y sin llaves (API keys):
1. **API de Geolocalización (BigDataCloud):** Al cargar la app, se le piden permisos de ubicación al navegador (`navigator.geolocation`). Con la latitud y longitud, consultamos BigDataCloud para traducir esas coordenadas al nombre real de la ciudad del usuario.
2. **API Climática (Open-Meteo):** Con estas mismas coordenadas, llamamos a Open-Meteo para extraer la temperatura actual, si es de día o de noche (`is_day`), el código meteorológico oficial (WMO code), y el pronóstico detallado de las siguientes 4 horas.

### 2.3. Lógica del Clima y Variaciones del Personaje
En el archivo `app.js`, construimos una lógica robusta (`getThemeAndAssets`) para interpretar más de 16 códigos meteorológicos de WMO y traducirlos a estados visuales (temas) en SunnyPop.
Además, la mascota de la app cuenta con muchísimas variaciones visuales que reaccionan a variables independientes (clima, temperatura y hora del día):

- **Soleado (`sol`):** El protagonista es el Sol. Para más dinamismo, se elige el diseño al azar entre tres variables (`Sol.png`, `sol2.png`, `sol3.png`).
- **Templado / Frío (`viento, nublado, niebla`):** Evaluamos la temperatura. Si el ambiente está entre 10°C y 20°C, usamos un personaje de frío ligero (`frio-bajo`). Si baja de 10°C, usamos atuendos de invierno pesado intercambiando aleatoriamente entre `frio1.png` y `frio2.png`.
- **Lluvia y Tormentas (`lluvia, tormenta`):** Alternamos de forma aleatoria a nuestro personaje con gabardina amarilla y sombrilla (`lluvia.png` y `lluvia2.png`).
- **Niebla Calurosa (`niebla-calor`):** Si hay niebla pero hacen más de 20°C, sabemos que el sol causa vapor, así que cargamos el estado soleado dentro del banco de niebla en lugar del personaje de frío.
- **Granizo o Nieve (`granizo, nieve`):** Nuestro personaje vestido para la nevada extrema (`nieve.png`).
- **Modo Nocturno / Hora de Dormir:** Una vez que Open-Meteo dicta que en la ciudad del usuario no hay luz solar (`is_day === 0`), sobrescribimos forzosamente *todos* los personajes por nuestro estado en Pijama (`pijama.png`), colocamos un ícono de Luna y obscurecemos al instante los colores de toda la aplicación web.

### 2.4. Animaciones en CSS (La magia visual)
Intentamos dar vida al clima a través de múltiples animaciones CSS personalizadas manejadas bajo selectores en SASS (`_animaciones.scss`), logrando muchísimos iteraciones y pruebas de velocidad/opacidad para que se viera creíble:

1. **Viento:** Hicimos un parallax de fondo simulando ráfagas rápidas de nubes cruzando la app en 10s.
2. **Lluvia (Dividida en 3):**
   - *Baja:* Gotas pequeñas, lentas y esparcidas.
   - *Moderada:* Gotas más grandes y rítmicas.
   - *Alta:* Pantalla tupida de ráfagas diagonales rapidísimas (animación de 1 a 2 segundos).
3. **Nieve:** Partículas gruesas y difuminadas cayendo en cámara muy lenta.
4. **Tormenta:** Heredamos la capa densa de "Lluvia Alta" y le sumamos animaciones a los brillos del fondo (`filter: brightness`) programadas a 7 segundos para arrojar fuertes y explosivos destellos simulando Relámpagos.
5. **Granizo:** Puntos blancos sólidos en lugar de gotas, que caen rectos y súper rápido (`1.5s`) desde el cielo simulando la pesadez de las piedras de hielo.
6. **Niebla:** Uno de nuestros mayores retos visuales. Programamos dos bancos de niebla cruzados (`fog-drift`) usando gradientes ultra-opacos y el filtro `blur(15px)` para simular humo masivo cruzando y tapando tu visión frontal.
7. **Nublado (Día Cerrado):** Un enjambre de múltiples SVG de nubes puestas a trasladarse pasivamente a través de toda la pantalla tomando 60 segundos enteros, dando un efecto calmado y pesado al cielo.
8. **Efectos sobre el Personaje:** Añadimos `float-gentle` (flotar tranquilo) para climas cálidos y `sway` (temblar y mecerse de frío) para climas hostiles o invernales.

### 2.5. Publicación y Entrega
Al finalizar, configuramos Git para guardar los progresos en la plataforma GitHub y utilizamos el motor gratuito **GitHub Pages** para extraer la rama principal (`main`) y colocar el proyecto 100% funcional en internet, haciéndolo navegable directamente desde el celular para nosotros y el público en general.

---
**Recursos Técnicos Finales:**
- Vanilla Javascript
- SCSS / SASS para organización de estilos.
- Fetch API (Async/Await)
- GitHub & GitHub Pages para CD/CI básica.
