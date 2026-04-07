import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MenuCard from "@/components/MenuCard";
import { Button } from "@/components/ui/button";
import axios from "axios";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const categories = ["All", "Meals", "Snacks", "Drinks"];
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"; // backend cart endpoint

  const USER_ID = 1; // replace with logged-in user

  // ✅ Fetch menu items and cart items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/menu`);
        const data = await res.json();
        setMenuItems(data.filter((item: any) => item.availability === true));
      } catch (err) {
        console.error("❌ Error fetching menu items:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCartItems = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/orders/cart?user_id=${USER_ID}`);
        const cartData: Record<string, number> = {};
        res.data.forEach((ci: any) => {
          cartData[ci.item_id] = ci.quantity;
        });
        setCart(cartData);
      } catch (err) {
        console.error("❌ Error fetching cart items:", err);
      }
    };

    fetchMenuItems();
    fetchCartItems();
  }, []);

  // ✅ Filter menu items
  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter(
          (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  // ✅ Update cart (both add and remove) using single API call
  const updateCart = async (itemId: string, change: number) => {
    try {
      const currentQty = cart[itemId] || 0;
      const newQty = currentQty + change;

      await axios.post(`${API_BASE}/api/orders/cart`, {
        user_id: USER_ID,
        item_id: Number(itemId),
        quantity: newQty,
      });

      setCart((prev) => {
        const newCart = { ...prev };
        if (newQty <= 0) delete newCart[itemId];
        else newCart[itemId] = newQty;
        return newCart;
      });
    } catch (err) {
      console.error("❌ Error updating cart item:", err);
      alert("Failed to update cart item");
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Today's Menu 🍽️</h1>
          <p className="text-muted-foreground text-lg">Fresh food, made with love</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-lg">
            Loading menu...
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.item_id}
                id={item.item_id.toString()}
                name={item.name}
                price={item.price}
                image={
                  item.image_url
                    ? `${API_BASE}${item.image_url.startsWith("/") ? item.image_url : "/" + item.image_url}`
                    : "/placeholder.jpg"
                }
                category={item.category}
                quantity={cart[item.item_id] || 0}
                onAdd={() => updateCart(item.item_id.toString(), 1)}
                onRemove={() => updateCart(item.item_id.toString(), -1)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground text-lg">
            No items available in this category
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
