import { useEffect, useRef, useState } from 'react';
import { useBoardStore } from '../store/boardStore';

export const clientSocketId = crypto.randomUUID();

export function useBoardSocket(boardId: string | undefined, token: string | null) {
    const [isConnected, setIsConnected] = useState(false);
    const store = useBoardStore();
    const wsRef = useRef<WebSocket | null>(null);
    const backoffRef = useRef(2000);

    useEffect(() => {
        if (!boardId || !token) return;
        let active = true;

        const connect = () => {
            if (!active) return;
            const ws = new WebSocket(`ws://localhost:8000/ws/board/${boardId}/?token=${token}`);
            wsRef.current = ws;
            ws.onopen = () => {
                if (active) { setIsConnected(true); backoffRef.current = 2000; }
            };
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.sender_socket_id === clientSocketId) return;
                const { type, payload } = data;
                if (type === 'task.created') store.addTask(payload);
                else if (type === 'task.updated') store.updateTask(payload.task_id, payload.changed_fields || {});
                else if (type === 'task.moved') store.moveTaskOptimistic(payload.task_id, payload.from_column_id, payload.to_column_id, payload.new_order);
                else if (type === 'task.deleted') store.deleteTask(payload.task_id);
                else if (type === 'column.reordered') store.reorderColumns(payload.ordered_ids);
            };
            ws.onclose = () => {
                setIsConnected(false);
                if (active) {
                    setTimeout(connect, backoffRef.current);
                    backoffRef.current = Math.min(backoffRef.current * 1.5, 30000);
                }
            };
        };
        connect();
        return () => { active = false; wsRef.current?.close(); };
    }, [boardId, token]);

    return { isConnected };
}
