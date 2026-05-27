export const PARTICIPANT_COLORS = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1",
    "#84cc16",
    "#ef4444",
    "#06b6d4",
    "#a855f7",
    "#eab308",
    "#22c55e",
    "#0ea5e9",
    "#d946ef",
];

export function getParticipantColor(participantId: string) {
    let hash = 0;
    for (let i = 0; i < participantId.length; i++) {
        hash =
            participantId.charCodeAt(i) +
            ((hash << 5) - hash);
    }
    return PARTICIPANT_COLORS[Math.abs(hash) % PARTICIPANT_COLORS.length];
}