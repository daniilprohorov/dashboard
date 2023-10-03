import React, {useState} from "react";

const SendMessage = ({sendMessage}) => {
    const [message, setMessage] = useState("");

    const onSend = () => {
        sendMessage(message);
        setMessage("");
    };

    return (
        <div>
            <input value={message} onChange={e => setMessage(e.target.value)} />
            <button onClick={onSend}>Отправить</button>
        </div>
    )
};

export default SendMessage;
