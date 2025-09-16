import { useState } from "react";
import type { ChangeEvent } from "react";
import axios, { isAxiosError } from "axios";
import { API_BASE_URL, FILE_UPLOAD_MAX_SIZE_BYTES } from "../config";
import allowedMimeTypesJson from "../../shared/mimeTypes.json";

interface SingleUploadResult {
  originalName: string;
  uploadedAt: string;
  filename?: string;
  size?: number;
}

interface BatchUploadedFile {
  originalName: string;
  size: number;
}

interface BatchUploadError {
  filename: string;
  error: string;
}

interface BatchUploadSummary {
  totalFiles: number;
  successCount: number;
  errorCount: number;
  uploadedFiles?: BatchUploadedFile[];
  errors?: BatchUploadError[];
}

type UploadStatusData = SingleUploadResult | BatchUploadSummary;

interface UploadStatus {
  type: "success";
  message: string;
  data: UploadStatusData;
}

const ALLOWED_MIME_TYPES = allowedMimeTypesJson as string[];

const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setFiles(selectedFiles);
    setUploadStatus(null);
    setError(null);

    if (selectedFiles.length === 0) {
      return;
    }

    const invalidFiles = selectedFiles.filter(
      (file) => !ALLOWED_MIME_TYPES.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError(
        `Invalid file types detected: ${invalidFiles
          .map((file) => file.name)
          .join(", ")}. Please select only: TXT, PDF, DOC, DOCX, or MD files.`
      );
      setFiles([]);
      if (event.target) {
        event.target.value = "";
      }
      return;
    }

    setIsBatchMode(selectedFiles.length > 1);

    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > FILE_UPLOAD_MAX_SIZE_BYTES
    );
    if (oversizedFiles.length > 0) {
      setError(
        `Files too large: ${oversizedFiles
          .map((file) => file.name)
          .join(", ")}. Maximum size is 50MB per file.`
      );
      setFiles([]);
      if (event.target) {
        event.target.value = "";
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

    try {
      if (isBatchMode) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("documents", file);
        });

        const response = await axios.post(`${API_BASE_URL}/documents/batch-upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          const {
            totalFiles,
            successCount,
            errorCount,
            uploadedFiles,
            errors,
          } = response.data.data as BatchUploadSummary;

          setUploadStatus({
            type: "success",
            message: `Batch upload completed: ${successCount}/${totalFiles} files uploaded successfully!`,
            data: {
              totalFiles,
              successCount,
              errorCount,
              uploadedFiles,
              errors,
            },
          });
        } else {
          setError(`Batch upload failed: ${response.data.message}`);
        }
      } else {
        const formData = new FormData();
        formData.append("document", files[0]);

        const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          const result = response.data.data as SingleUploadResult;
          setUploadStatus({
            type: "success",
            message: `File "${result.originalName}" uploaded successfully!`,
            data: result,
          });
        } else {
          setError(`Upload failed: ${response.data.message}`);
        }
      }

      setFiles([]);
      setIsBatchMode(false);
      const inputElement = document.getElementById("file-input") as HTMLInputElement | null;
      if (inputElement) {
        inputElement.value = "";
      }
    } catch (err) {
      console.error("Upload failed:", err);
      if (isAxiosError(err)) {
        if (err.response?.data) {
          const responseMessage = err.response.data.message || err.response.data.error;
          setError(`Upload failed: ${responseMessage}`);
        } else if (err.request) {
          setError(
            "Upload failed: Unable to connect to server. Please ensure the backend is running."
          );
        } else {
          setError(`Upload failed: ${err.message}`);
        }
      } else if (err instanceof Error) {
        setError(`Upload failed: ${err.message}`);
      } else {
        setError("Upload failed: Unknown error");
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const renderUploadSummary = () => {
    if (!uploadStatus || uploadStatus.type !== "success") {
      return null;
    }

    const { data } = uploadStatus;

    if ("totalFiles" in data) {
      const summary = data as BatchUploadSummary;
      return (
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px" }}>
            Batch Upload Summary:
          </div>
          <div style={{ fontSize: "12px", marginBottom: "5px" }}>
            ✅ Successful: {summary.successCount} files
          </div>
          {summary.errorCount > 0 && (
            <div style={{ fontSize: "12px", marginBottom: "5px", color: "#ED1B2F" }}>
              ❌ Failed: {summary.errorCount} files
            </div>
          )}

          {summary.uploadedFiles && summary.uploadedFiles.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <details style={{ fontSize: "12px" }}>
                <summary style={{ cursor: "pointer", color: "#006B96" }}>
                  View uploaded files ({summary.uploadedFiles.length})
                </summary>
                <div style={{ marginTop: "5px", maxHeight: "100px", overflowY: "auto" }}>
                  {summary.uploadedFiles.map((file, index) => (
                    <div
                      key={`${file.originalName}-${index}`}
                      style={{ padding: "3px 0", borderBottom: "1px solid #eee" }}
                    >
                      📄 {file.originalName} ({formatFileSize(file.size)})
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {summary.errors && summary.errors.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <details style={{ fontSize: "12px" }}>
                <summary style={{ cursor: "pointer", color: "#ED1B2F" }}>
                  View errors ({summary.errors.length})
                </summary>
                <div style={{ marginTop: "5px", maxHeight: "100px", overflowY: "auto" }}>
                  {summary.errors.map((uploadError, index) => (
                    <div
                      key={`${uploadError.filename}-${index}`}
                      style={{
                        padding: "3px 0",
                        borderBottom: "1px solid #eee",
                        color: "#ED1B2F",
                      }}
                    >
                      ❌ {uploadError.filename}: {uploadError.error}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      );
    }

    const result = data as SingleUploadResult;
    return (
      <div style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}>
        Uploaded at: {new Date(result.uploadedAt).toLocaleString()}
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2 style={{ color: "#006B96", marginBottom: "20px" }}>📄 Upload Document</h2>

      <div style={{ marginBottom: "15px" }}>
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          accept=".txt,.pdf,.doc,.docx,.md"
          multiple
          style={{
            width: "100%",
            padding: "10px",
            border: "2px dashed #006B96",
            borderRadius: "5px",
            backgroundColor: "white",
          }}
        />
        <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
          Supported formats: TXT, PDF, DOC, DOCX, MD (Max 50MB each) • Select multiple
          files for batch upload
        </small>
      </div>

      {files.length > 0 && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#e6f3ff",
            borderRadius: "5px",
            border: "1px solid #006B96",
          }}
        >
          <strong>Selected Files ({files.length}):</strong>
          {isBatchMode && (
            <div
              style={{
                color: "#006B96",
                fontWeight: "bold",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              🔄 Batch Upload Mode
            </div>
          )}
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                style={{
                  marginBottom: "8px",
                  padding: "8px",
                  backgroundColor: "rgba(255,255,255,0.7)",
                  borderRadius: "3px",
                  fontSize: "13px",
                }}
              >
                📎 <strong>{file.name}</strong>
                <br />
                📊 {formatFileSize(file.size)} • 🏷️ {file.type || "Unknown type"}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: "#666",
              borderTop: "1px solid #ccc",
              paddingTop: "8px",
            }}
          >
            Total size: {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#ffe6e6",
            border: "1px solid #ED1B2F",
            borderRadius: "5px",
            color: "#ED1B2F",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {uploadStatus && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: uploadStatus.type === "success" ? "#e6ffe6" : "#ffe6e6",
            border: `1px solid ${uploadStatus.type === "success" ? "#4CAF50" : "#ED1B2F"}`,
            borderRadius: "5px",
            color: uploadStatus.type === "success" ? "#4CAF50" : "#ED1B2F",
          }}
        >
          {uploadStatus.type === "success" ? "✅" : "❌"} {uploadStatus.message}
          {renderUploadSummary()}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor:
            files.length === 0 || uploading ? "#ccc" : "#006B96",
          color: "white",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: files.length === 0 || uploading ? "not-allowed" : "pointer",
          transition: "background-color 0.3s",
        }}
      >
        {uploading
          ? isBatchMode
            ? "⏳ Uploading Batch..."
            : "⏳ Uploading..."
          : isBatchMode
          ? `📤 Upload ${files.length} Documents`
          : "📤 Upload Document"}
      </button>

      <div
        style={{
          marginTop: "15px",
          fontSize: "12px",
          color: "#666",
          textAlign: "center",
        }}
      >
        Documents will be processed and added to your AI knowledge base for future conversations.
      </div>
    </div>
  );
};

export default FileUpload;
