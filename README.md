# Graph Traversal Visualizer (BFS & DFS)

An interactive visualizer for exploring **Breadth-First Search (BFS)** and **Depth-First Search (DFS)** algorithms on arbitrary directed and undirected graphs.

---

## ✨ Features

- **Any Graph Support**: Directed and undirected graphs, multi-cycle graphs, binary trees, disconnected components, and custom graphs.
- **Complex Network Starter Demo**: Preloaded with a handcrafted 10-node complex network exhibiting cycles, branching paths, and cross-edges to clearly contrast BFS wavefront expansion with DFS deep recursion. Also includes Petersen Graph, Complete $K_5$, Binary Tree, Disconnected Components, and Cycle presets.
- **Dual Traversal Engines**:
  - **BFS (Breadth-First Search)**: Live **FIFO Queue** visualizer showing front/rear pointers, discovery order, level waves, and shortest-path tree edges.
  - **DFS (Depth-First Search)**: Live **LIFO Call Stack** visualizer showing active recursive frames, stack depth, tree edges, back edges (cycle detection), and backtrack transitions.
  - **Component Coverage**: Choose between **Single Component** traversal or **All Components** full-graph exploration.
- **Interactive Arrow-Key & Visual Builder**:
  - **Just Arrow Keys**: Press `↑ ↓ ← →` in Spawn mode to branch and connect new nodes instantly in any direction.
  - **3 Arrow Modes**: Tap `Tab` or toggle via D-Pad to switch between **Spawn** (creates connected nodes), **Navigate** (hops active node), and **Move** (repositions node).
  - **Quick Connect Bar**: Easily link the selected node to any other node with 1 click.
  - **Interactive Canvas**: Drag-and-drop nodes, click canvas to add vertices (`N`), click two nodes to create an edge (`C`), and rename labels on double-click.
- **Adjacency Matrix Studio**:
  - **Interactive Matrix Grid**: Click any cell $(i, j)$ in real-time to toggle edges on/off $(0 \leftrightarrow 1)$ without scrambling custom node labels.
  - **Rich Matrix Import**: Paste space-separated, comma-separated, bracketed JSON (`[[0,1],[1,0]]`), or **Markdown tables** (`| A | B |`) with automatic header recognition and circular layout generation.
  - **Matrix Export**: Plain text, CSV, and JSON copy formats.
- **Synchronized Algorithm HUD**:
  - Scrubbable timeline slider to jump to any micro-step.
  - Play, Pause, Step Forward (`K` or `]`), Step Backward (`J` or `[`), Reset (`R`).
  - Speed selector: `0.5x`, `1x`, `2x`, `4x`.
  - Line-by-line synchronized pseudocode tracker with plain-English execution explanations.
  - Synthesized Web Audio feedback (optional toggle for tactile learning).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Automated Unit Tests
```bash
npm run test
```

### 4. Build for Production
```bash
npm run build
```
The static distribution files will be created in the `dist/` directory.

---

## 🌐 Hosting & Deployment

The web application is statically bundled with relative paths (`base: './'`). It deploys directly to GitHub Pages using the built-in [deploy.yml](.github/workflows/deploy.yml) workflow:

1. In repository **Settings** → **Pages**
2. Set **Source** to **GitHub Actions**
3. The site will automatically build and publish.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `↑` `↓` `←` `→` | Arrow Action (**Spawn** connected node / **Navigate** selection / **Move** node) |
| `Tab` | Cycle Arrow Mode (`Spawn` ↔ `Navigate` ↔ `Move`) |
| `Shift + Arrow` | Fast nudge node position |
| `Space` | Play / Pause traversal |
| `]` or `K` | Step forward in traversal |
| `[` or `J` | Step backward in traversal |
| `R` | Reset traversal to start |
| `N` / Double Click | Add new node |
| `C` | Connect node mode |
| `Del` / `Backspace`| Delete selected node or edge |
| `1` / `2` | Switch between BFS (`1`) and DFS (`2`) |

---

## 📊 Complexity Reference

| Algorithm | Data Structure | Time Complexity | Auxiliary Space Complexity |
| :--- | :--- | :--- | :--- |
| **Breadth-First Search (BFS)** | FIFO Queue | $\mathcal{O}(\|V\| + \|E\|)$ | $\mathcal{O}(\|V\|)$ (Frontier queue) |
| **Depth-First Search (DFS)** | LIFO Stack | $\mathcal{O}(\|V\| + \|E\|)$ | $\mathcal{O}(\|V\|)$ (Call stack depth) |
