/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope, FaPaperPlane } from "react-icons/fa";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
          navigate("/");
      }
  }, [navigate]);

  const [messages, setMessages] = useState([
    { sender: "John", text: "Hey, how's it going?" },
    { sender: "You", text: "Pretty good! What's up?" },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { sender: "You", text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500 text-white">
      {/* Sidebar */}
      <motion.div 
        whileHover={{ scale: 1.1, rotateY: 180 }}
        className="w-1/4 bg-purple-800 p-4 overflow-y-auto shadow-lg border-r-4 border-indigo-500"
      >
        <h2 className="text-2xl font-extrabold text-center mt-4 mb-5 text-pink-300">Chats</h2>
        <ul>
          <motion.li whileHover={{ rotate: -10, x: 5 }} className="p-3 bg-indigo-700 rounded-lg my-2 hover:bg-indigo-500 transition-all">John</motion.li>
          <motion.li whileHover={{ rotate: 10, x: -5 }} className="p-3 bg-indigo-700 rounded-lg my-2 hover:bg-indigo-500 transition-all">Jane</motion.li>
          <motion.li whileHover={{ rotate: 10, x: -5 }} className="p-3 bg-indigo-700 rounded-lg my-2 hover:bg-indigo-500 transition-all">Julia</motion.li>
        </ul>
      </motion.div>
      
      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <motion.div 
          whileHover={{ scale: 1.1, rotateX: 20 }}
          className="p-4 bg-indigo-700 flex justify-between items-center shadow-md border-b-4 border-pink-400"
        >
          <h2 className="text-xl font-bold">John</h2>
          <p className="text-sm text-pink-300">Last seen: 5 min ago</p>
        </motion.div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.1, backgroundColor: "#ff69b4" }}
              key={index} 
              className={`p-3 rounded-lg w-fit max-w-xs ${msg.sender === "You" ? "bg-pink-500 ml-auto" : "bg-indigo-500"}`}
            >
              <strong>{msg.sender}</strong>
              <p>{msg.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-purple-900 flex items-center border-t-4 border-indigo-500">
          <motion.input 
            whileHover={{ scale: 1.05, borderRadius: "50px" }}
            type="text" 
            className="flex-1 p-3 rounded-lg bg-indigo-700 text-white outline-none border-2 border-pink-400 focus:ring-4 focus:ring-indigo-500" 
            placeholder="Type a message..." 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <motion.button 
            whileHover={{ scale: 1.2, rotate: -20, y: -5 }}
            whileTap={{ scale: 0.9, rotate: 20 }}
            className="ml-3 p-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg shadow-lg hover:from-pink-500 hover:to-purple-600 transition-all"
            onClick={handleSend}
          >
            <FaPaperPlane />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
