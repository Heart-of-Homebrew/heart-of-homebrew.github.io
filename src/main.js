fetch('./assets/META-INF/manifest.json')
    .then(response => response.json())
    .then(data => {
    const footerElement = document.getElementById("footer");
    footerElement.innerHTML = `${data.version} (alpha)<br>&copy; Heart of Homebrew 2025`;
})
    .catch(error => {
    console.error('Error loading JSON:', error);
});

function viewPdf() {
    const fileInput = document.getElementById("pdfFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file first.");
        return;
    }

    if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed.");
        return;
    }

    const fileURL = URL.createObjectURL(file);

    const iframe = document.getElementById("pdfIframe");
    const viewerContainer = document.getElementById("pdfViewerContainer");
    iframe.src = fileURL;
    viewerContainer.style.display = "block";
}

function closeIframe() {
    const viewerContainer = document.getElementById("pdfViewerContainer");
    viewerContainer.style.display = "none";
}