import { useParams } from "react-router-dom";
import FileUpload from "./FileUpload.js";
import Chatbot from "./ChatBot.js";

const Chat = () => {
    const { professorId } = useParams();

    return (
        <div className="chat-container-outer">
            <Chatbot professor={professorId}></Chatbot>

        </div>
    );
};

export default Chat;
