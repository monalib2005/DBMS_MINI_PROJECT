import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Download, Share2 } from "lucide-react";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const orderId = "ORD" + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Order Placed Successfully! 🎉</h1>
            <p className="text-muted-foreground text-lg">
              Your food will be ready soon. Show this QR code at pickup.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="border-2 rounded-2xl mb-6">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="text-2xl font-bold">{orderId}</p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-8 rounded-2xl border-2 border-border mb-6">
                <div className="aspect-square max-w-xs mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📱</div>
                    <p className="text-sm font-semibold text-muted-foreground">QR Code</p>
                    <p className="text-xs text-muted-foreground mt-1">{orderId}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-2 rounded-2xl mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Next Steps:</h3>
              <ol className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span>Wait for your order status to change to "Ready"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span>Go to the canteen pickup counter</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span>Show this QR code to complete verification</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">4.</span>
                  <span>Enjoy your meal!</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/orders")}
            >
              Track Order
            </Button>
            <Button
              className="flex-1"
              onClick={() => navigate("/home")}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
