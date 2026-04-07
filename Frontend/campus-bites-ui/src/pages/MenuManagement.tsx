import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MenuItem {
  item_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  availability: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";// backend base URL

const MenuManagement = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null as File | null,
    available: true,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/menu`);
      setMenu(res.data);
    } catch (err) {
      console.error("❌ Error fetching menu:", err);
      alert("Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewItem({ ...newItem, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // ✅ Add menu item with image upload
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category || !newItem.image)
      return alert("Please fill all fields and select an image.");

    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("description", newItem.description);
      formData.append("category", newItem.category);
      formData.append("price", newItem.price);
      formData.append("availability", newItem.available ? "true" : "false");
      if (newItem.image) formData.append("image", newItem.image);

      const res = await axios.post(`${API_BASE}/api/menu`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMenu((prev) => [res.data.item, ...prev]);
      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
        available: true,
      });
      setPreviewUrl(null);
    } catch (err) {
      console.error("❌ Error adding item:", err);
      alert("Failed to add menu item");
    }
  };

  // ✅ Delete item
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`${API_BASE}/api/menu/${id}`);
      setMenu((prev) => prev.filter((item) => item.item_id !== id));
    } catch (err) {
      console.error("❌ Error deleting item:", err);
      alert("Failed to delete item");
    }
  };

  // ✅ Update only menu availability
  const handleAvailabilityChange = async (id: number, available: boolean) => {
    try {
      const res = await axios.patch(`${API_BASE}/api/menu/${id}/available`, {
        availability: available,
      });

      setMenu((prev) =>
        prev.map((item) => (item.item_id === id ? res.data.item : item))
      );
    } catch (err) {
      console.error("❌ Error updating availability:", err);
      alert("Failed to update availability");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-2 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Menu Management</CardTitle>
        </CardHeader>

        <CardContent>
          {/* ✅ Add new item form */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Item Name"
              className="border p-2 rounded-md"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              className="border p-2 rounded-md"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              className="border p-2 rounded-md"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />

            {/* ✅ Category Dropdown */}
            <select
              className="border p-2 rounded-md"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              <option value="">Select Category</option>
              <option value="meals">meals</option>
              <option value="snacks">snacks</option>
              <option value="drinks">drinks</option>
            </select>

            <input
              type="file"
              accept="image/*"
              className="border p-2 rounded-md"
              onChange={handleImageChange}
            />

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-24 h-24 rounded-md object-cover border"
              />
            )}

            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={newItem.available}
                onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
              />
              Available
            </label>

            <Button
              onClick={handleAddItem}
              className="bg-green-600 text-white hover:bg-green-700 mt-2"
            >
              Add Item
            </Button>
          </div>


          {/* ✅ Menu Table */}
          {loading ? (
            <p>Loading menu...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menu.map((item) => (
                    <TableRow key={item.item_id}>
                      <TableCell>
                        <img
                          src={
                            item.image_url
                              ? `${API_BASE}${item.image_url}`
                              : "/placeholder.jpg"
                          }
                          alt={item.name}
                          className="w-16 h-16 rounded-md object-cover border"
                        />
                      </TableCell>
                      <TableCell className="font-semibold">{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>₹{item.price}</TableCell>
                      <TableCell>
                        <select
                          value={item.availability ? "Yes" : "No"}
                          onChange={(e) =>
                            handleAvailabilityChange(
                              item.item_id,
                              e.target.value === "Yes"
                            )
                          }
                          className="border rounded-md p-1"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.item_id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManagement;
