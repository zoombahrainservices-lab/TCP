interface QueuedWrite {
  id: string;
  operation: () => Promise<any>;
  retries: number;
  maxRetries: number;
  timestamp: number;
}

class BackgroundWriteQueue {
  private queue: QueuedWrite[] = [];
  private processing = false;

  enqueue(operation: () => Promise<any>, maxRetries = 3) {
    const write: QueuedWrite = {
      id: crypto.randomUUID(),
      operation,
      retries: 0,
      maxRetries,
      timestamp: Date.now()
    };

    this.queue.push(write);
    console.log(`[WriteQueue] Enqueued ${write.id}, queue length: ${this.queue.length}`);
    this.process();
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const write = this.queue[0];

      try {
        await write.operation();
        console.log(`[WriteQueue] Success: ${write.id}`);
        this.queue.shift(); // Remove from queue
      } catch (error) {
        write.retries++;
        console.error(`[WriteQueue] Attempt ${write.retries}/${write.maxRetries} failed for ${write.id}:`, error);

        if (write.retries >= write.maxRetries) {
          console.error(`[WriteQueue] Max retries reached for ${write.id}, removing from queue`);
          this.queue.shift();
        } else {
          // Move to end of queue and wait before retry
          this.queue.shift();
          this.queue.push(write);
          // Exponential backoff: 1s, 2s, 3s
          await new Promise(resolve => setTimeout(resolve, 1000 * write.retries));
        }
      }
    }

    this.processing = false;
  }

  clear() {
    this.queue = [];
    console.log('[WriteQueue] Cleared all pending writes');
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

export const writeQueue = new BackgroundWriteQueue();
