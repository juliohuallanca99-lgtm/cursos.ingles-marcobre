# English Pathway 2.1 — CEFR Learning Suite (A1–C1)

Plataforma web estática para aprender inglés, con espacio para estudiantes y para docentes. No necesita servidor, base de datos ni dependencias: es solo HTML, CSS y JavaScript.

## Estructura

```
english-pathway/
├── index.html        # Estructura de la página (cabecera, menú lateral, modal)
├── css/styles.css    # Estilos (3 capas: base, rediseño 2.0 y ajustes 2.1)
└── js/app.js         # Lógica y banco de contenidos
```

## Módulos

| Página | Qué hace |
|---|---|
| Home / Learning Path | Panel principal y ruta de 18 meses (módulos A1.1 → B1.2) |
| Level check | Diagnóstico de 20 preguntas → nivel indicativo A1–C1 |
| Grammar | 47 temas con reglas, ejemplos y ejercicios (opción múltiple, completar, ordenar, corregir) |
| Vocabulary | 45 sets temáticos con traducción al español, ejemplos y pronunciación |
| Listening | 30 audios generados con la voz del navegador (Web Speech API), transcripción y huecos |
| Reading | 30 lecturas graduadas con preguntas de comprensión |
| Speaking | Consignas + grabación de voz con el micrófono (MediaRecorder) |
| Writing | Taller de escritura con contador de palabras |
| Student / Teacher | Tareas, entregas, feedback y exportación a CSV |
| Progress | Avance por habilidad |

Contenido por nivel: A1 y A2 → 10 temas de gramática; B1, B2 y C1 → 9. Todos los niveles tienen 9 sets de vocabulario, 6 lecturas y 6 audios.

## Datos

Todo se guarda en el `localStorage` del navegador (claves `ep_*`). Los datos **no se sincronizan** entre equipos ni entre estudiante y docente. Para eso haría falta un backend (por ejemplo, Supabase).

## Publicar

**GitHub Pages:** Settings → Pages → Branch `main` / carpeta `/ (root)`.
**Vercel:** importar el repositorio. Framework preset: *Other*, sin comando de build.

## Ver en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Notas técnicas

El archivo creció por capas (1.0 → 2.0 → 2.1). Las versiones nuevas redefinen funciones de las anteriores, por ejemplo `render`, `epGrammar` o `epListening`. Siempre gana la última definición. Hay código antiguo (`renderHome`, `renderGrammar`, etc.) que ya no se usa y que se puede limpiar más adelante.
