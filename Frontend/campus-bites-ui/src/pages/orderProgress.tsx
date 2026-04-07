import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  order_uuid: string;
  customer: string;
  items: string[];
  status: "Pending" | "Preparing" | "Ready" | "Completed";
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"; // backend route base

const OrderProgress = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders from backend
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/orders/verify-order`);

      const mapped = res.data
        .map((o: any) => ({
            order_uuid: o.order_uuid,
            customer: o.user?.name?.trim() || "Unknown",
            items: o.order_items?.map((item: any) => item.name) || [],
            status: o.status?.trim() as Order["status"], // trim spaces
        }))
        .filter((o: Order) => o.status !== "Completed"); // filter out completed

        setOrders(mapped);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    order_uuid: string,
    newStatus: Order["status"]
  ) => {
    try {
      const res = await axios.patch(`${API_BASE}/api/orders/${order_uuid}`, {
        status: newStatus,
      });

      setOrders((prev) =>
        prev
          .map((o) =>
            o.order_uuid === order_uuid
              ? { ...o, status: res.data.order.status }
              : o
          )
          .filter((o) => o.status !== "Completed") // ✅ remove if updated to Completed
      );
    } catch (err) {
      console.error("❌ Error updating order status:", err);
      alert("Failed to update order status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="border-2 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Order Progress Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-6">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No active orders</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.order_uuid}>
                      <TableCell className="font-medium">
                        {order.order_uuid}
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.items.join(", ") || "—"}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value: Order["status"]) =>
                            handleStatusChange(order.order_uuid, value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Preparing">Preparing</SelectItem>
                            <SelectItem value="Ready">Ready</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderProgress;
