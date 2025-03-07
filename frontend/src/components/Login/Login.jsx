/* eslint-disable no-unused-vars */
import { useState } from "react"; // Import Axios
import { motion } from "framer-motion";
import { FaUser, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";



function Login() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(""); 
  
      try {
          const response = await axios.post("http://127.0.0.1:8000/login", 
              new URLSearchParams({
                  username: formData.username,
                  password: formData.password
              }), 
              {
                  headers: { "Content-Type": "application/x-www-form-urlencoded" }
              }
          );
  
          // Store the access token in localStorage
          localStorage.setItem("token", response.data.access_token);
          alert("Login Successful!");
          navigate("/dashboard");
      } catch (error) {
          setError(error.response?.data?.detail || "Login failed");
      } finally {
          setLoading(false);
      }
  };
  

    return (
        <motion.div 
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"], backgroundSize: "200% 200%" }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-700 via-pink-500 to-orange-400 text-white overflow-hidden"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1, ease: "easeOut" }}
          whileHover={{ rotate: 3, scale: 1.05, boxShadow: "0px 0px 20px rgba(255,255,255,0.5)" }}
          className="backdrop-blur-md bg-white/20 p-8 rounded-2xl shadow-2xl w-96 border-4 border-purple-400 transform transition-all duration-300"
        >
          <motion.h2 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.1, color: "#ff6b6b" }}
            className="text-3xl font-extrabold text-center mb-6 text-pink-300"
          >
            Login
          </motion.h2>
          {error && <p className="text-red-400 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div 
              whileFocus={{ scale: 1.05 }}
              whileHover={{ x: 5 }}
              className="relative"
            >
              <FaUser className="absolute left-3 top-3 text-purple-300" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-purple-600 text-white rounded-lg outline-none focus:ring-4 focus:ring-pink-400 border-2 border-purple-400"
              />
            </motion.div>
            <motion.div 
              whileFocus={{ scale: 1.05 }}
              whileHover={{ x: -5 }}
              className="relative"
            >
              <FaLock className="absolute left-3 top-3 text-pink-300" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-pink-600 text-white rounded-lg outline-none focus:ring-4 focus:ring-purple-400 border-2 border-pink-400"
              />
            </motion.div>
            <motion.button disabled={loading}
              whileHover={{ scale: 1.15, rotate: 5, backgroundColor: "#ff6b6b" }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-orange-400 hover:to-purple-600 text-white py-3 rounded-lg font-bold text-lg transition-all duration-300 transform"
            > Login
            </motion.button>

  

          </form>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.1, color: "#ff6b6b" }}
            className="text-center text-sm mt-6"
          >
            Don't have an account? <a href="#" className="text-pink-300 hover:underline">Register</a>
          </motion.p>
        </motion.div>
      </motion.div>
    )
  }
  
  export default Login