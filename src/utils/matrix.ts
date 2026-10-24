import { GraphData, GraphNode, GraphEdge } from '../types/graph';

export interface MatrixParseResult {
  success: boolean;
  matrix?: number[][];
  labels?: string[];
  error?: string;
}

export function graphToMatrix(graph: GraphData): { labels: string[]; matrix: number[][]; nodeIds: string[] } {
  const sortedNodes = [...graph.nodes].sort((a, b) => a.label.localeCompare(b.label));
  const n = sortedNodes.length;
  const nodeIndexMap = new Map<string, number>();
  sortedNodes.forEach((node, idx) => nodeIndexMap.set(node.id, idx));

  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (const edge of graph.edges) {
    const srcIdx = nodeIndexMap.get(edge.source);
    const tgtIdx = nodeIndexMap.get(edge.target);

    if (srcIdx !== undefined && tgtIdx !== undefined) {
      matrix[srcIdx][tgtIdx] = 1;
      if (!graph.isDirected) {
        matrix[tgtIdx][srcIdx] = 1;
      }
    }
  }

  return {
    labels: sortedNodes.map(n => n.label),
    nodeIds: sortedNodes.map(n => n.id),
    matrix,
  };
}

export function matrixToGraph(
  matrix: number[][],
  labels?: string[],
  isDirected: boolean = false,
  canvasWidth: number = 800,
  canvasHeight: number = 550
): GraphData {
  const n = matrix.length;
  if (n === 0) {
    return { nodes: [], edges: [], isDirected };
  }

  // Generate default labels if not provided
  const resolvedLabels: string[] = [];
  for (let i = 0; i < n; i++) {
    if (labels && labels[i]) {
      resolvedLabels.push(labels[i].trim());
    } else if (n <= 26) {
      resolvedLabels.push(String.fromCharCode(65 + i)); // A, B, C...
    } else {
      resolvedLabels.push(`V${i}`);
    }
  }

  // Arrange nodes in an aesthetically pleasing circular or multi-ring layout
  const nodes: GraphNode[] = [];
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.36;

  if (n === 1) {
    nodes.push({ id: 'node_0', label: resolvedLabels[0], x: centerX, y: centerY });
  } else {
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const x = Math.round(centerX + radius * Math.cos(angle));
      const y = Math.round(centerY + radius * Math.sin(angle));
      nodes.push({
        id: `node_${i}`,
        label: resolvedLabels[i],
        x,
        y,
      });
    }
  }

  // Generate edges
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] !== 0) {
        if (!isDirected) {
          // Undirected: ensure single edge per pair
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({
              id: `edge_${nodes[i].id}_${nodes[j].id}`,
              source: nodes[i].id,
              target: nodes[j].id,
              weight: matrix[i][j] === 1 ? undefined : matrix[i][j],
            });
          }
        } else {
          // Directed edge
          edges.push({
            id: `edge_${nodes[i].id}_${nodes[j].id}`,
            source: nodes[i].id,
            target: nodes[j].id,
            weight: matrix[i][j] === 1 ? undefined : matrix[i][j],
          });
        }
      }
    }
  }

  return { nodes, edges, isDirected };
}

export function parseMatrixText(text: string): MatrixParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { success: false, error: 'Input is empty. Please enter an adjacency matrix.' };
  }

  // Check if standard JSON array format: [[0, 1], [1, 0]]
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.every(row => Array.isArray(row))) {
        const rows = parsed.length;
        if (rows === 0) return { success: false, error: 'Matrix has 0 rows.' };
        for (let r = 0; r < rows; r++) {
          if (parsed[r].length !== rows) {
            return {
              success: false,
              error: `Non-square matrix: Row ${r + 1} has ${parsed[r].length} items, expected ${rows}.`,
            };
          }
          for (let c = 0; c < rows; c++) {
            if (typeof parsed[r][c] !== 'number' || isNaN(parsed[r][c])) {
              return { success: false, error: `Invalid number at [${r + 1}, ${c + 1}]: "${parsed[r][c]}"` };
            }
          }
        }
        return { success: true, matrix: parsed };
      }
    } catch {
      // Fall through to plain text parsing
    }
  }

  // Split lines and filter out empty / divider lines
  const rawLines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  // Filter out markdown table separator lines like |---|---| or +---+---+
  const lines = rawLines.filter(line => !/^[|\s\-:+]+$/.test(line));
  if (lines.length === 0) {
    return { success: false, error: 'No data rows found.' };
  }

  // Check if lines are Markdown table rows using pipe '|'
  const isPipeDelimited = lines.every(l => l.includes('|'));

  const tokenizedLines: string[][] = lines.map(line => {
    if (isPipeDelimited) {
      // Split by pipe and trim
      const parts = line.split('|').map(p => p.trim());
      // Drop empty leading and trailing cells from "| a | b |"
      if (parts[0] === '') parts.shift();
      if (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
      return parts;
    } else {
      // Remove square brackets, replace commas/semicolons with spaces
      const cleaned = line.replace(/[\[\];,]+/g, ' ').trim();
      return cleaned.split(/\s+/).filter(tok => tok.length > 0);
    }
  });

  if (tokenizedLines.length === 0 || tokenizedLines[0].length === 0) {
    return { success: false, error: 'No valid data tokens found.' };
  }

  // Check if first line might be labels (all non-numeric tokens)
  let extractedLabels: string[] | undefined;
  let dataLines = tokenizedLines;

  const firstLineAllNonNumeric = tokenizedLines[0].every(tok => tok === '' || isNaN(Number(tok)));
  if (firstLineAllNonNumeric && tokenizedLines.length > 1) {
    extractedLabels = tokenizedLines[0];
    dataLines = tokenizedLines.slice(1);
  }

  const numRows = dataLines.length;

  // Check if first row had an extra corner header cell (e.g. "\ A B C" or "| | A | B |")
  if (extractedLabels) {
    if (extractedLabels.length === numRows + 1) {
      // Drop corner dummy cell
      extractedLabels = extractedLabels.slice(1);
    }
  }

  // Check if each data row has a leading row label: e.g. "A 0 1 1"
  if (dataLines.length > 0 && dataLines[0].length === numRows + 1 && isNaN(Number(dataLines[0][0]))) {
    if (!extractedLabels) {
      extractedLabels = dataLines.map(row => row[0]);
    }
    dataLines = dataLines.map(row => row.slice(1));
  }

  const matrix: number[][] = [];

  for (let r = 0; r < numRows; r++) {
    const row = dataLines[r];
    if (row.length !== numRows) {
      return {
        success: false,
        error: `Matrix is not square: row ${r + 1} has ${row.length} values, but there are ${numRows} rows total.`,
      };
    }

    const numericRow: number[] = [];
    for (let c = 0; c < row.length; c++) {
      const val = Number(row[c]);
      if (isNaN(val)) {
        return {
          success: false,
          error: `Invalid value "${row[c]}" at row ${r + 1}, column ${c + 1}. Expected a number (0 or 1).`,
        };
      }
      numericRow.push(val);
    }
    matrix.push(numericRow);
  }

  return {
    success: true,
    matrix,
    labels: extractedLabels && extractedLabels.length === numRows ? extractedLabels : undefined,
  };
}

export function generateRandomMatrix(size: number, density: number = 0.35, isDirected: boolean = false): number[][] {
  const m: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i === j) continue;
      if (!isDirected && j < i) {
        m[i][j] = m[j][i];
      } else {
        m[i][j] = Math.random() < density ? 1 : 0;
      }
    }
  }
  return m;
}
