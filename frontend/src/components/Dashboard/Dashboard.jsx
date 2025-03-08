import { useState } from "react";
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";

function Dashboard() {
  const [messages, setMessages] = useState([
    { sender: "John", text: "Hey, how's it going?" },
    { sender: "You", text: "Pretty good! What's up?" },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const getSentiment = (text) => {
    const positiveWords = ["good", "great", "happy", "love", "awesome", "nice", "sweet", "kind"];
    const negativeWords = ["bad", "sad", "angry", "hate", "terrible", "worst", "annoyed", "furious"];

    const lowerText = text.toLowerCase();
    if (positiveWords. some((word) => lowerText.includes(word))) return "positive";
    if (negativeWords.some((word) => lowerText.includes(word))) return "negative";
    return "neutral";
  };

  const latestSentiment = messages.length > 0 ? getSentiment(messages[messages.length - 1].text) : "neutral";

  const themeStyles = {
    neutral: {
      background: "bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500",
      sidebar: "bg-purple-800 border-indigo-500",
      navbar: "bg-indigo-700 border-pink-400",
      inputBg: "bg-indigo-700 border-pink-400",
      inputText: "text-white",
      button: "bg-gradient-to-r from-purple-600 to-pink-500",
      chatBubble: "bg-indigo-500",
      userBubble: "bg-pink-500",
      animation: {},
    },
    positive: {
      background: "bg-gradient-to-br from-pink-300 via-peach-200 to-sky-300",
      sidebar: "bg-pink-400 border-pink-600",
      navbar: "bg-peach-500 border-pink-300",
      inputBg: "bg-pink-300 border-pink-500",
      inputText: "text-gray-900",
      button: "bg-gradient-to-r from-sky-400 to-peach-400",
      chatBubble: "bg-pink-400",
      userBubble: "bg-peach-500",
      animation: { scale: [0.9, 1.1, 1], boxShadow: "0px 0px 15px rgba(0, 255, 150, 0.5)" },
    },
    negative: {
      background: "bg-gradient-to-br from-red-700 via-orange-600 to-crimson-500",
      sidebar: "bg-red-800 border-red-600",
      navbar: "bg-red-700 border-orange-500",
      inputBg: "bg-red-600 border-orange-400",
      inputText: "text-white",
      button: "bg-gradient-to-r from-orange-600 to-red-500",
      chatBubble: "bg-red-500",
      userBubble: "bg-orange-600",
      animation: { x: [-2, 2, -2, 2, 0], transition: { duration: 0.2, repeat: 2 } },
    },
  };

  const theme = themeStyles[latestSentiment];

  const handleSend = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { sender: "You", text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <motion.div
      className={`flex h-screen ${theme.background} text-white transition-all duration-500`}
      animate={theme.animation}
    >
      <motion.div
        whileHover={{ width: "20%" }}
        className={`w-1/4 ${theme.sidebar} p-4 overflow-y-auto shadow-lg border-r-4 transition-all duration-300`}
      >
        <h2 className="text-2xl font-extrabold text-center mt-4 mb-5 text-white">Chats</h2>
        <ul>
          {["John", "Jane", "Julia"].map((name, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.1, x: 5 }}
              className={`p-3 rounded-lg my-2 ${theme.chatBubble} transition-all duration-300`}
            >
              {name}
            </motion.li>
          ))}
        </ul>
      </motion.div>
      <div className="flex-1 flex flex-col">
        <motion.div className={`p-4 ${theme.navbar} flex justify-between items-center shadow-md border-b-4`}>
          <h2 className="text-xl font-bold">John</h2>
          <p className="text-sm text-white">Last seen: 5 min ago</p>
        </motion.div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: msg.sender === "You" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95, rotate: -2 }}
              className={`p-3 rounded-lg w-fit max-w-xs text-white ${msg.sender === "You" ? theme.userBubble + " ml-auto" : theme.chatBubble}`}
            >
              <strong>{msg.sender}</strong>
              <p>{msg.text}</p>
            </motion.div>
          ))}
        </div>
        <div className={`p-4 ${theme.inputBg} flex items-center border-t-4`}>
          <motion.input type="text" className={`flex-1 p-3 rounded-lg ${theme.inputBg} ${theme.inputText}`} placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          <motion.button className={`ml-3 p-3 rounded-lg shadow-lg ${theme.button}`} onClick={handleSend}>
            <FaPaperPlane />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;