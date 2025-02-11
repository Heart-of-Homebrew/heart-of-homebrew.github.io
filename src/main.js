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
    const fileInput = document.getElementById("pdfFile");
    const loadButton = document.getElementById("loadButton");
    const file = fileInput.files[0];
    viewerContainer.style.display = "none";
    fileInput.style.visibility = "inline-block";

}