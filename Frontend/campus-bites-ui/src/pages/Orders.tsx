"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, CheckCircle } from "lucide-react";

interface OrderItem {
  item_id: number;
  quantity: number;
  menu_item: {
    name: string;
    price: string;
    item_id: number;
    category: string;
    image_url: string;
    description: string;
    availability: boolean;
  };
}
interface Order {
  order_id: string;
  order_uuid: string;
  status: "Pending" | "Preparing" | "Ready";
  order_date: string;
  completed_at: string | null;
  items: OrderItem[];
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    // ✅ Parse user and extract ID correctly
    let userId: number | null = null;
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser.id;
      } catch (err) {
        console.error("Error parsing user object:", err);
      }
    }

    if (!userId) {
      console.error("❌ No valid userId found in localStorage");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders/user/${userId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
        setOrders(data);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5" />;
      case "Preparing":
        return <ChefHat className="w-5 h-5" />;
      case "Ready":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "pending" as const;
      case "Preparing":
        return "warning" as const;
      case "Ready":
        return "success" as const;
      default:
        return "default" as const;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Active Orders 📦</h1>
          <p className="text-muted-foreground text-lg">Track your food in real-time</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold mb-2">No active orders</h2>
            <p className="text-muted-foreground">Your orders will appear here once placed</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {orders.map(order => (
              <Card key={order.order_uuid} className="border-2 rounded-2xl hover-lift">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                      <p className="text-xl font-bold">{order.order_uuid}</p>
                    </div>
                    <Badge variant={getStatusVariant(order.status)} className="self-start sm:self-center">
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-muted-foreground">
                        • {item.menu_item?.name || "Unknown item"} x{item.quantity}
                      </p>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.order_date).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">ORDER PROGRESS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 h-2 rounded-full ${order.status !== "Pending" ? "bg-primary" : "bg-muted"}`} />
                      <div className={`flex-1 h-2 rounded-full ${order.status === "Ready" ? "bg-primary" : order.status === "Preparing" ? "bg-warning" : "bg-muted"}`} />
                      <div className={`flex-1 h-2 rounded-full ${order.status === "Ready" ? "bg-success" : "bg-muted"}`} />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-muted-foreground">Placed</span>
                      <span className="text-xs text-muted-foreground">Preparing</span>
                      <span className="text-xs text-muted-foreground">Ready</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
