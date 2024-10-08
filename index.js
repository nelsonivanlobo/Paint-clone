/* para que funcione en telefonos cambiar el metodo por tap */

// CONSTANTS
const MODES = { 
    DRAW: 'draw',
    ERASE: 'erase',
    RECTANGLE: 'rectangle',
    ELLIPSE: 'ellipse',
    PICKER: 'picker'
  }

  // UTILITIES
const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)

  // ELEMENTS
  const $canvas = $('#canvas')
  const $colorPicker = $('#color-picker')
  const $clearBtn = $('#clear-btn')
  const $drawBtn = $('#draw-btn')
  const $eraseBtn = $('#erase-btn')
  const $rectangleBtn = $('#rectangle-btn')
  const $pickerBtn = $('#picker-btn')
  const $ellipseBtn = $('#ellipse-btn');

  const ctx = $canvas.getContext('2d')

  // STATE
  let isDrawing = false
  let isShiftPressed = false
  let startX, startY
  let lastX = 0
  let lastY = 0
  let mode = MODES.DRAW 
  let imageData

  // EVENTS
  $canvas.addEventListener('mousedown', startDrawing)
  $canvas.addEventListener('mousemove', draw)
  $canvas.addEventListener('mouseup', stopDrawing)
  $canvas.addEventListener('mouseleave', stopDrawing)
  $colorPicker.addEventListener('change', handleChangeColor)
  $clearBtn.addEventListener('click', clearCanvas)
  $ellipseBtn.addEventListener('click', () => setMode(MODES.ELLIPSE));

  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  $pickerBtn.addEventListener('click', () => {
    setMode(MODES.PICKER)
  })

  $eraseBtn.addEventListener('click', () => {
    setMode(MODES.ERASE)
  })

  $rectangleBtn.addEventListener('click', () => {
    setMode(MODES.RECTANGLE)
  })

  $drawBtn.addEventListener('click', () => {
    setMode(MODES.DRAW)
  })

  // METHODS
  function startDrawing(event) {
    isDrawing = true;

    const { offsetX, offsetY } = getEventPosition(event);
    [startX, startY] = [offsetX, offsetY];
    [lastX, lastY] = [offsetX, offsetY];

    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function draw(event) {
    if (!isDrawing) return;

    const { offsetX, offsetY } = getEventPosition(event);

    if (mode === MODES.DRAW || mode === MODES.ERASE) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();

        [lastX, lastY] = [offsetX, offsetY];
        return;
    }

    // Código para el modo RECTANGLE...
    if (mode === MODES.RECTANGLE) {
      ctx.putImageData(imageData, 0, 0);

      let width = offsetX - startX
      let height = offsetY - startY

      if (isShiftPressed) {
        const sideLength = Math.min(
          Math.abs(width),
          Math.abs(height)
        )

        width = width > 0 ? sideLength : -sideLength
        height = height > 0 ? sideLength : -sideLength
      }

      ctx.beginPath()
      ctx.rect(startX, startY, width, height)
      ctx.stroke()
      return
    }

    // Código para el modo CIRCLE
if (mode === MODES.ELLIPSE) {
  ctx.putImageData(imageData, 0, 0);

  let radiusX = Math.abs(offsetX - startX) / 2;
  let radiusY = Math.abs(offsetY - startY) / 2;

  let centerX = startX + (offsetX - startX) / 2;
  let centerY = startY + (offsetY - startY) / 2;

  if (isShiftPressed) {
    const radius = Math.min(radiusX, radiusY);
    radiusX = radius;
    radiusY = radius;
  }

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();
  return;
}
}

function getEventPosition(event) {
    const rect = $canvas.getBoundingClientRect(); 
    const x = (event.clientX - rect.left) * ($canvas.width / rect.width);
    const y = (event.clientY - rect.top) * ($canvas.height / rect.height);

    return { offsetX: x, offsetY: y };
}

  function stopDrawing(event) {
    isDrawing = false
  }

  function handleChangeColor() {
    const { value } = $colorPicker
    ctx.strokeStyle = value
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  async function setMode(newMode) {
    let previousMode = mode;
    mode = newMode;
  
    // Limpiar el botón activo actual
    $('button.active')?.classList.remove('active');
  
    if (mode === MODES.DRAW) {
      $drawBtn.classList.add('active');
      canvas.style.cursor = 'crosshair';
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 5;
      return;
    }
  
    if (mode === MODES.RECTANGLE) {
      $rectangleBtn.classList.add('active');
      canvas.style.cursor = 'nw-resize';
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 5;
      return;
    }
  
    if (mode === MODES.ERASE) {
      $eraseBtn.classList.add('active');
      canvas.style.cursor = 'url("./img/erase.png") 0 24, auto';
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
      return;
    }
  
    if (mode === MODES.PICKER) {
      $pickerBtn.classList.add('active');
      const eyeDropper = new window.EyeDropper();
  
      try {
        const result = await eyeDropper.open();
        const { sRGBHex } = result;
        ctx.strokeStyle = sRGBHex;
        $colorPicker.value = sRGBHex;
        setMode(previousMode);
      } catch (e) {
        // Si el usuario cancela o hay un error
      }
      return;
    }
  
    if (mode === MODES.ELLIPSE) {
      $ellipseBtn.classList.add('active');
      canvas.style.cursor = 'crosshair';
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 5;
      return;
    }
  }
  
  function handleKeyDown({ key }) {
    isShiftPressed = key === 'Shift'
  }

  function handleKeyUp({ key }) {
    if (key === 'Shift') isShiftPressed = false
  }

  // INIT
  setMode(MODES.DRAW)

  if (typeof window.EyeDropper !== 'undefined') {
    $pickerBtn.removeAttribute('disabled')
  }

  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'