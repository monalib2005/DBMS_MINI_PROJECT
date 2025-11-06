import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MenuCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
}

const MenuCard = ({ name, price, image, category, quantity = 0, onAdd, onRemove }: MenuCardProps) => {
  return (
    <Card className="overflow-hidden hover-lift border-2 border-border rounded-2xl">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute top-2 right-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-foreground">
            {category}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-primary font-bold text-xl mb-3">₹{price}</p>

        {quantity === 0 ? (
          <Button onClick={onAdd} className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Button onClick={onRemove} variant="outline" size="sm" className="flex-1">
              <Minus className="w-4 h-4" />
            </Button>
            <span className="font-semibold text-lg px-4">{quantity}</span>
            <Button onClick={onAdd} variant="default" size="sm" className="flex-1">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuCard;
