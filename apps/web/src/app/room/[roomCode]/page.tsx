import { LobbyClient } from "@/components/lobby/LobbyClient";

export default async function RoomPage({
  params
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return <LobbyClient initialRoomCode={roomCode} />;
}
