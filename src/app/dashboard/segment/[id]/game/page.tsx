
import { redirect } from "next/navigation";

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Redirect to first team board or instructions?
  // Or maybe a "Lobby" page explaining the status.
  // For now, redirect to setup if open, else first team.
  
  // Ideally, show a "Select a team to view" message.
  return (
      <div className="flex h-full items-center justify-center text-neutral-500">
          <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to the Game</h2>
              <p>Select a team from the sidebar to view their board or bomb them.</p>
          </div>
      </div>
  );
}
