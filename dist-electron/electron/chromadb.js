"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryEmbedding = exports.insertEmbedding = void 0;
// Re-export ChromaDB client functions from the ai/chroma module
var chroma_js_1 = require("./ai/chroma.js");
Object.defineProperty(exports, "insertEmbedding", { enumerable: true, get: function () { return chroma_js_1.insertEmbedding; } });
Object.defineProperty(exports, "queryEmbedding", { enumerable: true, get: function () { return chroma_js_1.queryEmbedding; } });
