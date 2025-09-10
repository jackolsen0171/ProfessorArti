import React, { useState } from "react";
import axios from "axios";

const Chatbot = ({ professor }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {

        if (!input.trim()) return;

        const userMessage = { text: input, sender: "user" };
        setMessages([...messages, userMessage]);

        try {
            const response = await axios.post("http://127.0.0.1:5000/chat", new URLSearchParams({ user_input: input }));

            const botMessage = { text: response.data.response, sender: "bot" };

            setMessages([...messages, userMessage, botMessage]);
        } catch (error) {
            console.error("Error:", error);
        }

        setInput("");
    };

    return (

        <div className="chat-container">
            <h1>Chat with {professor}</h1>
            <div className="chat-box">
                {messages.map((msg, index) => {
                    return (
                        <div key={index} className={msg.sender === "user" ? "user-message" : "bot-message"} >
                            <strong>{msg.sender}: </strong> {msg.text}
                        </div>
                    );

                })}
            </div>
            <input
                autoComplete="off"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                id="chat-input"
                placeholder={`Ask ${professor || "the professor"} a question...`}

            />
            <div className="buttons">
                <button id="send" onClick={sendMessage}>Send</button>
                <button id="clear" onClick={() => setMessages([])} >Clear</button>
            </div>
        </div>
    );
};

export default Chatbot;
