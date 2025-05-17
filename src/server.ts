#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableServerTransport } from "./server/streamable.js";
import { registerCanisterTools } from "./tools/canisterTools.js";
import { registerOdinFunTools } from "./tools/odinFunTools.js";
import { registerDocumentationResources } from "./docs/registerDocs.js";
import express from "express";
import cors from "cors";
import { logger } from "./utils/logger.js";

// Define server name and version in one place
const SERVER_NAME = "odin-fun-server";
const SERVER_VERSION = "1.0.2";

// Create McpServer instance
const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION
});

// Store transport instances
const sseTransports: Record<string, SSEServerTransport> = {};
const streamableTransports: Record<string, StreamableServerTransport> = {};

// Tool registration and server startup
async function main() {
  try {
    logger.log("Starting odin-fun-server...");
    logger.log("Current working directory:", process.cwd());

    // Register API documentation resources
    try {
      logger.log("Registering API documentation resources...");
      await registerDocumentationResources(server);
      logger.log("API documentation resources registered");
    } catch (err) {
      logger.error("Error registering documentation resources:", err);
    }

    // Register canister tools
    try {
      logger.log("Registering canister tools...");
      await registerCanisterTools(server);
      logger.log("Canister tools registered");
    } catch (err) {
      logger.error("Error registering canister tools:", err);
    }

    // Register odin-fun tools
    try {
      logger.log("Registering odin-fun tools...");
      await registerOdinFunTools(server);
      logger.log("Odin-fun tools registered");
    } catch (err) {
      logger.error("Error registering odin-fun tools:", err);
    }

    // Check if HTTP transport should be used
    if (process.argv.includes("--sse") || process.argv.includes("--streamable")) {
      // Set up Express application
      const app = express();
      app.use(cors());
      app.use(express.json());

      // Handle SSE mode
      if (process.argv.includes("--sse")) {
        // SSE endpoint
        app.get('/sse', (req, res) => {
          // Set SSE headers
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          
          // Create SSE transport
          const transport = new SSEServerTransport('/messages', res);
          const sessionId = transport.sessionId;
          sseTransports[sessionId] = transport;
          
          // Clean up when connection closes
          res.on('close', () => {
            delete sseTransports[sessionId];
            logger.error(`SSE connection closed: ${sessionId}`);
          });
          
          logger.log(`New SSE connection established: ${sessionId}`);
          
          // Connect to MCP server
          server.connect(transport)
            .then(() => {
              logger.log(`Server successfully connected to SSE transport: ${sessionId}`);
            })
            .catch((err) => {
              logger.error(`Error connecting to SSE transport: ${err}`);
              res.end();
            });
        });
      }

      // Handle Streamable mode
      if (process.argv.includes("--streamable")) {
        // Streamable endpoint
        app.get('/stream', (req, res) => {
          // Create Streamable transport
          const transport = new StreamableServerTransport('/messages', res);
          const sessionId = transport.sessionId;
          streamableTransports[sessionId] = transport;
          
          // Clean up when connection closes
          res.on('close', () => {
            delete streamableTransports[sessionId];
            logger.error(`Streamable connection closed: ${sessionId}`);
          });
          
          logger.log(`New Streamable connection established: ${sessionId}`);
          
          // Connect to MCP server
          server.connect(transport)
            .then(() => {
              logger.log(`Server successfully connected to Streamable transport: ${sessionId}`);
            })
            .catch((err) => {
              logger.error(`Error connecting to Streamable transport: ${err}`);
              res.end();
            });
        });
      }
      
      // Message handling endpoint for both modes
      app.post('/messages', (req, res) => {
        const sessionId = req.query.sessionId as string;
        const mode = req.query.mode as string;
        
        if (!sessionId) {
          res.status(400).send('Invalid or missing session ID');
          return;
        }

        if (mode === 'sse' && sseTransports[sessionId]) {
          const transport = sseTransports[sessionId];
          transport.handlePostMessage(req, res, req.body)
            .catch((err) => {
              logger.error(`Error handling SSE message: ${err}`);
              res.status(500).json({ error: 'Internal server error' });
            });
        } else if (mode === 'streamable' && streamableTransports[sessionId]) {
          const transport = streamableTransports[sessionId];
          transport.handlePostMessage(req, res, req.body)
            .catch((err) => {
              logger.error(`Error handling Streamable message: ${err}`);
              res.status(500).json({ error: 'Internal server error' });
            });
        } else {
          res.status(400).send('Invalid session ID or transport mode');
        }
      });
      
      // Status check endpoint
      app.get('/', (req, res) => {
        res.json({
          status: 'running',
          name: SERVER_NAME,
          version: SERVER_VERSION,
          modes: {
            sse: process.argv.includes("--sse"),
            streamable: process.argv.includes("--streamable")
          }
        });
      });
      
      // Start HTTP server
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        logger.log(`Odin-fun-server HTTP server running on port ${PORT}`);
        logger.log(`Available modes: ${process.argv.includes("--sse") ? "SSE" : ""} ${process.argv.includes("--streamable") ? "Streamable" : ""}`);
      });
      return;
    }

    // Default to stdio transport
    logger.log("Using Stdio transport...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.log("Odin-fun-server connected via stdio");
    return;
    
  } catch (err: unknown) {
    logger.error("Fatal error during server startup:", err);
    if (err instanceof Error) {
      logger.error("Error stack:", err.stack);
    }
    process.exit(1);
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (err: unknown) => {
  logger.error("Unhandled error in main:", err);
  if (err instanceof Error) {
    logger.error("Error stack:", err.stack);
  }
});

// Handle process termination
process.on('SIGINT', async () => {
  logger.log("Shutting down server...");
  await logger.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.log("Shutting down server...");
  await logger.close();
  process.exit(0);
});

main().catch(async (err: unknown) => {
  logger.error("Unhandled error in main:", err);
  if (err instanceof Error) {
    logger.error("Error stack:", err.stack);
  }
  await logger.close();
  process.exit(1);
});