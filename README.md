# TwonetPDF (v1.0.1)

Aplicación web de **2net** para adjuntar múltiples capturas o imágenes en un solo archivo **PDF A4** sin necesidad de descargar o guardar previamente las imágenes en la PC. Construida con **HTML, CSS y JavaScript** usando **jsPDF**.

## Características

- **Identidad visual:** logotipo minimalista (documento/hoja con detalle “2net”), estilo corporativo con fondo gris claro, hoja A4 blanca, azul corporativo y acciones de eliminación en rojo suave.
- **Header fijo:** selector de distribución A4 (**2, 3 o 4 campos**) y acciones **Descargar PDF**, **Imprimir** y **Eliminar todo** (con confirmación si hay datos).
- **Metadatos:** nombre del documento, descripción opcional y fecha fija automática (`DD/MM/YYYY`, no editable).
- **Lienzo A4 dinámico:** vista previa con proporción A4 y cuadrícula adaptable según la distribución seleccionada.
- **Carga de imágenes:** pegado directo con `Ctrl + V` sobre el campo seleccionado, además de arrastrar/soltar o selección de archivo. Títulos de campo editables y acciones **Reemplazar/Eliminar** por imagen.
- **Exportación:** generación de PDF A4 con jsPDF (nombre, versión, fecha, descripción, títulos e imágenes ajustadas proporcionalmente). Si no hay nombre, se usa `TwonetPDF_documento`.
- **Impresión:** diálogo de impresión del documento.
- **Web:** favicon, metaetiquetas del proyecto y diseño responsivo.

## Estructura del proyecto

```text
twonetPDF/
├─ html/
│  └─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  └─ app.js
├─ assets/
│  └─ favicon.svg
├─ docs/
│  ├─ Resumen_TwonetPDF_v1.0.0.html
│  ├─ Resumen_TwonetPDF_v1.0.0.pdf
│  ├─ Resumen_TwonetPDF_v1.0.1.html
│  └─ Resumen_TwonetPDF_v1.0.1.pdf
└─ README.md
```

## Uso

1. Abre [html/index.html](html/index.html) en tu navegador.
2. Selecciona la distribución A4 (2, 3 o 4 campos).
3. Completa el nombre y la descripción (opcional). La fecha se fija automáticamente.
4. Selecciona un campo y pega una imagen con `Ctrl + V`, o arrástrala/selecciónala desde tu equipo.
5. Usa **Descargar PDF** para generar el archivo A4 o **Imprimir** para imprimir el documento.

> **Nota:** la exportación con jsPDF carga la librería desde CDN, por lo que se requiere conexión a internet. El pegado con `Ctrl + V` depende del portapapeles y permisos del navegador.

## Versión

- **Actual:** v1.0.1
- **Resumen v1.0.1:** [docs/Resumen_TwonetPDF_v1.0.1.pdf](docs/Resumen_TwonetPDF_v1.0.1.pdf)
- **Resumen v1.0.0:** [docs/Resumen_TwonetPDF_v1.0.0.pdf](docs/Resumen_TwonetPDF_v1.0.0.pdf)

### Detalles v1.0.1
- Corrección responsiva del lienzo A4 para distribuciones de 3 y 4 campos (sin necesidad de scroll), ajustando la cuadrícula, eliminando alturas mínimas rígidas y optimizando espaciados/tipografía dentro de la hoja.
- Actualización de versión en UI, metadatos y PDF generado.
