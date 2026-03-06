import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import ChatLayout from "../components/layout/ChatLayout";
import StatusViewer from "../components/chat/StatusViewer";

export default function Chat() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [message, setMessage] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🤖 AI State
  const [smartReplies, setSmartReplies] = useState([]);
  const [smartRepliesLoading, setSmartRepliesLoading] = useState(false);
  const [chatSummary, setChatSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // 📸 Status State
  const [statuses, setStatuses] = useState([]);
  const [viewingStatus, setViewingStatus] = useState(null);

  const navigate = useNavigate();

  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const myId = token ? JSON.parse(atob(token.split(".")[1])).id : null;
  const messages = useMemo(() => messagesByRoom[currentRoom] || [], [messagesByRoom, currentRoom]);

  // 🔹 Fetch all users
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
    fetchStatuses();
  }, [token, navigate]);

  // 📸 Fetch statuses
  const fetchStatuses = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatuses(res.data);
    } catch (err) {
      console.error("Error fetching statuses:", err);
    }
  };

  // 📸 Upload status
  const handleUploadStatus = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/status`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchStatuses(); // refresh
    } catch (err) {
      console.error("Error uploading status:", err);
    }
  };

  // 📸 Delete status
  const handleDeleteStatus = async (statusId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/status/${statusId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStatuses(); // refresh
    } catch (err) {
      console.error("Error deleting status:", err);
    }
  };

  // 🔹 Socket connection
  useEffect(() => {
    if (!token) return;

    const s = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    setSocket(s);

    s.on("receive-message", (data) => {
      setMessagesByRoom((prev) => ({
        ...prev,
        [data.roomId]: [
          ...(prev[data.roomId] || []),
          { message: data.message, sender: data.sender, _id: Date.now() },
        ],
      }));
    });

    s.on("error", (err) => {
      console.error("Socket error:", err);
    });

    return () => {
      s.disconnect();
    };
  }, [token]);

  // 🤖 Fetch smart replies (on-demand, triggered by user click)
  const handleRequestSmartReplies = async () => {
    if (!messages || messages.length === 0 || !token) return;

    // Get the last message that's NOT from me
    const lastReceived = [...messages].reverse().find(m => m.sender !== "me");
    if (!lastReceived) {
      setSmartReplies([]);
      return;
    }

    setSmartRepliesLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/smart-reply`,
        { lastMessage: lastReceived.message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSmartReplies(res.data.replies || []);
    } catch (err) {
      console.error("Smart reply error:", err);
      const status = err.response?.status;
      if (status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 60;
        setSmartReplies([`⚠️ AI quota exceeded. Try again in ${retryAfter}s.`]);
      } else if (status === 500) {
        setSmartReplies(["⚠️ AI service error. Try again later."]);
      } else {
        setSmartReplies([]);
      }
    } finally {
      setSmartRepliesLoading(false);
    }
  };

  // 🤖 Summarize chat
  const handleSummarize = async () => {
    if (!messages || messages.length === 0) return;
    setSummaryLoading(true);
    setShowSummary(true);
    setChatSummary("");

    try {
      const formatted = messages.map(m => ({
        sender: m.sender === "me" ? loggedUser?.username || "Me" : selectedUser?.username || "Other",
        message: m.message,
      }));

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/summarize`,
        { messages: formatted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatSummary(res.data.summary || "Could not generate summary.");
    } catch (err) {
      console.error("Summarize error:", err);
      const status = err.response?.status;
      if (status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 60;
        setChatSummary(`⚠️ AI quota exceeded. Please try again in ${retryAfter} seconds.`);
      } else {
        setChatSummary("Failed to summarize chat. AI service unavailable.");
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  // 🔹 Load chat history
  const loadChatHistory = async (roomId) => {
    try {
      setLoading(true);
      setSmartReplies([]);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formattedMessages = res.data.map((msg) => ({
        _id: msg._id,
        message: msg.content,
        sender: msg.sender._id === myId ? "me" : msg.sender._id,
      }));

      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: formattedMessages,
      }));
    } catch (err) {
      console.error("Error loading chat history:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Join private room
  const joinChat = (user) => {
    if (!user) return; // safety guard
    setSelectedUser(user);
    setShowSummary(false);
    setChatSummary("");
    setSmartReplies([]);
    const roomId = [myId, user._id].sort().join("_");
    if (socket) {
      socket.emit("join-room", roomId);
    }
    setCurrentRoom(roomId);
    loadChatHistory(roomId);
  };

  // 🔹 Go back (mobile) — clear selection without calling joinChat
  const handleGoBack = () => {
    setSelectedUser(null);
    setShowSummary(false);
    setChatSummary("");
    setSmartReplies([]);
  };

  // 🔹 Send private message
  const sendMessage = async () => {
    if (!message.trim() || !currentRoom || !socket) return;

    try {
      socket.emit("send-message", {
        roomId: currentRoom,
        message,
        receiver: selectedUser._id,
      });

      setMessagesByRoom((prev) => ({
        ...prev,
        [currentRoom]: [
          ...(prev[currentRoom] || []),
          { message, sender: "me", _id: Date.now() },
        ],
      }));

      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Use a smart reply suggestion
  const handleUseSmartReply = (reply) => {
    setMessage(reply);
  };

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    socket?.disconnect();
    navigate("/");
  };

  return (
    <>
      <ChatLayout
        currentUser={loggedUser}
        users={users}
        selectedUser={selectedUser}
        messages={messages}
        currentMessage={message}
        loading={loading}
        onSelectUser={joinChat}
        onGoBack={handleGoBack}
        onMessageChange={setMessage}
        onSendMessage={sendMessage}
        onLogout={handleLogout}
        // AI props
        smartReplies={smartReplies}
        smartRepliesLoading={smartRepliesLoading}
        onUseSmartReply={handleUseSmartReply}
        onRequestSmartReplies={handleRequestSmartReplies}
        onSummarize={handleSummarize}
        chatSummary={chatSummary}
        summaryLoading={summaryLoading}
        showSummary={showSummary}
        onCloseSummary={() => setShowSummary(false)}
        // Status props
        statuses={statuses}
        currentUserId={myId}
        onUploadStatus={handleUploadStatus}
        onViewStatus={setViewingStatus}
      />

      {/* Status Viewer Overlay */}
      {viewingStatus && (
        <StatusViewer
          statusGroup={viewingStatus}
          currentUserId={myId}
          onClose={() => { setViewingStatus(null); fetchStatuses(); }}
          onDelete={handleDeleteStatus}
        />
      )}
    </>
  );
}
