import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1920&q=80"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-5xl sm:text-6xl font-extrabold text-blue-400 drop-shadow-lg"
        >
          Explore Our Categories
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-4 text-center text-xl sm:text-2xl text-gray-300 max-w-xl"
        >
          Discover the latest trends in eco-friendly fashion.
        </motion.p>

        <motion.button
          onClick={() => navigate("/product")}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-lg sm:text-2xl font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Explore Products
        </motion.button>
      </div>
    </div>
  );
};

export default HomePage;
