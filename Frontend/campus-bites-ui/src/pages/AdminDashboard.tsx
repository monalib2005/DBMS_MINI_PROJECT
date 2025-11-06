// src/pages/admin/Dashboard.tsx
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ClipboardList, BarChart } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Menu Management",
      desc: "Add, update, and manage food items with image, category, and availability.",
      icon: Utensils,
      route: "/admin/menu",
      color: "bg-gradient-to-r from-amber-500 to-orange-500",
    },
    {
      title: "Order Progress",
      desc: "View live orders and update their preparation status in real-time.",
      icon: ClipboardList,
      route: "/admin/orders",
      color: "bg-gradient-to-r from-blue-500 to-indigo-500",
    },
    {
      title: "Reports & Analytics",
      desc: "Monitor sales, top dishes, and performance insights.",
      icon: BarChart,
      route: "/admin/reports",
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar at top */}

      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🍽️ Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Manage menu, track orders, and analyze performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card) => (
            <Card
              key={card.title}
              className="rounded-2xl cursor-pointer transition-transform hover:scale-105 hover:shadow-xl border-2"
              onClick={() => navigate(card.route)}
            >
              <div className={`h-3 rounded-t-2xl ${card.color}`}></div>
              <CardHeader className="flex flex-col items-center justify-center mt-4">
                <div className={`p-4 rounded-full ${card.color} text-white mb-4`}>
                  <card.icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl font-bold">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">{card.desc}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
