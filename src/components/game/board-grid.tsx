
"use client"

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Ship {
  id: string;
  type: string;
  size: number;
  startX: number;
  startY: number;
  orientation: "horizontal" | "vertical";
}

interface BoardGridProps {
  ships: Ship[];
  onPlace?: (x: number, y: number, orientation: "horizontal" | "vertical") => void;
  interactive?: boolean;
  selectedShipSize?: number; // Size of ship currently being placed
  orientation?: "horizontal" | "vertical";
  bombs?: { x: number; y: number; status: "hit" | "miss" | "pending" }[];
}

export function BoardGrid({ 
    ships, 
    onPlace, 
    interactive = false,
    selectedShipSize = 0,
    orientation = "horizontal",
    bombs = []
}: BoardGridProps) {
  const [hover, setHover] = useState<{x: number, y: number} | null>(null);

  const gridSize = 10;
  
  // Helper to check if a cell is occupied by a ship
  const getShipAt = (x: number, y: number) => {
      return ships.find(s => {
          if (s.orientation === "horizontal") {
              return y === s.startY && x >= s.startX && x < s.startX + s.size;
          } else {
              return x === s.startX && y >= s.startY && y < s.startY + s.size;
          }
      });
  };

  const getBombAt = (x: number, y: number) => {
      return bombs.find(b => b.x === x && b.y === y);
  }

  // Helper to check if placement is valid
  const isValidPlacement = (x: number, y: number, size: number, orient: "horizontal" | "vertical") => {
      if (orient === "horizontal") {
          if (x + size > gridSize) return false;
          for (let i = 0; i < size; i++) {
              if (getShipAt(x + i, y)) return false;
          }
      } else {
          if (y + size > gridSize) return false;
          for (let i = 0; i < size; i++) {
              if (getShipAt(x, y + i)) return false;
          }
      }
      return true;
  };

  return (
    <div className="grid grid-cols-10 gap-0.5 bg-slate-200 border border-slate-300 w-fit">
      {Array.from({ length: gridSize * gridSize }).map((_, i) => {
        const x = i % gridSize;
        const y = Math.floor(i / gridSize);
        const ship = getShipAt(x, y);
        const bomb = getBombAt(x, y);
        
        let isHovered = false;
        let isHoverValid = true;

        if (interactive && hover && selectedShipSize > 0) {
            if (orientation === "horizontal") {
                if (y === hover.y && x >= hover.x && x < hover.x + selectedShipSize) {
                    isHovered = true;
                }
            } else {
                if (x === hover.x && y >= hover.y && y < hover.y + selectedShipSize) {
                    isHovered = true;
                }
            }
            // Check validity of the whole prospective ship at hover.x, hover.y
            if (isHovered) {
                isHoverValid = isValidPlacement(hover.x, hover.y, selectedShipSize, orientation);
            }
        }

        return (
          <div
            key={i}
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 border bg-white flex items-center justify-center relative cursor-crosshair",
              ship && "bg-slate-500",
              isHovered && isHoverValid && "bg-green-200",
              isHovered && !isHoverValid && "bg-red-200",
              bomb?.status === "hit" && "bg-red-500",
              bomb?.status === "miss" && "bg-slate-300",
              bomb?.status === "pending" && "bg-yellow-400"
            )}
            onMouseEnter={() => setHover({x, y})}
            onMouseLeave={() => setHover(null)}
            onClick={() => {
                if (interactive && onPlace) {
                    onPlace(x, y, orientation);
                }
            }}
          >
             {bomb?.status === "hit" && <span className="text-white text-xs">X</span>}
             {bomb?.status === "miss" && <span className="text-slate-500 text-xs">O</span>}
             {bomb?.status === "pending" && <span className="text-yellow-800 text-xs text-[10px]">?</span>}
          </div>
        );
      })}
    </div>
  );
}
