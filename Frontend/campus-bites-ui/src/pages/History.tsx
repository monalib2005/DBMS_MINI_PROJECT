"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface HistoryOrder {
  order_uuid: string;
  items: string[];
  total: number;
  order_date: string;
  completed_at: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const History = () => {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.id) {
          console.error("User not logged in");
          setOrders([]);
          return;
        }

        const res = await fetch(`${API_BASE}/api/orders/user/${user.id}`);
        const data = await res.json();

        // Filter only completed orders and map to HistoryOrder format
       const completedOrders: HistoryOrder[] = data
      .filter((order: any) => order.status === "Completed")
      .map((order: any) => ({
        order_uuid: order.order_uuid,
        items: order.items
          .filter((i: any) => i.menu_item) // only include items with menu_item
          .map((i: any) => `${i.menu_item.name} x${i.quantity}`),
        total: order.items
          .filter((i: any) => i.menu_item)
          .reduce((sum: number, i: any) => sum + parseFloat(i.menu_item.price) * i.quantity, 0),
        order_date: order.order_date,
        completed_at: order.completed_at,
      }));
        setOrders(completedOrders);
      } catch (err) {
        console.error("❌ Error fetching user orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Order History 📜</h1>
          <p className="text-muted-foreground text-lg">Your past orders and receipts</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📜</div>
            <h2 className="text-2xl font-semibold mb-2">No order history</h2>
            <p className="text-muted-foreground">Your completed orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {orders.map((order) => (
              <Card key={order.order_uuid} className="border-2 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                      <p className="text-xl font-bold">{order.order_uuid}</p>
                    </div>
                    <Badge variant="success">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-muted-foreground">• {item}</p>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">{new Date(order.order_date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.order_date).toLocaleTimeString()}</p>
                    </div>
                    <span className="text-lg font-bold text-primary">₹{order.total}</span>
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

export default History;
