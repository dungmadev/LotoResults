import { Response } from 'express';
import { crawlQueue, CrawlQueueEvent } from './crawlQueue';

// --- Types ---

interface SSEClient {
    id: string;
    res: Response;
    connectedAt: string;
}

// --- Constants ---

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

// --- SSE Manager ---

class SSEManager {
    private clients: Map<string, SSEClient> = new Map();
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private static instance: SSEManager;
    private clientIdCounter = 0;

    private constructor() {
        // Listen to CrawlQueue events and broadcast to SSE clients
        crawlQueue.on('crawl-event', (event: CrawlQueueEvent) => {
            this.broadcast(event.type, {
                message: event.message,
                job: {
                    id: event.job.id,
                    date: event.job.date,
                    region: event.job.region,
                    status: event.job.status,
                },
                savedCount: event.savedCount,
                timestamp: new Date().toISOString(),
            });
        });

        // Start heartbeat
        this.startHeartbeat();
    }

    static getInstance(): SSEManager {
        if (!SSEManager.instance) {
            SSEManager.instance = new SSEManager();
        }
        return SSEManager.instance;
    }

    /**
     * Register a new SSE client connection
     */
    addClient(res: Response): string {
        const id = `sse-${++this.clientIdCounter}-${Date.now()}`;

        // Set SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'X-Accel-Buffering': 'no', // Disable Nginx buffering
        });

        // Send initial connection event
        this.sendToClient(res, 'connected', {
            clientId: id,
            message: 'Đã kết nối SSE thành công',
            timestamp: new Date().toISOString(),
            queueStatus: crawlQueue.getStatus(),
        });

        const client: SSEClient = {
            id,
            res,
            connectedAt: new Date().toISOString(),
        };

        this.clients.set(id, client);
        console.log(`[SSE] ✅ Client connected: ${id} (total: ${this.clients.size})`);

        // Handle client disconnect
        res.on('close', () => {
            this.clients.delete(id);
            console.log(`[SSE] 🔌 Client disconnected: ${id} (total: ${this.clients.size})`);
        });

        return id;
    }

    /**
     * Send an event to a specific client
     */
    private sendToClient(res: Response, eventType: string, data: unknown): void {
        try {
            const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
            res.write(payload);
        } catch (error) {
            // Client might have disconnected
            console.error('[SSE] Error sending to client:', (error as Error).message);
        }
    }

    /**
     * Broadcast an event to all connected clients
     */
    broadcast(eventType: string, data: unknown): void {
        if (this.clients.size === 0) return;

        console.log(`[SSE] 📡 Broadcasting "${eventType}" to ${this.clients.size} client(s)`);

        const deadClients: string[] = [];

        for (const [id, client] of this.clients) {
            try {
                this.sendToClient(client.res, eventType, data);
            } catch {
                deadClients.push(id);
            }
        }

        // Clean up dead clients
        for (const id of deadClients) {
            this.clients.delete(id);
        }
    }

    /**
     * Send heartbeat to keep connections alive
     */
    private startHeartbeat(): void {
        this.heartbeatTimer = setInterval(() => {
            if (this.clients.size === 0) return;

            const deadClients: string[] = [];

            for (const [id, client] of this.clients) {
                try {
                    client.res.write(`: heartbeat\n\n`);
                } catch {
                    deadClients.push(id);
                }
            }

            for (const id of deadClients) {
                this.clients.delete(id);
            }
        }, HEARTBEAT_INTERVAL_MS);
    }

    /**
     * Get connected client count
     */
    getClientCount(): number {
        return this.clients.size;
    }

    /**
     * Cleanup on server shutdown
     */
    shutdown(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }

        for (const [, client] of this.clients) {
            try {
                client.res.end();
            } catch {
                // Ignore
            }
        }
        this.clients.clear();
    }
}

// Export singleton
export const sseManager = SSEManager.getInstance();
