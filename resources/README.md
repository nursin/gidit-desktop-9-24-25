This folder contains additional resources bundled with the Gidit Desktop application.

- **python-runtime/** – a portable Python interpreter for each supported platform.  The actual
  binaries will be downloaded and placed here when building for production.  During
  development the application uses your system Python.
- **models/** – local AI models such as gemma3‑270m.  The build scripts will download
  the model weights into this directory.  In this repository we include only placeholder
  files to maintain the directory structure.
- **bin/** – optional platform‑specific executables such as the Ollama binary.  These
  would be added during the build process if you choose to bundle them.