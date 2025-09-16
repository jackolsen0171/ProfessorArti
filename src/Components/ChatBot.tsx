import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

type MessageSender = "user" | "bot" | "system";

interface MessageSource {
  title: string;
}

interface ChatMessage {
  text: string;
  sender: MessageSender;
  timestamp: string;
  professorId?: string;
  sources?: MessageSource[];
  isError?: boolean;
  isSystem?: boolean;
  hasCalendarAction?: boolean;
  fileNames?: string[];
  isCalendar?: boolean;
}

interface ProfessorInfo {
  id: string;
  name: string;
  specialty: string;
  description?: string;
  avatar?: string;
}

interface UploadedFileInfo {
  name: string;
  id: string;
  chunks: number;
  status: "uploaded" | "pending";
}

interface ChatbotProps {
  professor?: string;
}

const buildFallbackProfessor = (id?: string): ProfessorInfo => ({
  id: id ?? "ai-tutor",
  name: id || "Professor",
  specialty: "General Knowledge",
  description: "AI assistant ready to help",
  avatar: "🤖",
});

const Chatbot = ({ professor }: ChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [professorInfo, setProfessorInfo] = useState<ProfessorInfo | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load professor info on mount or when the professor changes
  useEffect(() => {
    const loadProfessorInfo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/chat/professors`);
        if (response.data.success && Array.isArray(response.data.data)) {
          const prof = response.data.data.find(
            (p: ProfessorInfo) => p.id === professor
          );
          setProfessorInfo(prof ?? buildFallbackProfessor(professor));
          return;
        }
      } catch (err) {
        console.error("Error loading professor info:", err);
      }
      setProfessorInfo(buildFallbackProfessor(professor));
    };

    loadProfessorInfo();
  }, [professor]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: input,
        professorId: professor || "ai-tutor",
        conversationId,
      });

      if (!response.data.success) {
        throw new Error("Failed to get response from AI");
      }

      const botMessage: ChatMessage = {
        text: response.data.data.message,
        sender: "bot",
        timestamp: response.data.data.timestamp,
        professorId: response.data.data.professorId,
        sources: response.data.data.sources || [],
      };

      setMessages((prev) => [...prev, botMessage]);

      if (!conversationId) {
        setConversationId(response.data.data.conversationId);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to send message. Please try again.");

      const errorMessage: ChatMessage = {
        text: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }

    setInput("");
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(event.target.files ?? []);
    if (incomingFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (incomingFiles.length === 1) {
        formData.append("document", incomingFiles[0]);
      } else {
        incomingFiles.forEach((file) => {
          formData.append("documents", file);
        });
      }

      const uploadUrl =
        incomingFiles.length === 1
          ? `${API_BASE_URL}/documents/upload`
          : `${API_BASE_URL}/documents/batch-upload`;

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        let newFiles: UploadedFileInfo[] = [];

        if (incomingFiles.length === 1) {
          const result = response.data.data;
          newFiles = [
            {
              name: result.originalName || result.filename,
              id: result.documentId || result.id,
              chunks: result.chunksStored || result.chunks || 1,
              status: "uploaded",
            },
          ];
        } else {
          const results = response.data.data.uploadedFiles || response.data.data;
          newFiles = (results as any[]).map((result) => ({
            name: result.originalName || result.filename,
            id: result.documentId || result.id,
            chunks: result.chunksStored || result.chunks || 1,
            status: "uploaded" as const,
          }));
        }

        setUploadedFiles((prev) => [...prev, ...newFiles]);

        const successMessage: ChatMessage = {
          text: `Successfully uploaded ${incomingFiles.length} file(s): ${incomingFiles
            .map((file) => file.name)
            .join(", ")}`,
          sender: "system",
          timestamp: new Date().toISOString(),
          isSystem: true,
          hasCalendarAction: true,
          fileNames: incomingFiles.map((file) => file.name),
        };
        setMessages((prev) => [...prev, successMessage]);
      }
    } catch (err: any) {
      console.error("File upload error:", err);
      const message = err?.response?.data?.error || err?.message || "Unknown error";
      setError(`Failed to upload files: ${message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const extractDatesToCalendar = async (fileNames: string[]) => {
    try {
      setLoading(true);

      const extractionPrompt = `Please extract calendar events from the uploaded document(s): ${fileNames.join(
        ", "
      )}.

Use the document content that was uploaded and stored in the system. Look for:
- Assignment due dates
- Exam dates and times
- Project deadlines
- Office hours
- Class meeting times
- Important academic dates

Convert any found dates to calendar events.`;

      console.log("📄 Requesting calendar extraction for files:", fileNames);

      const response = await axios.post(`${API_BASE_URL}/calendar/extract-events`, {
        text: extractionPrompt,
        fileNames,
        professorId: professor || "ai-tutor",
      });

      if (!response.data.success) {
        throw new Error("Failed to extract calendar events");
      }

      const { extractedEvents, createdEvents, events } = response.data;
      const successfulTitles = Array.isArray(events)
        ? events
            .filter((event: any) => event?.calendarResult?.success)
            .map((event: any) => event?.title)
            .filter(Boolean)
        : [];

      const calendarMessage: ChatMessage = {
        text: `📅 Calendar Extraction Results:\n• Found ${extractedEvents} potential events\n• Successfully added ${createdEvents} events to your Apple Calendar\n• Events include: ${successfulTitles.join(", ")}`,
        sender: "system",
        timestamp: new Date().toISOString(),
        isSystem: true,
        isCalendar: true,
      };
      setMessages((prev) => [...prev, calendarMessage]);
    } catch (err: any) {
      console.error("Calendar extraction error:", err);
      const message = err?.response?.data?.message || err?.message || "Unknown error";
      const errorMessage: ChatMessage = {
        text: `❌ Failed to extract dates to calendar: ${message}`,
        sender: "system",
        timestamp: new Date().toISOString(),
        isSystem: true,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="modern-chat-container h-full flex flex-col">
      <div className="modern-chat-header">
        <div className="professor-info">
          <span className="professor-avatar">{professorInfo?.avatar || "🤖"}</span>
          <div className="professor-details">
            <h2 className="professor-name">{professorInfo?.name || professor}</h2>
            {professorInfo?.specialty && (
              <p className="professor-specialty">
                Specializes in: {professorInfo.specialty}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files-section">
          <h4>📎 Uploaded Files</h4>
          <div className="uploaded-files-list">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="uploaded-file-item">
                <span className="file-name">📄 {file.name}</span>
                <span className="file-chunks">{file.chunks} chunks</span>
                <button
                  className="remove-file-btn"
                  onClick={() => removeFile(file.id)}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="modern-chat-messages flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="empty-chat-message">
            👋 Start a conversation with {professorInfo?.name || professor}!
          </div>
        )}
        {messages.map((msg, index) => {
          const isUser = msg.sender === "user";
          const isSystem = msg.sender === "system";
          const messageClass = isUser
            ? "modern-user-message"
            : isSystem
            ? "modern-system-message"
            : "modern-bot-message";

          return (
            <div key={index} className={messageClass}>
              <div className="message-content">{msg.text}</div>
              <div className="message-meta">
                <span className="message-sender">
                  {isUser ? "You" : isSystem ? "System" : professorInfo?.name || "Professor"}
                </span>
                {msg.timestamp && (
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="message-sources">
                  📚 Sources: {msg.sources.map((source) => source.title).join(", ")}
                </div>
              )}
              {msg.hasCalendarAction && msg.fileNames && (
                <div className="calendar-action">
                  <button
                    className="calendar-extract-btn"
                    onClick={() => extractDatesToCalendar(msg.fileNames ?? [])}
                    disabled={loading}
                    title="Extract dates from uploaded documents to your Apple Calendar"
                  >
                    📅 Extract Dates to Calendar
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">
              {professorInfo?.name || "Professor"} is thinking...
            </span>
          </div>
        )}
      </div>

      <div className="modern-input-container mt-auto flex-shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
          multiple
          accept=".txt,.pdf,.doc,.docx,.md"
        />

        <div className="input-group">
          <button
            className="file-upload-btn"
            onClick={triggerFileUpload}
            disabled={uploading || loading}
            title="Upload files"
          >
            {uploading ? "⏳" : "📎"}
          </button>

          <input
            autoComplete="off"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyPress={handleKeyPress}
            className="modern-text-input"
            placeholder={`Ask ${professorInfo?.name || professor || "the professor"} a question...`}
            disabled={loading}
          />

          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            title="Send message"
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>

        <div className="action-buttons">
          <button
            className="clear-btn outline"
            onClick={clearMessages}
            disabled={loading}
          >
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
