import { useState, useEffect } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import Logo from "./assets/logo-purple.svg";
// import LoadingIcon from "./assets/lottie/Simple Loading Bar 2.json"
import ReactMarkdown from "react-markdown";

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello 👋! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(() => {
    const saved = localStorage.getItem("conversationId");
    if (saved) return saved;
    const newId = crypto.randomUUID();
    localStorage.setItem("conversationId", newId);
    return newId;
  });

  const params = new URLSearchParams(window.location.search);
  const widgetToken =
    params.get("token") ||
    "54dd78c16a7dd2af0ea75a2033e2ed5adc12e1f4f35549f880f8d31fc1bd64a98c76000b9edc303a43011d1b76d279d9d62984e7848596003ceb66bdda0e39f0";
  const url = "http://localhost:8800/api";

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${url}/message?${conversationId}`, {
        headers: { "x-widget-token": widgetToken },
      });
      setMessages((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error("Failed to get messages: ", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendMessage = async (input) => {
    if (!input.trim() || loading) return;

    const newMessage = { conversationId, role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      //  Save user message
      const response = await axios.post(`${url}/message`, newMessage, {
        headers: { "x-widget-token": widgetToken },
      });

      // Get assistant reply
      const assistantReply = await axios.get(
        `${url}/qa/search?q=${response.data.content}&conversationId=${conversationId}`,
        { headers: { "x-widget-token": widgetToken } }
      );

      // Save assistant reply
      const assistantMessage = {
        conversationId,
        role: "assistant",
        content: assistantReply.data,
      };

      const saved = await axios.post(`${url}/message`, assistantMessage, {
        headers: { "x-widget-token": widgetToken },
      });

      setMessages((prev) => [...prev, saved.data]);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#673ab7",
          color: "white",
          p: 2,
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        Supporta Assistant
      </Box>

      {/* Messages area */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          backgroundColor: "#fafafa",
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              p: 1,
              justifyContent:
                message.role === "user" ? "flex-end" : "flex-start",
              "& img": { maxWidth: "350px", borderRadius: 2, marginTop: 1 },
              "& p": { marginBottom: "6px" },
              "& ul": { marginLeft: "16px" },
            }}
          >
            {message.role === "assistant" && (
              <Avatar
                alt={message.role}
                sx={{
                  width: 34,
                  height: 34,
                  backgroundColor: "white",
                  p: 0.6,
                  "& img": {
                    transform: "scale(0.9)",
                    m: 0,
                  },
                }}
                src={Logo}
              />
            )}
            <Box
              sx={{
                backgroundColor: message.role === "user" ? "#673ab7" : "#fff",
                color: message.role === "user" ? "white" : "black",
                borderRadius: 2,
                p: 1.5,
                maxWidth: "75%",
                wordBreak: "break-word",
              }}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </Box>
            {message.role === "user" && (
              <Avatar alt={message.role} sx={{ width: 34, height: 34 }} />
            )}
          </Box>
        ))}

        {/* Loading indicator */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1,
              justifyContent: "flex-start",
            }}
          >
            <Avatar sx={{ width: 34, height: 34 }} />
            <Typography sx={{ color: "gray" }}>
              Assistant is typing...
            </Typography>
            <CircularProgress size={16} sx={{ color: "gray" }} />
          </Box>
        )}
      </Box>

      {/* Input area */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 2,
          borderTop: "1px solid #ddd",
        }}
      >
        <AttachFileIcon sx={{ color: "gray", cursor: "pointer" }} />
        <TextField
          fullWidth
          placeholder="Type your message..."
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSendMessage(input);
            }
          }}
          disabled={loading}
        />
        <SendRoundedIcon
          sx={{
            color: loading ? "lightgray" : "#673ab7",
            cursor: loading ? "default" : "pointer",
          }}
          onClick={() => handleSendMessage(input)}
        />
      </Box>
    </Box>
  );
}
