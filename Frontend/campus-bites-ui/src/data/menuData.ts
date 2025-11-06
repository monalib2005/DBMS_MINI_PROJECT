import biryaniImg from "@/assets/food-biryani.png";
import burgerImg from "@/assets/food-burger.png";
import friesImg from "@/assets/food-fries.png";
import pizzaImg from "@/assets/food-pizza.png";
import samosaImg from "@/assets/food-samosa.png";
import coffeeImg from "@/assets/drink-coffee.png";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: "Meals" | "Snacks" | "Drinks";
}

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Chicken Biryani",
    price: 120,
    image: biryaniImg,
    category: "Meals",
  },
  {
    id: "2",
    name: "Veg Burger",
    price: 60,
    image: burgerImg,
    category: "Snacks",
  },
  {
    id: "3",
    name: "French Fries",
    price: 40,
    image: friesImg,
    category: "Snacks",
  },
  {
    id: "4",
    name: "Veg Pizza",
    price: 150,
    image: pizzaImg,
    category: "Meals",
  },
  {
    id: "5",
    name: "Samosa (2 pcs)",
    price: 30,
    image: samosaImg,
    category: "Snacks",
  },
  {
    id: "6",
    name: "Cold Coffee",
    price: 50,
    image: coffeeImg,
    category: "Drinks",
  },
];
