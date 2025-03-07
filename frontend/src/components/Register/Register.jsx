import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

function Register() {
const [formData, setFormData] = useState({ name: "", email: "", password: "" });

const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
  return (
    <motion.div 
      initial={{ backgroundPosition: "0% 0%" }}
      animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"], backgroundSize: "200% 200%" }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500 text-white overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, y: -100, rotate: -10 }} 
        animate={{ opacity: 1, y: 0, rotate: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.1, rotate: [0, 5, -5, 5, 0] }}
        className="backdrop-blur-md bg-white/20 p-8 rounded-2xl shadow-2xl w-96 border-4 border-purple-500 transform transition-all duration-300"
      >
        <motion.h2 
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-extrabold text-center mb-6 text-pink-300"
        >
          Register
        </motion.h2>
        <form className="space-y-6">
          <motion.div 
            whileFocus={{ scale: 1.1, rotate: 5 }}
            whileHover={{ x: [0, 5, -5, 5, 0] }}
            className="relative"
          >
            <FaUser className="absolute left-3 top-3 text-indigo-300" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-purple-600 text-white rounded-lg outline-none focus:ring-4 focus:ring-pink-400 border-2 border-indigo-400"
            />
          </motion.div>
          <motion.div 
            whileFocus={{ scale: 1.1, rotate: -5 }}
            whileHover={{ x: [0, -5, 5, -5, 0] }}
            className="relative"
          >
            <FaEnvelope className="absolute left-3 top-3 text-blue-300" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-indigo-600 text-white rounded-lg outline-none focus:ring-4 focus:ring-pink-400 border-2 border-blue-400"
            />
          </motion.div>
          <motion.div 
            whileFocus={{ scale: 1.1, rotate: 10 }}
            whileHover={{ x: [0, 10, -10, 10, 0] }}
            className="relative"
          >
            <FaLock className="absolute left-3 top-3 text-pink-300" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-pink-600 text-white rounded-lg outline-none focus:ring-4 focus:ring-indigo-400 border-2 border-pink-400"
            />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.2, rotate: [0, 5, -5, 5, -5, 0] }}
            whileTap={{ scale: 0.9, rotate: -10 }}
            className="w-full bg-gradient-to-r from-purple-700 via-indigo-500 to-blue-500 hover:from-blue-500 hover:to-purple-700 text-white py-3 rounded-lg font-bold text-lg transition-all duration-300 transform"
          >
            Register
          </motion.button>
        </form>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.1, rotate: [0, 5, -5, 5, 0] }}
          className="text-center text-sm mt-6"
        >
          Already have an account? <a href="#" className="text-pink-300 hover:underline">Login</a>
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

export default Register;
