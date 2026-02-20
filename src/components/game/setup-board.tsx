
"use client"

import { useState } from "react";
import { BoardGrid } from "./board-grid";
import { Button } from "@/components/ui/button";
import { saveShips } from "@/app/actions/game"; // Rename to avoid conflict? No, simple import.
// Actually saveShips is server action from "@/app/actions/game"
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Ship {
  id: string; // client-side ID or server ID
  type: string;
  size: number;
  startX: number;
  startY: number;
  orientation: "horizontal" | "vertical";
}

const SHIP_TYPES = [
    { type: "Carrier", size: 5, count: 1 },
    { type: "Battleship", size: 4, count: 1 },
    { type: "Cruiser", size: 3, count: 1 },
    { type: "Submarine", size: 3, count: 1 },
    { type: "Destroyer", size: 2, count: 1 },
];

export function SetupBoard({ 
    segmentId, 
    teamId, 
    initialShips 
}: { 
    segmentId: string; 
    teamId: string; 
    initialShips: Ship[] 
}) {
    const [ships, setShips] = useState<Ship[]>(initialShips || []);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const currentShipConfig = SHIP_TYPES.find(t => t.type === selectedType);
    
    // Compute available ships
    // We only allow 1 of each type for now as per config.
    const isShipPlaced = (type: string) => ships.some(s => s.type === type);

    const handlePlace = (x: number, y: number) => {
        if (!selectedType || !currentShipConfig) return;

        if (isShipPlaced(selectedType)) {
            toast.error(`${selectedType} is already placed. Remove it first.`);
            return;
        }

        const newShip: Ship = {
            id: crypto.randomUUID(),
            type: selectedType,
            size: currentShipConfig.size,
            startX: x,
            startY: y,
            orientation
        };

        // Validate overlap
        // check board bounds is handled by BoardGrid hover but need rigorous check?
        // BoardGrid `isValidPlacement` handles checks visually, but we should double check here?
        // Let's trust visuals for now or replicate logic.
        // Simple logic:
        // check bounds
        const size = newShip.size;
        if (orientation === "horizontal") {
            if (x + size > 10) return;
            for (let i = 0; i < size; i++) {
                if (ships.some(s => {
                    // Check intersection
                    // This is complex logic, simpler to reuse validation function or just trust UI prevents invalid clicks?
                    // UI BoardGrid `onPlace` prop can be guarded.
                    // But `onPlace` called with x,y.
                    // We need to re-validate here.
                    return false; // logic placeholder
                })) {} // Logic below.
            }
        }
        
        // Re-implement intersection check properly
         const isOccupied = (chkX: number, chkY: number) => {
            return ships.some(s => {
                if (s.orientation === "horizontal") {
                    return chkY === s.startY && chkX >= s.startX && chkX < s.startX + s.size;
                } else {
                    return chkX === s.startX && chkY >= s.startY && chkY < s.startY + s.size;
                }
            });
        };

        let valid = true;
        if (orientation === "horizontal") {
            if (x + size > 10) valid = false;
            for (let i = 0; i < size; i++) if (isOccupied(x + i, y)) valid = false;
        } else {
            if (y + size > 10) valid = false;
            for (let i = 0; i < size; i++) if (isOccupied(x, y + i)) valid = false;
        }

        if (!valid) {
            toast.error("Invalid placement");
            return;
        }

        setShips([...ships, newShip]);
        setSelectedType(null); // Deselect after placement
    };

    const handleRemove = (id: string) => {
        setShips(ships.filter(s => s.id !== id));
    };

    const handleSave = async () => {
        if (ships.length < 5) { // Assuming 5 ships total
             toast.error("You must place all ships before saving.");
             return;
        }

        setSaving(true);
        try {
            // Import dynamically? No.
            // Call server action
            const { saveShips } = await import("@/app/actions/game");
            await saveShips(segmentId, ships);
            toast.success("Ships saved successfully!");
            router.refresh(); // Refresh to ensure server state is sync
        } catch (e) {
            toast.error("Failed to save ships");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div>
                <BoardGrid 
                    ships={ships} 
                    onPlace={handlePlace} 
                    interactive={!!selectedType} 
                    selectedShipSize={currentShipConfig?.size || 0}
                    orientation={orientation}
                />
                
                <div className="mt-4 flex gap-4">
                     <Button 
                        variant="outline" 
                        onClick={() => setOrientation(prev => prev === "horizontal" ? "vertical" : "horizontal")}
                    >
                        Rotate: {orientation}
                    </Button>
                     <Button 
                        onClick={handleSave} 
                        disabled={saving}
                    >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Configuration
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold">Fleet</h3>
                {SHIP_TYPES.map(type => {
                    const placed = isShipPlaced(type.type);
                    const isSelected = selectedType === type.type;
                    
                    return (
                        <div key={type.type} className="flex items-center justify-between w-64 p-2 border rounded">
                            <div>
                                <div className="font-semibold">{type.type}</div>
                                <div className="text-xs text-muted-foreground">Size: {type.size}</div>
                            </div>
                            {placed ? (
                                <Button size="sm" variant="destructive" onClick={() => handleRemove(ships.find(s => s.type === type.type)?.id!)}>
                                    Remove
                                </Button>
                            ) : (
                                <Button 
                                    size="sm" 
                                    variant={isSelected ? "default" : "outline"}
                                    onClick={() => setSelectedType(type.type)}
                                >
                                    Select
                                </Button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
