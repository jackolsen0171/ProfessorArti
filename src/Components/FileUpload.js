import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [userId, setUserId] = useState("user_123"); // Replace with actual user ID

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file!");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", userId);

        try {
            const response = await axios.post("http://localhost:8000/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert(`File uploaded: ${response.data.filename}`);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    return (
        <div>
            <h2>Upload a Document</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;
