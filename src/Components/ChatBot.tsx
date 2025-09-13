import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE_URL = 'http://localhost:8001/api';

const Chatbot = ({ professor }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [professorInfo, setProfessorInfo] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Load professor info on mount
    useEffect(() => {
        const loadProfessorInfo = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/chat/professors`);
                if (response.data.success) {
                    const prof = response.data.data.find(p => p.id === professor);
                    setProfessorInfo(prof || {
                        id: professor,
                        name: professor || 'Professor',
                        specialty: 'General Knowledge',
                        description: 'AI assistant ready to help',
                        avatar: '🤖'
                    });
                }
            } catch (err) {
                console.error('Error loading professor info:', err);
                setProfessorInfo({
                    id: professor,
                    name: professor || 'Professor',
                    specialty: 'General Knowledge',
                    description: 'AI assistant ready to help',
                    avatar: '🤖'
                });
            }
        };

        if (professor) {
            loadProfessorInfo();
        }
    }, [professor]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { 
            text: input, 
            sender: "user",
            timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/chat`, {
                message: input,
                professorId: professor || 'ai-tutor',
                conversationId: conversationId
            });

            if (response.data.success) {
                const botMessage = { 
                    text: response.data.data.message,
                    sender: "bot",
                    timestamp: response.data.data.timestamp,
                    professorId: response.data.data.professorId,
                    sources: response.data.data.sources || []
                };

                setMessages(prev => [...prev, botMessage]);
                
                // Set conversation ID if this is the first message
                if (!conversationId) {
                    setConversationId(response.data.data.conversationId);
                }
            } else {
                throw new Error('Failed to get response from AI');
            }
        } catch (error) {
            console.error("Error:", error);
            setError('Failed to send message. Please try again.');
            
            // Add error message to chat
            const errorMessage = {
                text: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
                sender: "bot",
                timestamp: new Date().toISOString(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }

        setInput("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearMessages = () => {
        setMessages([]);
        setConversationId(null);
        setError(null);
    };

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            if (files.length === 1) {
                // Single file upload
                formData.append('document', files[0]);
            } else {
                // Multiple files upload
                files.forEach(file => {
                    formData.append('documents', file);
                });
            }

            const uploadUrl = files.length === 1 
                ? `${API_BASE_URL}/documents/upload`
                : `${API_BASE_URL}/documents/batch-upload`;

            const response = await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                let newFiles = [];
                
                if (files.length === 1) {
                    // Single file upload response
                    const result = response.data.data;
                    newFiles = [{
                        name: result.originalName || result.filename,
                        id: result.documentId || result.id,
                        chunks: result.chunksStored || result.chunks || 1,
                        status: 'uploaded'
                    }];
                } else {
                    // Batch upload response
                    const results = response.data.data.uploadedFiles || response.data.data;
                    newFiles = results.map(result => ({
                        name: result.originalName || result.filename,
                        id: result.documentId || result.id,
                        chunks: result.chunksStored || result.chunks || 1,
                        status: 'uploaded'
                    }));
                }
                
                setUploadedFiles(prev => [...prev, ...newFiles]);
                
                // Add success message to chat
                const successMessage = {
                    text: `Successfully uploaded ${files.length} file(s): ${files.map(f => f.name).join(', ')}`,
                    sender: "system",
                    timestamp: new Date().toISOString(),
                    isSystem: true,
                    hasCalendarAction: true,
                    fileNames: files.map(f => f.name)
                };
                setMessages(prev => [...prev, successMessage]);
            }
        } catch (error) {
            console.error('File upload error:', error);
            setError(`Failed to upload files: ${error.response?.data?.error || error.message}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const extractDatesToCalendar = async (fileNames) => {
        try {
            setLoading(true);
            
            // Create a comprehensive prompt that includes the file names and asks the backend
            // to retrieve the actual document content for analysis
            const extractionPrompt = `Please extract calendar events from the uploaded document(s): ${fileNames.join(', ')}. 
            
            Use the document content that was uploaded and stored in the system. Look for:
            - Assignment due dates
            - Exam dates and times
            - Project deadlines
            - Office hours
            - Class meeting times
            - Important academic dates
            
            Convert any found dates to calendar events.`;
            
            console.log('📄 Requesting calendar extraction for files:', fileNames);
            
            const response = await axios.post(`${API_BASE_URL}/calendar/extract-events`, {
                text: extractionPrompt,
                fileNames: fileNames, // Pass file names so backend can retrieve content
                professorId: professor || 'ai-tutor'
            });

            if (response.data.success) {
                const { extractedEvents, createdEvents, events } = response.data;
                
                // Add success message to chat
                const calendarMessage = {
                    text: `📅 Calendar Extraction Results:\n• Found ${extractedEvents} potential events\n• Successfully added ${createdEvents} events to your Apple Calendar\n• Events include: ${events.filter(e => e.calendarResult.success).map(e => e.title).join(', ')}`,
                    sender: "system",
                    timestamp: new Date().toISOString(),
                    isSystem: true,
                    isCalendar: true
                };
                setMessages(prev => [...prev, calendarMessage]);
            } else {
                throw new Error('Failed to extract calendar events');
            }
        } catch (error) {
            console.error('Calendar extraction error:', error);
            const errorMessage = {
                text: `❌ Failed to extract dates to calendar: ${error.response?.data?.message || error.message}`,
                sender: "system",
                timestamp: new Date().toISOString(),
                isSystem: true,
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const triggerFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="modern-chat-container h-full flex flex-col">
            <div className="modern-chat-header">
                <div className="professor-info">
                    <span className="professor-avatar">{professorInfo?.avatar || '🤖'}</span>
                    <div className="professor-details">
                        <h2 className="professor-name">{professorInfo?.name || professor}</h2>
                        {professorInfo?.specialty && (
                            <p className="professor-specialty">Specializes in: {professorInfo.specialty}</p>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {uploadedFiles.length > 0 && (
                <div className="uploaded-files-section">
                    <h4>📎 Uploaded Files</h4>
                    <div className="uploaded-files-list">
                        {uploadedFiles.map(file => (
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
                    const messageClass = isUser ? "modern-user-message" : isSystem ? "modern-system-message" : "modern-bot-message";
                    
                    return (
                        <div key={index} className={messageClass}>
                            <div className="message-content">
                                {msg.text}
                            </div>
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
                                    📚 Sources: {msg.sources.map(s => s.title).join(', ')}
                                </div>
                            )}
                            {msg.hasCalendarAction && msg.fileNames && (
                                <div className="calendar-action">
                                    <button 
                                        className="calendar-extract-btn"
                                        onClick={() => extractDatesToCalendar(msg.fileNames)}
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
                        <span className="typing-text">{professorInfo?.name || 'Professor'} is thinking...</span>
                    </div>
                )}
            </div>

            <div className="modern-input-container mt-auto flex-shrink-0">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
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
                        {uploading ? '⏳' : '📎'}
                    </button>
                    
                    <input
                        autoComplete="off"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
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
                        {loading ? '⏳' : '➤'}
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