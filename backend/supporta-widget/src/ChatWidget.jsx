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
import { lighten } from "@mui/material/styles";

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
  console.log("🚀 ~ ChatWidget ~ settings:", settings)

  const [messages, setMessages] = useState([

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
        font: res.data.font ? `${res.data.font}, Helvetica, sans-serif` : "'Inter', Helvetica, sans-serif",
        greeting: res.data.greeting || "Hello 👋! How can I help you today?",
      });
      setMessages([    {
      role: "assistant",
      content: res.data.greeting|| "Hello 👋! How can I help you today?",
    },])
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

  // Theme
  // --- Derived theme flag
  const isDarkTheme =
    settings.theme === "dark" ||
    (settings.theme === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // --- Theme palette
  const themeColors = {
    background: isDarkTheme ? "#121212" : "#fafafa",
    headerBg: settings.color,
    headerText: "#ffffff",
    assistantBg: isDarkTheme ? "#1E1E1E" : "#ffffff",
    assistantText: isDarkTheme ? "#EAEAEA" : "#000000",
    userBg: settings.color,
    userText: "#ffffff",
    inputBg: isDarkTheme ? "#1E1E1E" : "#ffffff",
    inputText: isDarkTheme ? "#EAEAEA" : "#000000",
    border: isDarkTheme ? "#2C2C2C" : "#dddddd",
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
            backgroundColor: themeColors.background,
            borderRadius: 2,
            boxShadow: 2,
            overflow: "hidden",
            fontFamily: settings.font,
            color: themeColors.assistantText,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor: themeColors.headerBg,
              color: themeColors.headerText,
              p: 2,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {business.name} AI Assistant
          </Box>

          {/* Messages area */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              backgroundColor: themeColors.background,
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
                  a: {
                    color: settings.color || "#82B1FF",
                    textDecoration: "none",
                    "&:hover": {
                      color: `${lighten(settings.color || "#82B1FF", 0.2)}`,
                      textDecoration: "underline",
                    },
                  },
                }}
              >
                {message.role === "assistant" && (
                  <Avatar
                    alt={message.role}
                    src={settings.logo}
                    sx={{
                      width: 34,
                      height: 34,
                      backgroundColor: settings.color,
                      p: 0.6,
                    }}
                  />
                )}

                <Box
                  sx={{
                    backgroundColor:
                      message.role === "user"
                        ? themeColors.userBg
                        : themeColors.assistantBg,
                    color:
                      message.role === "user"
                        ? themeColors.userText
                        : themeColors.assistantText,
                    borderRadius: 2,
                    p: 1.5,
                    maxWidth: { xs: "100%", sm: "75%" },
                    wordBreak: "break-word",
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </Box>

                {message.role === "user" && (
                  <Avatar alt={message.role} sx={{ width: 34, height: 34 }} />
                )}
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    backgroundColor: settings.color,
                    p: 0.6,
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
            <div ref={endRef} />
          </Box>

          {/* Input area */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 2,
              borderTop: `1px solid ${themeColors.border}`,
              backgroundColor: themeColors.inputBg,
            }}
          >
            <AttachFileIcon
              sx={{
                color: isDarkTheme ? "#A0A0A0" : "gray",
                cursor: "pointer",
              }}
            />
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
              sx={{
                input: {
                  color: themeColors.inputText,
                  backgroundColor: themeColors.inputBg,
                },
              }}
            />
            <SendRoundedIcon
              sx={{
                color: loading ? "lightgray" : settings.color,
                cursor: loading ? "default" : "pointer",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateX(1px) rotate(-10deg)",
                },
              }}
              onClick={() => handleSendMessage(input)}
            />
          </Box>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
