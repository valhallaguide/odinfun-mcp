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

// Define server name and version in one place
const SERVER_NAME = "odin-fun-server";
const SERVER_VERSION = "1.0.0";

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
    console.error("Starting odin-fun-server...");
    console.error("Current working directory:", process.cwd());

    // Register documentation resources first
    try {
      console.error("Registering API documentation resources...");
      registerDocumentationResources(server);
      console.error("API documentation resources registered");
    } catch (err) {
      console.error("Error registering documentation resources:", err);
      throw err;
    }

    // Register tools
    try {
      console.error("Registering canister tools...");
      registerCanisterTools(server);
      console.error("Canister tools registered");
    } catch (err) {
      console.error("Error registering canister tools:", err);
      throw err;
    }

    try {
      console.error("Registering odin-fun tools...");
      registerOdinFunTools(server);
      console.error("Odin-fun tools registered");
    } catch (err) {
      console.error("Error registering odin-fun tools:", err);
      throw err;
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
            console.error(`SSE connection closed: ${sessionId}`);
          });
          
          console.error(`New SSE connection established: ${sessionId}`);
          
          // Connect to MCP server
          server.connect(transport)
            .then(() => {
              console.error(`Server successfully connected to SSE transport: ${sessionId}`);
            })
            .catch((err) => {
              console.error(`Error connecting to SSE transport: ${err}`);
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
            console.error(`Streamable connection closed: ${sessionId}`);
          });
          
          console.error(`New Streamable connection established: ${sessionId}`);
          
          // Connect to MCP server
          server.connect(transport)
            .then(() => {
              console.error(`Server successfully connected to Streamable transport: ${sessionId}`);
            })
            .catch((err) => {
              console.error(`Error connecting to Streamable transport: ${err}`);
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
              console.error(`Error handling SSE message: ${err}`);
              res.status(500).json({ error: 'Internal server error' });
            });
        } else if (mode === 'streamable' && streamableTransports[sessionId]) {
          const transport = streamableTransports[sessionId];
          transport.handlePostMessage(req, res, req.body)
            .catch((err) => {
              console.error(`Error handling Streamable message: ${err}`);
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
        console.error(`Odin-fun-server HTTP server running on port ${PORT}`);
        console.error(`Available modes: ${process.argv.includes("--sse") ? "SSE" : ""} ${process.argv.includes("--streamable") ? "Streamable" : ""}`);
      });
      return;
    }

    // Default to stdio transport
    console.error("Using Stdio transport...");
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.error("Odin-fun-server connected via stdio");
    return;
    
  } catch (err) {
    console.error("Fatal error during server startup:", err);
    if (err instanceof Error) {
      console.error("Error stack:", err.stack);
    }
    // Rethrow the error to trigger the top-level catch
    throw err;
  }
}

// Start server with proper error handling
main().catch((err) => {
  console.error("Unhandled error in main:", err);
  if (err instanceof Error) {
    console.error("Error stack:", err.stack);
  }
  process.exit(1);
});