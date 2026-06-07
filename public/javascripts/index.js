const listEl = document.getElementById("file-list");
const uploadForm = document.getElementById("uploadForm");
const breadcrumbs = document.querySelector(".breadcrumbs");

let currentPath = "";

function fetchFiles(path = "") {
    currentPath = path;
    fetch(`/api/list?dir=${encodeURIComponent(path)}`)
        .then(res => res.json())
        .then(data => {
            listEl.innerHTML = "";
            breadcrumbs.innerHTML = "";

            // 🔁 breadcrumbs
            const parts = path.split("/").filter(p => p);
            let fullPath = "";
            const rootLink = document.createElement("a");
            rootLink.href = "#";
            rootLink.textContent = "Root";
            rootLink.onclick = () => fetchFiles("");
            breadcrumbs.appendChild(rootLink);

            parts.forEach((part, i) => {
                breadcrumbs.appendChild(document.createTextNode(" / "));
                fullPath += (i > 0 ? "/" : "") + part;
                const crumb = document.createElement("a");
                crumb.href = "#";
                crumb.textContent = part;
                crumb.onclick = () => fetchFiles(parts.slice(0, i + 1).join("/"));
                breadcrumbs.appendChild(crumb);
            });

            // 📂 folders & files
            data.items.forEach(item => {
                const li = document.createElement("li");
                if (item.type === "folder") {
                    const folderSpan = document.createElement("span");
                    folderSpan.textContent = `📁 ${item.name}`;
                    folderSpan.style.cursor = "pointer";
                    folderSpan.onclick = () => {
                        fetchFiles(path ? `${path}/${item.name}` : item.name);
                    };

                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "🗑️ Delete";
                    deleteBtn.style.marginLeft = "10px";

                    deleteBtn.onclick = () => {
                        if (confirm(`Delete folder "${item.name}" and all its contents?`)) {
                            fetch(`/api/delete?name=${encodeURIComponent(path ? `${path}/${item.name}` : item.name)}`, {
                                method: "DELETE"
                            })
                                .then(res => res.text())
                                .then(msg => {
                                    alert(msg);
                                    fetchFiles(currentPath);
                                })
                                .catch(() => alert("Failed to delete folder"));
                        }
                    };

                    li.appendChild(folderSpan);
                    li.appendChild(deleteBtn);

                } else {
                    const fileLink = document.createElement("a");
                    fileLink.href = `/files/${path ? `${path}/` : ""}${item.name}`;
                    fileLink.textContent = `📄 ${item.name}`;
                    fileLink.target = "_blank";
                    li.appendChild(fileLink);

                    // 👇 Create the delete button
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "🗑️ Delete";
                    deleteBtn.style.marginLeft = "10px";

                    deleteBtn.onclick = () => {
                        if (confirm(`Delete "${item.name}"?`)) {
                            fetch(`/api/delete?name=${encodeURIComponent(path ? `${path}/${item.name}` : item.name)}`, {
                                method: "DELETE"
                            })
                                .then(res => res.text())
                                .then(msg => {
                                    alert(msg);
                                    fetchFiles(currentPath); // refresh the file list after deleting
                                })
                                .catch(err => alert("Failed to delete file"));
                        }
                    };

                    li.appendChild(fileLink);
                    li.appendChild(deleteBtn);
                }
                listEl.appendChild(li);
            });
        });
}

uploadForm.onsubmit = (e) => {
    document.getElementById("currentPathInput").value = currentPath; // set this dynamically
    e.preventDefault();
    const formData = new FormData(uploadForm);
    fetch(`/api/upload`, {
        method: "POST",
        body: formData
    }).then(res => res.text())
        .then(msg => {
            alert(msg);
            fetchFiles(currentPath);
        });
};
document.getElementById("createFolderBtn").onclick = () => {
    const folderName = document.getElementById("newFolderName").value.trim();
    if (!folderName) {
        alert("Please enter a folder name.");
        return;
    }

    fetch("/api/create-folder", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            folderName,
            path: currentPath // send current folder path, so it creates inside it
        })
    })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            document.getElementById("newFolderName").value = ""; // clear input
            fetchFiles(currentPath); // refresh file list
        })
        .catch(() => alert("Failed to create folder."));
};


fetchFiles();