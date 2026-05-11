import { LobbyClient } from "@/components/lobby/LobbyClient";

export default async function GamePage({
  params
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <LobbyClient initialRoomCode={roomId} />;
}
