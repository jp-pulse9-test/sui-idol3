import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface PhotoCard {
  id: string;
  idolName: string;
  rarity: string;
  concept: string;
  imageUrl: string;
}

interface CollectionPreviewProps {
  photocards: PhotoCard[];
  onViewAll: () => void;
}

export const CollectionPreview = ({ photocards, onViewAll }: CollectionPreviewProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'SR': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'R': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (photocards.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-6xl opacity-50">📭</div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">No Photocards Yet</h3>
            <p className="text-sm text-muted-foreground">
              Open a random box or create your first photocard to start your collection!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {photocards.slice(0, 6).map((card) => (
          <Card key={card.id} className="overflow-hidden group cursor-pointer hover:scale-105 transition-transform">
            <div className="aspect-[3/4] relative">
              <img
                src={card.imageUrl}
                alt={`${card.idolName} - ${card.concept}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Badge 
                className={`absolute top-2 right-2 ${getRarityColor(card.rarity)}`}
              >
                {card.rarity}
              </Badge>
            </div>
            <CardContent className="p-3">
              <p className="text-xs font-medium truncate">{card.concept}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <Button onClick={onViewAll} variant="outline" className="gap-2">
          View Full Collection
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
