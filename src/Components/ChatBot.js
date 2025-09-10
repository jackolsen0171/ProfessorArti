import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = 'http://localhost:8001/api';

const Chatbot = ({ professor }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [professorInfo, setProfessorInfo] = useState(null);

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

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>
                    {professorInfo?.avatar} Chat with {professorInfo?.name || professor}
                </h1>
                {professorInfo?.specialty && (
                    <p style={{ 
                        color: '#006B96', 
                        fontSize: '14px', 
                        margin: '5px 0',
                        fontStyle: 'italic'
                    }}>
                        Specializes in: {professorInfo.specialty}
                    </p>
                )}
                {professorInfo?.description && (
                    <p style={{ 
                        color: '#666', 
                        fontSize: '12px', 
                        margin: '0 0 15px 0'
                    }}>
                        {professorInfo.description}
                    </p>
                )}
            </div>

            {error && (
                <div style={{ 
                    color: '#ED1B2F', 
                    background: '#ffe6e6', 
                    padding: '10px', 
                    borderRadius: '5px',
                    margin: '10px 0',
                    fontSize: '14px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div className="chat-box">
                {messages.length === 0 && (
                    <div style={{
                        color: '#666',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        padding: '20px'
                    }}>
                        Start a conversation with {professorInfo?.name || professor}!
                    </div>
                )}
                {messages.map((msg, index) => {
                    const isUser = msg.sender === "user";
                    return (
                        <div 
                            key={index} 
                            className={isUser ? "user-message" : "bot-message"}
                            style={{
                                opacity: msg.isError ? 0.7 : 1,
                                borderLeft: msg.isError ? '3px solid #ED1B2F' : 'none'
                            }}
                        >
                            <div className="message-header">
                                <strong>
                                    {isUser ? "You" : professorInfo?.name || "Professor"}: 
                                </strong>
                                {msg.timestamp && (
                                    <span style={{ fontSize: '10px', color: '#999', marginLeft: '10px' }}>
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                            <div className="message-content">
                                {msg.text}
                            </div>
                            {msg.sources && msg.sources.length > 0 && (
                                <div style={{ 
                                    fontSize: '11px', 
                                    color: '#666', 
                                    marginTop: '5px',
                                    fontStyle: 'italic'
                                }}>
                                    Sources: {msg.sources.map(s => s.title).join(', ')}
                                </div>
                            )}
                        </div>
                    );
                })}
                {loading && (
                    <div style={{ 
                        textAlign: 'center', 
                        color: '#006B96',
                        padding: '10px',
                        fontStyle: 'italic'
                    }}>
                        {professorInfo?.name || 'Professor'} is thinking...
                    </div>
                )}
            </div>

            <div className="chat-input-container">
                <input
                    autoComplete="off"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    id="chat-input"
                    placeholder={`Ask ${professorInfo?.name || professor || "the professor"} a question...`}
                    disabled={loading}
                    style={{
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? 'not-allowed' : 'text'
                    }}
                />
                <div className="buttons">
                    <button 
                        id="send" 
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        style={{
                            opacity: (loading || !input.trim()) ? 0.6 : 1,
                            cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                    <button 
                        id="clear" 
                        onClick={clearMessages}
                        disabled={loading}
                        style={{
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;