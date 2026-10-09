const $ = id => document.getElementById(id);

const video = $("video");
const input = $("videoInput");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", {
  willReadFrequently: true
});

const ASCII_CHARS =
  " .'`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

let videoURL = null;
let gifURL = null;
let cancelRequested = false;
let previewTimer = null;

const fontFamily = "monospace";

function setStatus(message) {
  $("status").textContent = message;
}

// Reset the previous GIF preview and download state.
function resetGIFPreview() {
  // Revoke the previous GIF URL to free memory.
  if (gifURL) {
    URL.revokeObjectURL(gifURL);
    gifURL = null;
  }

  // Restore the default preview placeholder.
  $("gifPreview").replaceChildren();

  const placeholder = document.createElement("span");
  placeholder.className = "muted";
  placeholder.textContent = "Your GIF will appear here.";

  $("gifPreview").appendChild(placeholder);

  // Clear the previous download link.
  $("download").removeAttribute("href");
  $("download").classList.add("hidden");

  // Reset progress.
  $("progress").value = 0;
}

function updateLabels() {
  $("widthValue").textContent = $("width").value;
  $("fontValue").textContent = $("fontSize").value;
  $("fpsValue").textContent = $("fps").value;
}

["width", "fontSize", "fps"].forEach(id => {
  $(id).addEventListener("input", updateLabels);
});

["colored", "invert", "asciiSet"].forEach(id => {
  $(id).addEventListener(id === "asciiSet" ? "input" : "change", renderPreview);
});

function loadVideo(file) {
  if (!file || !file.type.startsWith("video/")) {
    setStatus("Please select a supported video file.");
    return;
  }

  if (videoURL) URL.revokeObjectURL(videoURL);

  videoURL = URL.createObjectURL(file);
  video.src = videoURL;

  $("fileTitle").textContent = file.name;
  $("convert").disabled = true;

  video.onloadedmetadata = () => {
    $("convert").disabled = false;

    setStatus(
      `Video: ${video.videoWidth} × ${video.videoHeight} · ` +
        `${video.duration.toFixed(2)} seconds`
    );

    renderPreview();
  };

  video.onerror = () => {
    setStatus("Unable to decode this video in your browser.");
  };

  video.load();
}

input.addEventListener("change", () => {
  loadVideo(input.files[0]);
});

const dropzone = $("dropzone");

dropzone.addEventListener("dragover", event => {
  event.preventDefault();
  dropzone.classList.add("dragging");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragging");
});

dropzone.addEventListener("drop", event => {
  event.preventDefault();
  dropzone.classList.remove("dragging");
  loadVideo(event.dataTransfer.files[0]);
});

function getDimensions() {
  const originalWidth = video.videoWidth;
  const originalHeight = video.videoHeight;
  const width = Number($("width").value);
  const fontSize = Number($("fontSize").value);

  const temp = document.createElement("canvas");
  const tempctx = temp.getContext("2d");

  tempctx.font = `${fontSize}px monospace`;

  const charWidth = tempctx.measureText("M").width;
  const charHeight = fontSize * 1.2;

  const height = Math.max(
    1,
    Math.round(
      (width * originalHeight * charWidth) / (originalWidth * charHeight)
    )
  );

  return {
    width,
    height,
    charWidth,
    charHeight
  };
}

function renderASCII(source) {
  const { width, height, charWidth, charHeight } = getDimensions();

  const fontSize = Number($("fontSize").value);
  const colored = $("colored").checked;
  const invert = $("invert").checked;

  const customChars = $("asciiSet").value;
  const charsToUse = [...customChars].length
    ? [...customChars]
    : [...ASCII_CHARS];

  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;

  const offctx = offscreen.getContext("2d", {
    willReadFrequently: true
  });

  offctx.drawImage(source, 0, 0, width, height);

  const pixels = offctx.getImageData(0, 0, width, height).data;

  const outputWidth = Math.ceil(width * charWidth);
  const outputHeight = Math.ceil(height * charHeight);

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = "top";

  let text = "";

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      let brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      if (invert) brightness = 255 - brightness;

      const index = Math.min(
        charsToUse.length - 1,
        Math.floor((brightness / 256) * charsToUse.length)
      );

      const char = charsToUse[index];

      ctx.fillStyle = colored
        ? `rgb(${r},${g},${b})`
        : `rgb(${brightness | 0},${brightness | 0},${brightness | 0})`;

      ctx.fillText(char, x * charWidth, y * charHeight);

      text += char;
    }

    text += "\n";
  }

  return canvas.toDataURL("image/png");
}

function renderPreview() {
  if (!video.videoWidth || video.readyState < 2) return;

  clearTimeout(previewTimer);

  previewTimer = setTimeout(() => {
    try {
      renderASCII(video);
    } catch (error) {
      console.error(error);
    }
  }, 80);
}

video.addEventListener("seeked", renderPreview);
video.addEventListener("loadeddata", renderPreview);

/*
  Minimal GIF89a encoder.

  Uses a 3-3-2 RGB palette and LZW compression.
  Each frame is independently encoded.
*/

function encodeGIF(frames, width, height, delay) {
  const bytes = [];

  const push = (...values) => bytes.push(...values);

  const u16 = value => {
    push(value & 255, (value >> 8) & 255);
  };

  const text = value => {
    for (const char of value) push(char.charCodeAt(0));
  };

  text("GIF89a");
  u16(width);
  u16(height);

  // Global color table: 256 RGB colors.
  push(0xf7, 0, 0);

  for (let i = 0; i < 256; i++) {
    const r = (((i >> 5) & 7) * 255) / 7;
    const g = (((i >> 2) & 7) * 255) / 7;
    const b = ((i & 3) * 255) / 3;

    push(r | 0, g | 0, b | 0);
  }

  // Infinite looping.
  push(0x21, 0xff, 0x0b);
  text("NETSCAPE2.0");
  push(3, 1, 0, 0, 0);

  for (const frame of frames) {
    // Graphic control extension.
    push(0x21, 0xf9, 4, 0);

    u16(Math.max(2, Math.round(delay / 10)));

    push(0, 0);

    // Image descriptor.
    push(0x2c);
    u16(0);
    u16(0);
    u16(width);
    u16(height);
    push(0);

    // Minimum LZW code size.
    push(8);

    const pixels = frame;
    const minCodeSize = 8;
    const clearCode = 1 << minCodeSize;
    const endCode = clearCode + 1;

    let codeSize = minCodeSize + 1;
    let nextCode = endCode + 1;

    let dictionary = new Map();

    function resetDictionary() {
      dictionary = new Map();

      for (let i = 0; i < clearCode; i++) {
        dictionary.set(String(i), i);
      }

      codeSize = minCodeSize + 1;
      nextCode = endCode + 1;
    }

    const compressed = [];

    let bitBuffer = 0;
    let bitCount = 0;

    function writeCode(code) {
      bitBuffer |= code << bitCount;
      bitCount += codeSize;

      while (bitCount >= 8) {
        compressed.push(bitBuffer & 255);
        bitBuffer >>>= 8;
        bitCount -= 8;
      }
    }

    resetDictionary();
    writeCode(clearCode);

    let prefix = String(pixels[0]);

    for (let i = 1; i < pixels.length; i++) {
      const symbol = String(pixels[i]);
      const combined = prefix + "," + symbol;

      if (dictionary.has(combined)) {
        prefix = combined;
        continue;
      }

      writeCode(dictionary.get(prefix));

      if (nextCode < 4096) {
        dictionary.set(combined, nextCode++);

        if (nextCode > 1 << codeSize && codeSize < 12) {
          codeSize++;
        }
      } else {
        writeCode(clearCode);
        resetDictionary();
      }

      prefix = symbol;
    }

    writeCode(dictionary.get(prefix));
    writeCode(endCode);

    if (bitCount > 0) {
      compressed.push(bitBuffer & 255);
    }

    // GIF data sub-blocks are at most 255 bytes.
    for (let i = 0; i < compressed.length; i += 255) {
      const block = compressed.slice(i, i + 255);

      push(block.length);
      push(...block);
    }

    push(0);
  }

  push(0x3b);

  return new Uint8Array(bytes);
}

function quantizeFrame(source, width, height) {
  const temp = document.createElement("canvas");
  temp.width = width;
  temp.height = height;

  const context = temp.getContext("2d", {
    willReadFrequently: true
  });

  context.drawImage(source, 0, 0, width, height);

  const rgba = context.getImageData(0, 0, width, height).data;

  const indices = new Uint8Array(width * height);

  for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
    indices[p] =
      ((rgba[i] >> 5) << 5) | ((rgba[i + 1] >> 5) << 2) | (rgba[i + 2] >> 6);
  }

  return indices;
}

function seekTo(time) {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error("Unable to seek video."));
    };

    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };

    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    video.currentTime = time;
  });
}

$("cancel").addEventListener("click", () => {
  cancelRequested = true;
  setStatus("Cancelling...");
});

$("convert").addEventListener("click", async () => {
  if (!video.videoWidth) return;

  // Clear the previous GIF as soon as generation starts.
  resetGIFPreview();

  cancelRequested = false;

  $("convert").disabled = true;
  $("cancel").classList.remove("hidden");
  $("progress").classList.remove("hidden");
  $("progress").value = 0;
  $("download").classList.add("hidden");

  const { width, height } = getDimensions();

  const fps = Number($("fps").value);
  const maxDuration = Number($("duration").value);

  const duration = Math.min(video.duration, maxDuration || video.duration);

  const frameCount = Math.max(1, Math.ceil(duration * fps));

  const delay = 1000 / fps;

  const frames = [];

  try {
    for (let i = 0; i < frameCount; i++) {
      if (cancelRequested) break;

      const time = Math.min(i / fps, Math.max(0, video.duration - 0.001));

      await seekTo(time);

      renderASCII(video);

      frames.push(quantizeFrame(canvas, canvas.width, canvas.height));

      $("progress").value = ((i + 1) / frameCount) * 100;

      setStatus(`Rendering frame ${i + 1} / ${frameCount}`);

      // Yield to the browser between frames.
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    if (cancelRequested) {
      setStatus("Conversion cancelled.");
      return;
    }

    if (!frames.length) {
      throw new Error("No frames generated.");
    }

    setStatus("Encoding GIF...");

    const gif = encodeGIF(frames, canvas.width, canvas.height, delay);

    const blob = new Blob([gif], {
      type: "image/gif"
    });

    if (gifURL) URL.revokeObjectURL(gifURL);

    gifURL = URL.createObjectURL(blob);

    const img = document.createElement("img");
    img.src = gifURL;
    img.alt = "Generated ASCII GIF";

    $("gifPreview").replaceChildren(img);

    $("download").href = gifURL;
    $("download").download = "ascii.gif";
    $("download").classList.remove("hidden");

    setStatus(
      `Done! ${frames.length} frames · ` +
        `${(blob.size / 1024 / 1024).toFixed(2)} MB`
    );
  } catch (error) {
    console.error(error);
    setStatus(`Error: ${error.message}`);
  } finally {
    $("convert").disabled = false;
    $("cancel").classList.add("hidden");
    $("progress").classList.add("hidden");
    cancelRequested = false;
  }
});

updateLabels();
