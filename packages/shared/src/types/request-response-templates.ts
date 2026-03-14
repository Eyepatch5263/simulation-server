import { ArchNodeType } from './node-types';

export interface RequestResponseTemplate {
  componentType: ArchNodeType;
  requestTemplate: {
    description: string;
    sample: Record<string, any>;
    fields: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  };
  responseTemplate: {
    description: string;
    sample: Record<string, any>;
    fields: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  };
}

export const REQUEST_RESPONSE_TEMPLATES: Partial<Record<ArchNodeType, RequestResponseTemplate>> = {
  [ArchNodeType.FRONTEND]: {
    componentType: ArchNodeType.FRONTEND,
    requestTemplate: {
      description: 'User action from browser/mobile client',
      sample: {
        action: 'browse_products',
        userId: 'user_4521',
        sessionId: 'sess_abc123',
        timestamp: 1709456234000,
      },
      fields: [
        { name: 'action', type: 'string', description: 'User action type' },
        { name: 'userId', type: 'string', description: 'Unique user identifier' },
        { name: 'sessionId', type: 'string', description: 'Browser session' },
        { name: 'timestamp', type: 'number', description: 'Event timestamp in ms' },
      ],
    },
    responseTemplate: {
      description: 'Response to client with rendered content',
      sample: {
        statusCode: 200,
        contentType: 'application/json',
        renderTimeMs: 45,
        cached: false,
      },
      fields: [
        { name: 'statusCode', type: 'number', description: 'HTTP status code' },
        { name: 'renderTimeMs', type: 'number', description: 'Time to render' },
        { name: 'cached', type: 'boolean', description: 'Was response cached' },
      ],
    },
  },

  [ArchNodeType.API_GATEWAY]: {
    componentType: ArchNodeType.API_GATEWAY,
    requestTemplate: {
      description: 'Incoming API request requiring validation and routing',
      sample: {
        method: 'GET',
        path: '/api/products/542',
        headers: { Authorization: 'Bearer token_xyz' },
        timestamp: 1709456234100,
      },
      fields: [
        { name: 'method', type: 'string', description: 'HTTP method' },
        { name: 'path', type: 'string', description: 'Request path' },
        { name: 'headers', type: 'object', description: 'Request headers' },
      ],
    },
    responseTemplate: {
      description: 'API response after validation',
      sample: {
        statusCode: 200,
        validated: true,
        routedTo: 'product_service',
        latencyMs: 5,
      },
      fields: [
        { name: 'statusCode', type: 'number', description: 'HTTP status' },
        { name: 'validated', type: 'boolean', description: 'Request validated' },
        { name: 'routedTo', type: 'string', description: 'Target service' },
      ],
    },
  },

  [ArchNodeType.LOAD_BALANCER]: {
    componentType: ArchNodeType.LOAD_BALANCER,
    requestTemplate: {
      description: 'Request to be distributed across backend services',
      sample: {
        requestId: 'req_12345',
        priority: 'normal',
        timestamp: 1709456234150,
      },
      fields: [
        { name: 'requestId', type: 'string', description: 'Unique request ID' },
        { name: 'priority', type: 'string', description: 'Request priority' },
      ],
    },
    responseTemplate: {
      description: 'Load balancer routing decision',
      sample: {
        selectedBackend: 'service_replica_2',
        algorithm: 'round_robin',
        connectionTime: 2,
      },
      fields: [
        { name: 'selectedBackend', type: 'string', description: 'Backend selected' },
        { name: 'algorithm', type: 'string', description: 'LB algorithm used' },
      ],
    },
  },

  [ArchNodeType.CUSTOM_SERVICE]: {
    componentType: ArchNodeType.CUSTOM_SERVICE,
    requestTemplate: {
      description: 'Business logic service request',
      sample: {
        requestId: 'req_12345',
        action: 'get_product',
        productId: 542,
        userId: 'user_4521',
      },
      fields: [
        { name: 'requestId', type: 'string', description: 'Unique request ID' },
        { name: 'action', type: 'string', description: 'Service action' },
        { name: 'productId', type: 'number', description: 'Resource ID' },
      ],
    },
    responseTemplate: {
      description: 'Service response with processed data',
      sample: {
        success: true,
        processingTimeMs: 50,
        resultSize: 1024,
        statusCode: 200,
      },
      fields: [
        { name: 'success', type: 'boolean', description: 'Request succeeded' },
        { name: 'processingTimeMs', type: 'number', description: 'Service latency' },
        { name: 'resultSize', type: 'number', description: 'Response size bytes' },
      ],
    },
  },

  [ArchNodeType.DATABASE]: {
    componentType: ArchNodeType.DATABASE,
    requestTemplate: {
      description: 'Database query request',
      sample: {
        query: 'SELECT * FROM products WHERE id = ?',
        parameters: [542],
        connectionId: 'conn_123',
      },
      fields: [
        { name: 'query', type: 'string', description: 'SQL query' },
        { name: 'parameters', type: 'array', description: 'Query parameters' },
        { name: 'connectionId', type: 'string', description: 'Connection pool ID' },
      ],
    },
    responseTemplate: {
      description: 'Database query result',
      sample: {
        rows: 1,
        columns: 8,
        latencyMs: 25,
        cached: false,
      },
      fields: [
        { name: 'rows', type: 'number', description: 'Number of rows' },
        { name: 'latencyMs', type: 'number', description: 'Query latency' },
        { name: 'cached', type: 'boolean', description: 'Was result cached' },
      ],
    },
  },

  [ArchNodeType.CACHE]: {
    componentType: ArchNodeType.CACHE,
    requestTemplate: {
      description: 'Cache lookup request',
      sample: {
        key: 'product_542',
        operation: 'get',
        ttl: 3600,
      },
      fields: [
        { name: 'key', type: 'string', description: 'Cache key' },
        { name: 'operation', type: 'string', description: 'get/set/delete' },
        { name: 'ttl', type: 'number', description: 'Time to live (seconds)' },
      ],
    },
    responseTemplate: {
      description: 'Cache response',
      sample: {
        hit: true,
        value: { id: 542, name: 'Product Name' },
        ageMs: 245,
      },
      fields: [
        { name: 'hit', type: 'boolean', description: 'Cache hit or miss' },
        { name: 'ageMs', type: 'number', description: 'How long cached' },
      ],
    },
  },

  [ArchNodeType.QUEUE]: {
    componentType: ArchNodeType.QUEUE,
    requestTemplate: {
      description: 'Event message to be queued',
      sample: {
        topic: 'order_events',
        event: { orderId: 1234, action: 'created', timestamp: 1709456234000 },
      },
      fields: [
        { name: 'topic', type: 'string', description: 'Queue topic/channel' },
        { name: 'event', type: 'object', description: 'Event payload' },
      ],
    },
    responseTemplate: {
      description: 'Queue acknowledgment',
      sample: {
        partition: 3,
        offset: 982451,
        acked: true,
        latencyMs: 12,
      },
      fields: [
        { name: 'partition', type: 'number', description: 'Queue partition' },
        { name: 'offset', type: 'number', description: 'Message offset' },
        { name: 'acked', type: 'boolean', description: 'Message acknowledged' },
      ],
    },
  },

  [ArchNodeType.SEARCH_ENGINE]: {
    componentType: ArchNodeType.SEARCH_ENGINE,
    requestTemplate: {
      description: 'Full-text search request',
      sample: {
        query: 'laptop',
        filters: { price: { min: 500, max: 2000 } },
        limit: 20,
      },
      fields: [
        { name: 'query', type: 'string', description: 'Search query' },
        { name: 'filters', type: 'object', description: 'Search filters' },
        { name: 'limit', type: 'number', description: 'Result limit' },
      ],
    },
    responseTemplate: {
      description: 'Search results',
      sample: {
        hits: 1247,
        results: 20,
        latencyMs: 125,
        shards: 10,
      },
      fields: [
        { name: 'hits', type: 'number', description: 'Total matches' },
        { name: 'results', type: 'number', description: 'Returned results' },
        { name: 'latencyMs', type: 'number', description: 'Search latency' },
      ],
    },
  },

  [ArchNodeType.PAYMENT_GATEWAY]: {
    componentType: ArchNodeType.PAYMENT_GATEWAY,
    requestTemplate: {
      description: 'Payment processing request',
      sample: {
        transactionId: 'txn_987654',
        amount: 99.99,
        currency: 'USD',
        cardTokenId: 'tok_xyz123',
      },
      fields: [
        { name: 'transactionId', type: 'string', description: 'Transaction ID' },
        { name: 'amount', type: 'number', description: 'Transaction amount' },
        { name: 'currency', type: 'string', description: 'Currency code' },
      ],
    },
    responseTemplate: {
      description: 'Payment result',
      sample: {
        approved: true,
        authCode: 'AUTH123456',
        processingTimeMs: 850,
        fee: 2.99,
      },
      fields: [
        { name: 'approved', type: 'boolean', description: 'Payment approved' },
        { name: 'authCode', type: 'string', description: 'Authorization code' },
        { name: 'processingTimeMs', type: 'number', description: 'Processing time' },
      ],
    },
  },

  [ArchNodeType.ANALYTICS_SERVICE]: {
    componentType: ArchNodeType.ANALYTICS_SERVICE,
    requestTemplate: {
      description: 'Analytics event to process and aggregate',
      sample: {
        eventType: 'purchase',
        userId: 'user_4521',
        amount: 99.99,
        timestamp: 1709456234000,
      },
      fields: [
        { name: 'eventType', type: 'string', description: 'Event type' },
        { name: 'userId', type: 'string', description: 'User ID' },
        { name: 'timestamp', type: 'number', description: 'Event timestamp' },
      ],
    },
    responseTemplate: {
      description: 'Analytics aggregation result',
      sample: {
        aggregated: true,
        batchSize: 1000,
        processingTimeMs: 350,
      },
      fields: [
        { name: 'aggregated', type: 'boolean', description: 'Event aggregated' },
        { name: 'batchSize', type: 'number', description: 'Batch size' },
      ],
    },
  },

  [ArchNodeType.NOTIFICATION_SERVICE]: {
    componentType: ArchNodeType.NOTIFICATION_SERVICE,
    requestTemplate: {
      description: 'Notification to send to users',
      sample: {
        userId: 'user_4521',
        channel: 'email',
        type: 'order_confirmation',
        metadata: { orderId: 1234 },
      },
      fields: [
        { name: 'userId', type: 'string', description: 'Recipient user ID' },
        { name: 'channel', type: 'string', description: 'Delivery channel' },
        { name: 'type', type: 'string', description: 'Notification type' },
      ],
    },
    responseTemplate: {
      description: 'Notification delivery result',
      sample: {
        sent: true,
        deliveryTimeMs: 180,
        channel: 'email',
      },
      fields: [
        { name: 'sent', type: 'boolean', description: 'Notification sent' },
        { name: 'deliveryTimeMs', type: 'number', description: 'Delivery time' },
      ],
    },
  },

  [ArchNodeType.CDN]: {
    componentType: ArchNodeType.CDN,
    requestTemplate: {
      description: 'Content delivery request',
      sample: {
        resource: '/images/product_542.jpg',
        region: 'us-west-2',
        timestamp: 1709456234000,
      },
      fields: [
        { name: 'resource', type: 'string', description: 'Resource path' },
        { name: 'region', type: 'string', description: 'CDN region' },
      ],
    },
    responseTemplate: {
      description: 'CDN delivery response',
      sample: {
        cacheHit: true,
        region: 'us-west-2',
        latencyMs: 12,
        sizeBytes: 102400,
      },
      fields: [
        { name: 'cacheHit', type: 'boolean', description: 'CDN cache hit' },
        { name: 'latencyMs', type: 'number', description: 'Delivery latency' },
        { name: 'sizeBytes', type: 'number', description: 'Content size' },
      ],
    },
  },

  [ArchNodeType.ML_MODEL_SERVICE]: {
    componentType: ArchNodeType.ML_MODEL_SERVICE,
    requestTemplate: {
      description: 'ML inference request',
      sample: {
        requestId: 'req_12345',
        features: [0.5, 0.2, 0.8, 0.3],
        modelVersion: '2.1',
      },
      fields: [
        { name: 'requestId', type: 'string', description: 'Request ID' },
        { name: 'features', type: 'array', description: 'Input features' },
        { name: 'modelVersion', type: 'string', description: 'Model version' },
      ],
    },
    responseTemplate: {
      description: 'ML inference result',
      sample: {
        prediction: 0.92,
        confidence: 0.95,
        inferenceTimeMs: 250,
      },
      fields: [
        { name: 'prediction', type: 'number', description: 'Prediction result' },
        { name: 'confidence', type: 'number', description: 'Confidence score' },
        { name: 'inferenceTimeMs', type: 'number', description: 'Inference time' },
      ],
    },
  },

  [ArchNodeType.STREAM_PROCESSOR]: {
    componentType: ArchNodeType.STREAM_PROCESSOR,
    requestTemplate: {
      description: 'Stream event for processing',
      sample: {
        streamId: 'user_activity',
        event: { userId: 'user_4521', action: 'click' },
      },
      fields: [
        { name: 'streamId', type: 'string', description: 'Stream ID' },
        { name: 'event', type: 'object', description: 'Event data' },
      ],
    },
    responseTemplate: {
      description: 'Stream processing result',
      sample: {
        processed: true,
        processingTimeMs: 50,
        outputTopic: 'processed_events',
      },
      fields: [
        { name: 'processed', type: 'boolean', description: 'Event processed' },
        { name: 'processingTimeMs', type: 'number', description: 'Processing time' },
      ],
    },
  },

  [ArchNodeType.WEBSOCKET_SERVER]: {
    componentType: ArchNodeType.WEBSOCKET_SERVER,
    requestTemplate: {
      description: 'WebSocket message from client',
      sample: {
        clientId: 'client_12345',
        messageType: 'update_position',
        data: { x: 100, y: 200 },
      },
      fields: [
        { name: 'clientId', type: 'string', description: 'Client ID' },
        { name: 'messageType', type: 'string', description: 'Message type' },
        { name: 'data', type: 'object', description: 'Message payload' },
      ],
    },
    responseTemplate: {
      description: 'WebSocket broadcast result',
      sample: {
        broadcasted: true,
        recipientCount: 15,
        latencyMs: 5,
      },
      fields: [
        { name: 'broadcasted', type: 'boolean', description: 'Message broadcast' },
        { name: 'recipientCount', type: 'number', description: 'Recipients reached' },
      ],
    },
  },

  [ArchNodeType.AUTH_SERVICE]: {
    componentType: ArchNodeType.AUTH_SERVICE,
    requestTemplate: {
      description: 'Authentication/authorization request',
      sample: {
        action: 'verify_token',
        token: 'Bearer eyJhbGciOiJIUzI1NiIs...',
        userId: 'user_4521',
        resource: '/api/protected/resource',
      },
      fields: [
        { name: 'action', type: 'string', description: 'Auth action (login/verify_token/refresh)' },
        { name: 'token', type: 'string', description: 'JWT or session token' },
        { name: 'userId', type: 'string', description: 'User identifier' },
        { name: 'resource', type: 'string', description: 'Protected resource path' },
      ],
    },
    responseTemplate: {
      description: 'Authentication result',
      sample: {
        authenticated: true,
        userId: 'user_4521',
        roles: ['user', 'premium'],
        tokenExpiresIn: 3600,
      },
      fields: [
        { name: 'authenticated', type: 'boolean', description: 'Auth succeeded' },
        { name: 'roles', type: 'array', description: 'User roles/permissions' },
        { name: 'tokenExpiresIn', type: 'number', description: 'Token TTL in seconds' },
      ],
    },
  },

  [ArchNodeType.ORDER_SERVICE]: {
    componentType: ArchNodeType.ORDER_SERVICE,
    requestTemplate: {
      description: 'Order processing request',
      sample: {
        action: 'create_order',
        userId: 'user_4521',
        items: [{ productId: 542, quantity: 2, price: 49.99 }],
        shippingAddress: { city: 'San Francisco', zip: '94102' },
      },
      fields: [
        { name: 'action', type: 'string', description: 'Order action (create/update/cancel)' },
        { name: 'userId', type: 'string', description: 'Customer user ID' },
        { name: 'items', type: 'array', description: 'Order line items' },
        { name: 'shippingAddress', type: 'object', description: 'Delivery address' },
      ],
    },
    responseTemplate: {
      description: 'Order processing result',
      sample: {
        orderId: 'ord_987654',
        status: 'confirmed',
        totalAmount: 99.98,
        estimatedDelivery: '2024-03-20',
      },
      fields: [
        { name: 'orderId', type: 'string', description: 'Created order ID' },
        { name: 'status', type: 'string', description: 'Order status' },
        { name: 'totalAmount', type: 'number', description: 'Order total' },
      ],
    },
  },

  [ArchNodeType.REAL_TIME_DB]: {
    componentType: ArchNodeType.REAL_TIME_DB,
    requestTemplate: {
      description: 'Real-time database read/write operation',
      sample: {
        operation: 'write',
        path: '/chats/room_123/messages',
        data: { senderId: 'user_4521', text: 'Hello!', timestamp: 1709456234000 },
        subscriptionId: 'sub_abc',
      },
      fields: [
        { name: 'operation', type: 'string', description: 'read/write/subscribe/unsubscribe' },
        { name: 'path', type: 'string', description: 'Document/collection path' },
        { name: 'data', type: 'object', description: 'Data payload for writes' },
        { name: 'subscriptionId', type: 'string', description: 'Real-time subscription ID' },
      ],
    },
    responseTemplate: {
      description: 'Real-time database response with sync status',
      sample: {
        success: true,
        documentId: 'msg_xyz789',
        syncedReplicas: 3,
        latencyMs: 8,
      },
      fields: [
        { name: 'success', type: 'boolean', description: 'Operation succeeded' },
        { name: 'documentId', type: 'string', description: 'Document identifier' },
        { name: 'syncedReplicas', type: 'number', description: 'Replicas synced' },
        { name: 'latencyMs', type: 'number', description: 'Write/read latency' },
      ],
    },
  },
};
