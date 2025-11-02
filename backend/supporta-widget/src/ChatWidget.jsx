import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import Lottie from "lottie-react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ChatTypingIndicator from "./assets/lottie/Chat typing indicator.json";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWidget() {
  const params = new URLSearchParams(window.location.search);
  const widgetToken =
    params.get("token") ||
    "54dd78c16a7dd2af0ea75a2033e2ed5adc12e1f4f35549f880f8d31fc1bd64a98c76000b9edc303a43011d1b76d279d9d62984e7848596003ceb66bdda0e39f0";
  const backendUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:8800"
      : "https://supporta.onrender.com";
  const url = `${backendUrl}/api`;

  // --- State
  const [widgetLoading, setWidgetLoading] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(() => {
    const saved = localStorage.getItem("conversationId");
    if (saved) return saved;
    const newId = crypto.randomUUID();
    localStorage.setItem("conversationId", newId);
    return newId;
  });

  const [business, setBusiness] = useState({
    name: "Supporta",
    businessId: "",
  });

  const [settings, setSettings] = useState({
    color: "rgba(103, 58, 183, 1)",
    theme: "auto",
    font: "'Inter', Helvetica, sans-serif",
    logo: `${backendUrl}/logo.png`,
    greeting: "Hello 👋! How can I help you today?",
  });

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello 👋! How can I help you today?",
    },
  ]);

  const endRef = useRef(null);

  // --- Fetch functions
  const fetchBusiness = async () => {
    try {
      const res = await axios.get(`${url}/business/settings`, {
        headers: { "x-widget-token": widgetToken },
      });
      setBusiness({ name: res.data.name, businessId: res.data._id });
      setSettings({
        logo: res.data.logo || `${backendUrl}/logo.png`,
        color: res.data.color || "rgba(103, 58, 183, 1)",
        theme: res.data.theme || "auto",
        font: res.data.font || "'Inter', Helvetica, sans-serif",
        greeting: res.data.greeting || "Hello 👋! How can I help you today?",
      });
    } catch (err) {
      console.error("Failed to load business info:", err);
    } finally {
      setWidgetLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${url}/message?conversationId=${conversationId}`,
        { headers: { "x-widget-token": widgetToken } }
      );
      setMessages((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error("Failed to get messages:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchBusiness();
      await fetchMessages();
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (input) => {
    if (!input.trim() || loading) return;

    const newMessage = { conversationId, role: "user", content: input };
    setInput("");
    setLoading(true);

    try {
      // Save user message
      const response = await axios.post(`${url}/message`, newMessage, {
        headers: { "x-widget-token": widgetToken },
      });

      setMessages((prev) => [...prev, newMessage]);

      // Get assistant reply
      const assistantReply = await axios.get(
        `${url}/qa/search?q=${response.data.content}&conversationId=${conversationId}`,
        { headers: { "x-widget-token": widgetToken } }
      );

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

  // --- Fade-in before return
  if (widgetLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <CircularProgress size={40} sx={{ color: settings.color }} />
      </Box>
    );
  }

  // --- Main return
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: 2,
            overflow: "hidden",
            fontFamily: settings.font,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor: settings.color,
              color: "white",
              p: 2,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {business.name} AI assistant
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
                  flexDirection:
                    message.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  gap: 1,
                  p: 1,
                }}
              >
                {message.role === "assistant" && (
                  <Avatar
                    alt={message.role}
                    sx={{
                      width: 34,
                      height: 34,
                      backgroundColor: settings.color,
                      p: 0.6,
                      "& img": { transform: "scale(0.9)", m: 0 },
                    }}
                    src={settings.logo}
                  />
                )}

                <Box
                  sx={{
                    backgroundColor:
                      message.role === "user" ? settings.color : "#fff",
                    color: message.role === "user" ? "white" : "black",
                    borderRadius: 2,
                    p: 1.5,
                    maxWidth: { xs: "100%", sm: "75%" },
                    wordBreak: "break-word",
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ node, ...props }) => (
                        <Box
                          component="img"
                          {...props}
                          alt={props.alt || ""}
                          sx={{
                            display: "block",
                            mt: 1,
                            borderRadius: 2,
                            maxWidth: { xs: 240, sm: 350 },
                            width: "100%",
                            height: "auto",
                          }}
                        />
                      ),
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </Box>

                {message.role === "user" && (
                  <Avatar
                    alt={message.role}
                    sx={{ width: 34, height: 34, backgroundColor: "#ddd" }}
                  />
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
                <Avatar
                  alt={"Typing..."}
                  sx={{
                    width: 34,
                    height: 34,
                    backgroundColor: settings.color,
                    p: 0.6,
                    "& img": { transform: "scale(0.9)", m: 0 },
                  }}
                  src={settings.logo}
                />
                <Lottie
                  animationData={ChatTypingIndicator}
                  loop={true}
                  style={{ height: 60, width: 60 }}
                />
              </Box>
            )}

            {/* Reference point for scrolling */}
            <div ref={endRef} />
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
                color: loading ? "lightgray" : settings.color,
                cursor: loading ? "default" : "pointer",
                transition: "transform 0.3s ease",
                "&:hover": !loading && {
                  transform: "translateX(1px) rotate(-10deg)",
                },
              }}
              onClick={() => !loading && handleSendMessage(input)}
            />
          </Box>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
