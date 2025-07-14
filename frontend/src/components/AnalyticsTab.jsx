import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-900 rounded-lg p-6 shadow-lg overflow-hidden relative border border-blue-900`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="relative z-10">
      <p className="text-blue-400 text-sm mb-1 font-semibold">{title}</p>
      <h3 className="text-white text-3xl font-bold">{value}</h3>
    </div>

    {/* Background gradient overlay */}
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20`} />
    {/* Icon backdrop */}
    <div className="absolute -bottom-4 -right-4 text-blue-800 opacity-30">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailySalesData, setDailySalesData] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/analytics");
        setAnalyticsData(response.data.analyticsData);
        setDailySalesData(response.data.dailySalesData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Users"
          value={analyticsData.users.toLocaleString()}
          icon={Users}
          color="from-blue-500 to-indigo-700"
        />
        <AnalyticsCard
          title="Total Products"
          value={analyticsData.products.toLocaleString()}
          icon={Package}
          color="from-blue-500 to-violet-700"
        />
        <AnalyticsCard
          title="Total Sales"
          value={analyticsData.totalSales.toLocaleString()}
          icon={ShoppingCart}
          color="from-blue-500 to-cyan-700"
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="from-blue-500 to-sky-700"
        />
      </div>

      <motion.div
        className="bg-gray-900 rounded-lg p-6 shadow-lg border border-blue-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <h3 className="text-xl font-semibold text-blue-300 mb-4">
          Sales & Revenue Overview
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                borderColor: "#3B82F6",
              }}
              labelStyle={{ color: "#60A5FA" }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#60A5FA"
              activeDot={{ r: 8 }}
              name="Sales"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              activeDot={{ r: 8 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;
