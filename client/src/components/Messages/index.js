import React from "react";
import "./styles.css";

const Messages = ({messages}) => {
    return (
        <div className="messagesWindow">
            {Array.isArray(messages)
                ? messages.map((message) =>
                    <div>
                        <span className="personName">{message.payload.userName}:</span><span>{message.payload.message}</span>
                    </div>)
                : null}
        </div>
    );
}

export default Messages;
