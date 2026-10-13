# ASCII GIF Studio

**Turn videos into animated ASCII art — right in your browser.**

ASCII GIF Studio is a lightweight, browser-based tool that transforms videos into animated ASCII GIFs. Customize the characters, colors, resolution, font size, and frame rate to create your own text-based animations.

[**Try it online →**](https://asciigif.vercel.app/)

## ✨ Features

- 🎬 **Video to ASCII** — Convert videos into animated ASCII art.
- 🎨 **Colored ASCII** — Preserve video colors in the generated artwork.
- 🔤 **Custom Characters** — Choose your own character set to control the ASCII style.
- 🌗 **Brightness Inversion** — Reverse the brightness mapping for different visual effects.
- 📏 **Adjustable Width** — Control the horizontal resolution of your ASCII output.
- 🔎 **Font Size Control** — Fine-tune the appearance of your generated artwork.
- 🎞️ **FPS Control** — Adjust the output frame rate for smoother or smaller animations.
- ⏱️ **Duration Limits** — Generate clips from a few seconds or process the entire video.
- 📥 **GIF Export** — Preview and download your generated animation.
- 📱 **Responsive Interface** — Use the tool on desktop or mobile browsers.
- 🔒 **Browser-Based Processing** — Work with local video files without uploading them to a dedicated conversion server.

## 🚀 Getting Started

### Try Online

Visit **[asciigif.vercel.app](https://asciigif.vercel.app/)** to start converting videos.

### Run Locally

No build tools or package installation are required for the basic static application.

1. Clone the repository:

   ```bash
   git clone https://github.com/luvbyte/asciigif.git
   ```

2. Open the project directory:

   ```bash
   cd asciigif
   ```

3. Open `index.html` in your browser.

Alternatively, start a local development server:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## 📖 How to Use

1. Open ASCII GIF Studio.
2. Drop a video into the upload area or select one from your device.
3. Customize the ASCII characters, duration, output width, font size, and FPS.
4. Enable **Colored ASCII** to retain the source video's colors.
5. Enable **Invert Brightness** to reverse the brightness mapping.
6. Click **Generate GIF** and wait for the conversion to finish.
7. Preview your animation and click **Download GIF** to save it.

## ⚙️ Customization

| Setting | Description |
| --- | --- |
| ASCII Characters | Define the characters used to represent different brightness levels. |
| Maximum Duration | Choose a clip length or process the entire video. |
| ASCII Width | Adjust the horizontal detail of the output. |
| Font Size | Change the size of the ASCII characters. |
| Output FPS | Control the number of frames generated per second. |
| Colored ASCII | Generate colored rather than monochrome ASCII artwork. |
| Invert Brightness | Reverse the mapping between brightness and characters. |

### Custom Character Example

```text
@%#*+=-:.
```

Characters are mapped from dark to bright. Experiment with different character sequences to create unique ASCII styles.

## 🛠️ Built With

- **HTML5** — Application structure and video elements.
- **CSS3** — Styling and responsive layout.
- **JavaScript** — Video processing, ASCII rendering, and GIF generation.
- **Browser APIs** — Local file selection and media processing.

## 📁 Project Structure

```text
asciigif/
├── index.html   # Application interface
├── style.css    # Styling and responsive layout
├── script.js    # Conversion logic and interactions
└── README.md    # Project documentation
```

## 🌐 Browser Compatibility

ASCII GIF Studio is designed for modern browsers with support for HTML5 video and the browser APIs required by the application.

Supported video formats depend on the browser and operating system. MP4, WebM, and MOV may work when the browser supports the specific codecs used by the file.

Long or high-resolution videos may require more processing time and memory.

## 🤝 Contributing

Contributions, bug reports, feature requests, and suggestions are welcome!

1. Fork this repository.
2. Create a branch for your changes.
3. Commit your improvements.
4. Open a pull request.

For significant changes, consider opening an issue first to discuss your ideas.

## 📄 License

ASCII GIF Studio is licensed under the [MIT License](LICENSE).

You are free to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software, subject to the terms of the license.

See the [`LICENSE`](LICENSE) file for the full license text.
## ⭐ Support

If you find ASCII GIF Studio useful, consider giving the repository a star on GitHub!

**Repository:** [github.com/luvbyte/asciigif](https://github.com/luvbyte/asciigif)

**Live Demo:** [asciigif.vercel.app](https://asciigif.vercel.app/)
