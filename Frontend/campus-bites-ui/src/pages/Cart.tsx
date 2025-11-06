import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2 } from "lucide-react";
import axios from "axios";

const Cart = () => {
  const navigate = useNavigate();
  const API_CART_URL = "http://localhost:5000/api/orders/cart";
  const API_ORDER_URL = "http://localhost:5000/api/orders/order";
  const USER_ID = 1; // replace with logged-in user

  const [cartItems, setCartItems] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);

  // ✅ Fetch cart items from backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`${API_CART_URL}/${USER_ID}`);
        const data: Record<string, any> = {};
        res.data.forEach((ci: any) => {
          data[ci.item_id] = {
            quantity: ci.quantity,
            menu_item: ci.menu_item, // includes name, price, image, etc.
          };
        });
        setCartItems(data);
      } catch (err) {
        console.error("❌ Error fetching cart items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // ✅ Update cart item (add/remove)
  const updateCartItem = async (itemId: string, change: number) => {
    const currentQty = cartItems[itemId]?.quantity || 0;
    const newQty = currentQty + change;

    try {
      await axios.post(API_CART_URL, {
        user_id: USER_ID,
        item_id: Number(itemId),
        quantity: newQty,
      });

      setCartItems((prev) => {
        const newCart = { ...prev };
        if (newQty <= 0) delete newCart[itemId];
        else newCart[itemId] = { ...newCart[itemId], quantity: newQty };
        return newCart;
      });
    } catch (err) {
      console.error("❌ Error updating cart item:", err);
      alert("Failed to update cart item");
    }
  };

  // ✅ Remove cart item
  const removeCartItem = async (itemId: string) => {
    try {
      await axios.delete(`${API_CART_URL}/${USER_ID}/${itemId}`);
      setCartItems((prev) => {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      });
    } catch (err) {
      console.error("❌ Error removing cart item:", err);
      alert("Failed to remove cart item");
    }
  };

  const cartItemsList = Object.entries(cartItems).map(([id, data]) => ({
    id,
    quantity: data.quantity,
    ...data.menu_item,
  }));

  const totalAmount = cartItemsList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ✅ Proceed to order
  const handleProceedToOrder = async () => {
    if (cartItemsList.length === 0) {
      alert("Cart is empty!");
      return;
    }

    try {
      setProcessingOrder(true);
      const res = await axios.post(API_ORDER_URL, { user_id: USER_ID });
      // Clear local cart after successful order
      setCartItems({});
      alert(`Order created successfully! Order ID: ${res.data.order.order_uuid}`);
      navigate("/order-confirmation");
    } catch (err: any) {
      console.error("❌ Error proceeding to order:", err);
      alert(err.response?.data?.error || "Failed to proceed to order");
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) return <div className="text-center py-16">Loading cart...</div>;

  return (
    <div className="min-h-screen pb-20 md:pb-8">

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Cart 🛒</h1>

        {cartItemsList.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some delicious items to get started!
            </p>
            <Button onClick={() => navigate("/home")}>Browse Menu</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItemsList.map((item) => (
                <Card key={item.id} className="border-2 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image_url || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                        <p className="text-primary font-bold text-xl mb-3">
                          ₹{item.price}
                        </p>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 border-2 border-border rounded-xl">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCartItem(item.id, -1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-semibold px-2">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCartItem(item.id, 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCartItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-2 rounded-2xl sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (5%)</span>
                      <span className="font-semibold">₹{Math.round(totalAmount * 0.05)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-primary">
                        ₹{totalAmount + Math.round(totalAmount * 0.05)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleProceedToOrder}
                    disabled={processingOrder}
                  >
                    {processingOrder ? "Processing..." : "Proceed to Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
