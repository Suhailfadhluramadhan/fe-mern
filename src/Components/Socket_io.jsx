import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const Socket_io = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);

  const socketRef = useRef(null);

  const userData = JSON.parse(sessionStorage.getItem("user")) || {};
  const name = userData?.nama;
  const role = userData?.role; 
  const env= "https://projectss6.biz.id/proyek1";

  useEffect(() => {
    console.log("🔌 VITE_API_SERVER:", import.meta.env.VITE_API_SERVER);
console.log(env)
    socketRef.current = io(env, {
      path: "/proyek1/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current.on("connect", () =>
      console.log("🟢 Socket connected:", socketRef.current.id)
    );
    socketRef.current.on("connect_error", (err) =>
      console.error("🔴 Connect error:", err)
    );
    socketRef.current.on("disconnect", (reason) =>
      console.log("🔴 Disconnected:", reason)
    );

    socketRef.current.on("chat-message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("user-joined", (username) => {
      setChatMessages((prev) => [
        ...prev,
        { system: true, text: `${username} joined the conversation` },
      ]);
    });

    socketRef.current.on("user-left", (username) => {
      setChatMessages((prev) => [
        ...prev,
        { system: true, text: `${username} left the conversation` },
      ]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleJoin = () => {
    if (!name) {
      alert("Nama tidak ditemukan di sessionStorage");
      return;
    }
    socketRef.current.emit("join", name);
    setJoined(true);
  };

  const handleExit = () => {
    socketRef.current.emit("leave", name);
    setJoined(false);
    setChatMessages([]);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const msg = { name, role, text: message };
    socketRef.current.emit("chat-message", msg);
    setMessage("");
  };

  if (!joined) {
    return (
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleJoin}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Join Percakapan
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-gray-300 rounded-md p-4 bg-white shadow-md w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-purple-700">Percakapan</h3>
        <button
          onClick={handleExit}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
        >
          Exit
        </button>
      </div>

      <div
        className="h-[70vh] overflow-y-auto space-y-2 mb-4 p-2 rounded-md border"
        style={{
          backgroundImage: "url('/bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {chatMessages.map((msg, idx) =>
          msg.system ? (
            <p key={idx} className="text-center text-gray-500 text-sm italic">
              {msg.text}
            </p>
          ) : (
            <div
              key={idx}
              className={`flex ${
                msg.name === name ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg shadow ${
                  msg.name === name
                    ? "bg-green-700 text-white rounded-br-none"
                    : "bg-black text-white rounded-bl-none"
                }`}
              >
                {msg.name !== name && (
                  <p className="text-sm font-semibold text-purple-300">
                    {msg.name}{" "}
                    <span className="text-xs text-gray-400">({msg.role})</span>
                  </p>
                )}
                <p className="text-sm mt-1">{msg.text}</p>
              </div>
            </div>
          )
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Kirim
        </button>
      </div>
    </div>
  );
};

export default Socket_io;
