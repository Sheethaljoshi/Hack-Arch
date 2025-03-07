import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock } from "react-icons/fa";

function Login() {

    const [formData, setFormData] = useState({ username: "", password: "" });

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
  
    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white">
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="backdrop-blur-md bg-white/10 p-8 rounded-2xl shadow-xl w-96"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
          <form className="space-y-4">
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all"
            >
              Login
            </motion.button>
          </form>
          <p className="text-center text-sm mt-4">
            Don't have an account? <a href="#" className="text-blue-400 hover:underline">Sign up</a>
          </p>
        </motion.div>
      </div>
    )
  }
  
  export default Login