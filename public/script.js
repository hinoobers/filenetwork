document.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.getElementById("uploadProgress");
    const uploadModal = document.getElementById("uploadModal");
    const uploadForm = document.getElementById("uploadForm");
    const downloadButton = document.getElementById("download");
    const viewButton = document.getElementById("view");

    let downloadLink, viewLink;

    uploadForm.addEventListener("submit", function(e) {
        e.preventDefault();

        progressBar.style.display = "block";

        const formData = new FormData(uploadForm);
    
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/upload");

        xhr.upload.addEventListener("progress", function(event) {
            if (event.lengthComputable) {
                const percent = (event.loaded / event.total) * 100;
                progressBar.value = percent;
            }
        });

        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                progressBar.style.display = "none";

                uploadModal.style.display = "flex";
                downloadLink = response.downloadURL;
                viewLink = response.viewURL;
            } else {
                console.error("Upload failed:", xhr.status, xhr.statusText);
            }
            progressBar.style.display = "none";
        };

        xhr.onerror = function() {
            console.error("Upload failed:", xhr.status, xhr.statusText);
            progressBar.style.display = "none";
        };

        xhr.send(formData);
    });

    downloadButton.addEventListener("click", function() {
        navigator.clipboard.writeText(downloadLink);
        downloadButton.innerText = "Copied!";
        setTimeout(() => {
            downloadButton.innerText = "Download";
        }, 2000);
    });

    viewButton.addEventListener("click", function() {
        navigator.clipboard.writeText(viewLink);
        viewButton.innerText = "Copied!";
        setTimeout(() => {
            viewButton.innerText = "View";
        }, 2000);
    });

    document.addEventListener("click", function(e) {
        // check if they clicked anywhere near uploadModal
        if(e.target != uploadModal && !uploadModal.contains(e.target)) {
            uploadModal.style.display = "none";
        }
    });
});