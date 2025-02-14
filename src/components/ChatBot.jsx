import React from "react";

const ChatBot = () => {
  return (
    <div>
      <iframe
        src="https://app.dante-ai.com/embed/?kb_id=a9714cef-a21d-48ed-bc09-d735da494375&token=1796e251-68e3-4aae-9af2-b63ecf8de470&modeltype=gpt-4-omnimodel-mini&tabs=false"
        allow="clipboard-write; clipboard-read; *;microphone *"
        width="100%"
        height="950"
        frameborder="0"
      ></iframe>
    </div>
  );
};

export default ChatBot;
