import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductCardProps {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  tag?: string | null;
  onAddToCart: (id: number) => void;
}

export function ProductCard({ id, name, brand, price, image, description, tag, onAddToCart }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden bg-gray-50">
        {tag && (
          <Badge className="absolute top-4 left-4 z-10 bg-pink-500">
            {tag}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <Heart className="w-4 h-4" />
        </Button>
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-5 space-y-3">
        <div>
          <div className="text-sm text-gray-500">{brand}</div>
          <h3 className="text-lg">{name}</h3>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl text-pink-600">¥{price.toLocaleString()}</div>
          <Button 
            onClick={() => onAddToCart(id)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            カートに追加
          </Button>
        </div>
      </div>
    </Card>
  );
}
