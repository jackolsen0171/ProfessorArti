import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = 'http://localhost:8001/api';

const FileUpload = () => {
    const [files, setFiles] = useState([]);
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles(selectedFiles);
        setUploadStatus(null);
        setError(null);
        setUploadProgress({});
        
        if (selectedFiles.length > 0) {
            // Validate file types
            const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                'text/markdown'];
            
            const invalidFiles = selectedFiles.filter(file => !allowedTypes.includes(file.type));
            
            if (invalidFiles.length > 0) {
                setError(`Invalid file types detected: ${invalidFiles.map(f => f.name).join(', ')}. Please select only: TXT, PDF, DOC, DOCX, or MD files.`);
                setFiles([]);
                event.target.value = '';
                return;
            }

            // Check for batch mode
            if (selectedFiles.length > 1) {
                setIsBatchMode(true);
            } else {
                setIsBatchMode(false);
            }

            // Check total size (50MB per file limit)
            const oversizedFiles = selectedFiles.filter(file => file.size > 50 * 1024 * 1024);
            if (oversizedFiles.length > 0) {
                setError(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 50MB per file.`);
                setFiles([]);
                event.target.value = '';
            }
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setError("Please select at least one file!");
            return;
        }

        setUploading(true);
        setError(null);
        setUploadStatus(null);
        setUploadProgress({});

        try {
            if (isBatchMode) {
                // Batch upload
                const formData = new FormData();
                files.forEach(file => {
                    formData.append("documents", file);
                });

                const response = await axios.post(`${API_BASE_URL}/documents/batch-upload`, formData, {
                    headers: { 
                        "Content-Type": "multipart/form-data"
                    },
                });

                if (response.data.success) {
                    const { totalFiles, successCount, errorCount, uploadedFiles, errors } = response.data.data;
                    
                    setUploadStatus({
                        type: 'success',
                        message: `Batch upload completed: ${successCount}/${totalFiles} files uploaded successfully!`,
                        data: {
                            totalFiles,
                            successCount,
                            errorCount,
                            uploadedFiles,
                            errors
                        }
                    });
                } else {
                    setError('Batch upload failed: ' + response.data.message);
                }
            } else {
                // Single file upload
                const formData = new FormData();
                formData.append("document", files[0]);

                const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
                    headers: { 
                        "Content-Type": "multipart/form-data"
                    },
                });

                if (response.data.success) {
                    setUploadStatus({
                        type: 'success',
                        message: `File "${response.data.data.originalName}" uploaded successfully!`,
                        data: response.data.data
                    });
                } else {
                    setError('Upload failed: ' + response.data.message);
                }
            }

            // Reset after successful upload
            setFiles([]);
            setIsBatchMode(false);
            document.getElementById('file-input').value = '';

        } catch (error) {
            console.error("Upload failed:", error);
            if (error.response) {
                setError(`Upload failed: ${error.response.data.message || error.response.data.error}`);
            } else if (error.request) {
                setError('Upload failed: Unable to connect to server. Please ensure the backend is running.');
            } else {
                setError('Upload failed: ' + error.message);
            }
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div style={{ 
            maxWidth: '500px', 
            margin: '20px auto', 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <h2 style={{ color: '#006B96', marginBottom: '20px' }}>📄 Upload Document</h2>
            
            <div style={{ marginBottom: '15px' }}>
                <input 
                    id="file-input"
                    type="file" 
                    onChange={handleFileChange}
                    accept=".txt,.pdf,.doc,.docx,.md"
                    multiple
                    style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px dashed #006B96',
                        borderRadius: '5px',
                        backgroundColor: 'white'
                    }}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                    Supported formats: TXT, PDF, DOC, DOCX, MD (Max 50MB each) • Select multiple files for batch upload
                </small>
            </div>

            {files.length > 0 && (
                <div style={{ 
                    marginBottom: '15px', 
                    padding: '10px', 
                    backgroundColor: '#e6f3ff', 
                    borderRadius: '5px',
                    border: '1px solid #006B96'
                }}>
                    <strong>Selected Files ({files.length}):</strong>
                    {isBatchMode && (
                        <div style={{ 
                            color: '#006B96', 
                            fontWeight: 'bold', 
                            marginBottom: '10px',
                            fontSize: '14px'
                        }}>
                            🔄 Batch Upload Mode
                        </div>
                    )}
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {files.map((file, index) => (
                            <div key={index} style={{ 
                                marginBottom: '8px', 
                                padding: '8px', 
                                backgroundColor: 'rgba(255,255,255,0.7)',
                                borderRadius: '3px',
                                fontSize: '13px'
                            }}>
                                📎 <strong>{file.name}</strong><br/>
                                📊 {formatFileSize(file.size)} • 🏷️ {file.type || 'Unknown type'}
                            </div>
                        ))}
                    </div>
                    <div style={{ 
                        marginTop: '10px', 
                        fontSize: '12px', 
                        color: '#666',
                        borderTop: '1px solid #ccc',
                        paddingTop: '8px'
                    }}>
                        Total size: {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                    </div>
                </div>
            )}

            {error && (
                <div style={{ 
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#ffe6e6',
                    border: '1px solid #ED1B2F',
                    borderRadius: '5px',
                    color: '#ED1B2F'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {uploadStatus && (
                <div style={{ 
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: uploadStatus.type === 'success' ? '#e6ffe6' : '#ffe6e6',
                    border: `1px solid ${uploadStatus.type === 'success' ? '#4CAF50' : '#ED1B2F'}`,
                    borderRadius: '5px',
                    color: uploadStatus.type === 'success' ? '#4CAF50' : '#ED1B2F'
                }}>
                    {uploadStatus.type === 'success' ? '✅' : '❌'} {uploadStatus.message}
                    
                    {/* Single file upload success */}
                    {uploadStatus.data && !uploadStatus.data.totalFiles && (
                        <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
                            Uploaded at: {new Date(uploadStatus.data.uploadedAt).toLocaleString()}
                        </div>
                    )}
                    
                    {/* Batch upload results */}
                    {uploadStatus.data && uploadStatus.data.totalFiles && (
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                                Batch Upload Summary:
                            </div>
                            <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                                ✅ Successful: {uploadStatus.data.successCount} files
                            </div>
                            {uploadStatus.data.errorCount > 0 && (
                                <div style={{ fontSize: '12px', marginBottom: '5px', color: '#ED1B2F' }}>
                                    ❌ Failed: {uploadStatus.data.errorCount} files
                                </div>
                            )}
                            
                            {/* Show successful uploads */}
                            {uploadStatus.data.uploadedFiles && uploadStatus.data.uploadedFiles.length > 0 && (
                                <div style={{ marginTop: '8px' }}>
                                    <details style={{ fontSize: '12px' }}>
                                        <summary style={{ cursor: 'pointer', color: '#006B96' }}>
                                            View uploaded files ({uploadStatus.data.uploadedFiles.length})
                                        </summary>
                                        <div style={{ marginTop: '5px', maxHeight: '100px', overflowY: 'auto' }}>
                                            {uploadStatus.data.uploadedFiles.map((file, index) => (
                                                <div key={index} style={{ 
                                                    padding: '3px 0', 
                                                    borderBottom: '1px solid #eee' 
                                                }}>
                                                    📄 {file.originalName} ({formatFileSize(file.size)})
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            )}
                            
                            {/* Show errors if any */}
                            {uploadStatus.data.errors && uploadStatus.data.errors.length > 0 && (
                                <div style={{ marginTop: '8px' }}>
                                    <details style={{ fontSize: '12px' }}>
                                        <summary style={{ cursor: 'pointer', color: '#ED1B2F' }}>
                                            View errors ({uploadStatus.data.errors.length})
                                        </summary>
                                        <div style={{ marginTop: '5px', maxHeight: '100px', overflowY: 'auto' }}>
                                            {uploadStatus.data.errors.map((error, index) => (
                                                <div key={index} style={{ 
                                                    padding: '3px 0', 
                                                    borderBottom: '1px solid #eee',
                                                    color: '#ED1B2F'
                                                }}>
                                                    ❌ {error.filename}: {error.error}
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <button 
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: (files.length === 0 || uploading) ? '#ccc' : '#006B96',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    cursor: (files.length === 0 || uploading) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s'
                }}
            >
                {uploading ? (
                    isBatchMode ? '⏳ Uploading Batch...' : '⏳ Uploading...'
                ) : (
                    isBatchMode ? `📤 Upload ${files.length} Documents` : '📤 Upload Document'
                )}
            </button>

            <div style={{ 
                marginTop: '15px', 
                fontSize: '12px', 
                color: '#666',
                textAlign: 'center'
            }}>
                Documents will be processed and added to the knowledge graph for AI conversations.
            </div>
        </div>
    );
};

export default FileUpload;
