
"use client"

import { useState } from "react";
import { BoardGrid } from "./board-grid";
import { placeBomb } from "@/app/actions/game";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BombingBoardProps {
  segmentId: string;
  targetTeamId: string;
  bombs: { x: number; y: number; status: "hit" | "miss" | "pending"; phaseId?: string | null }[];
  phases: { id: string; name: string; placementEndTime: Date; releaseTime: Date | null }[];
}

export function BombingBoard({ segmentId, targetTeamId, bombs, phases }: BombingBoardProps) {
    const [selectedPhaseId, setSelectedPhaseId] = useState<string>(phases[0]?.id || "");
    
    // Find selected phase
    const selectedPhase = phases.find(p => p.id === selectedPhaseId);
    
    // Check lock status
    const isLocked = selectedPhase?.placementEndTime ? new Date() >= new Date(selectedPhase.placementEndTime) : false;

    // Filter bombs? No, showing all for now as per previous logic decision (show context).
    // But maybe we want to highlight bombs from this phase?
    // For now, simple pass-through.
    const visibleBombs = bombs; 

    const handlePlaceBomb = async (x: number, y: number) => {
        if (!selectedPhaseId) {
            toast.error("Select a phase first");
            return;
        }
        if (isLocked) {
             toast.error("This phase is locked");
             return;
        }

        try {
            const result = await placeBomb(segmentId, targetTeamId, x, y, selectedPhaseId);
            if (result.success) {
                toast.success("Bomb placed!");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to place bomb");
        }
    };

    if (phases.length === 0) {
        return (
            <div className="text-center p-8 bg-muted rounded-lg border">
                <h3 className="font-semibold">No Bombing Phases Active</h3>
                <p className="text-sm text-muted-foreground">The game manager has not scheduled any bombing rounds yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium flex justify-between items-center">
                        <span>Bombing Phase</span>
                        {selectedPhase && (
                            <Badge variant={isLocked ? "secondary" : "default"}>
                                {isLocked ? "Locked" : "Open"}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <Select value={selectedPhaseId} onValueChange={setSelectedPhaseId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Phase" />
                      </SelectTrigger>
                      <SelectContent>
                        {phases.map((phase) => (
                          <SelectItem key={phase.id} value={phase.id}>
                            {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPhase?.placementEndTime && (
                         <p className="text-xs text-muted-foreground mt-2">
                            Locks at: {new Date(selectedPhase.placementEndTime).toLocaleString()}
                         </p>
                    )}
                </CardContent>
            </Card>

            <div className="border rounded-lg p-4 bg-white dark:bg-zinc-900 flex justify-center">
                <BoardGrid 
                    ships={[]}
                    bombs={visibleBombs}
                    interactive={!isLocked && !!selectedPhaseId}
                    onPlace={handlePlaceBomb}
                />
            </div>
        </div>
    );
}
