document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("uploadForm").addEventListener("submit", function(e) {
        e.preventDefault();
    
        fetch("/upload", {
            method: "POST",
            body: new FormData(this)
        }).then(res => res.json()).then(data => {
            console.log(data);
        });
    });
});