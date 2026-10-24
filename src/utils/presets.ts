import { PresetGraph } from '../types/graph';

export const PRESET_GRAPHS: PresetGraph[] = [
  {
    id: 'complex-network',
    name: 'Complex Network (Default Demo)',
    description: 'A rich 10-node network with branching paths, cycles, and cross connections — ideal for comparing BFS wavefront vs DFS deep dives.',
    isDirected: false,
    graph: {
      isDirected: false,
      nodes: [
        { id: 'node_A', label: 'A', x: 420, y: 70 },
        { id: 'node_B', label: 'B', x: 230, y: 160 },
        { id: 'node_C', label: 'C', x: 420, y: 190 },
        { id: 'node_D', label: 'D', x: 610, y: 160 },
        { id: 'node_E', label: 'E', x: 130, y: 290 },
        { id: 'node_F', label: 'F', x: 310, y: 310 },
        { id: 'node_G', label: 'G', x: 530, y: 310 },
        { id: 'node_H', label: 'H', x: 710, y: 290 },
        { id: 'node_I', label: 'I', x: 260, y: 440 },
        { id: 'node_J', label: 'J', x: 580, y: 440 },
      ],
      edges: [
        { id: 'e_A_B', source: 'node_A', target: 'node_B' },
        { id: 'e_A_C', source: 'node_A', target: 'node_C' },
        { id: 'e_A_D', source: 'node_A', target: 'node_D' },
        { id: 'e_B_E', source: 'node_B', target: 'node_E' },
        { id: 'e_B_F', source: 'node_B', target: 'node_F' },
        { id: 'e_C_F', source: 'node_C', target: 'node_F' },
        { id: 'e_C_G', source: 'node_C', target: 'node_G' },
        { id: 'e_D_G', source: 'node_D', target: 'node_G' },
        { id: 'e_D_H', source: 'node_D', target: 'node_H' },
        { id: 'e_E_I', source: 'node_E', target: 'node_I' },
        { id: 'e_F_I', source: 'node_F', target: 'node_I' },
        { id: 'e_G_J', source: 'node_G', target: 'node_J' },
        { id: 'e_H_J', source: 'node_H', target: 'node_J' },
        { id: 'e_I_J', source: 'node_I', target: 'node_J' }, // Cross cycle at the bottom!
      ]
    }
  },
  {
    id: 'binary-tree',
    name: 'Binary Search Tree',
    description: 'A 7-node complete binary tree clearly contrasting level-order (BFS) against depth-first pre-order (DFS).',
    isDirected: true,
    graph: {
      isDirected: true,
      nodes: [
        { id: 'tree_1', label: '1 (Root)', x: 420, y: 70 },
        { id: 'tree_2', label: '2', x: 250, y: 190 },
        { id: 'tree_3', label: '3', x: 590, y: 190 },
        { id: 'tree_4', label: '4', x: 160, y: 330 },
        { id: 'tree_5', label: '5', x: 340, y: 330 },
        { id: 'tree_6', label: '6', x: 500, y: 330 },
        { id: 'tree_7', label: '7', x: 680, y: 330 },
      ],
      edges: [
        { id: 'te_1_2', source: 'tree_1', target: 'tree_2' },
        { id: 'te_1_3', source: 'tree_1', target: 'tree_3' },
        { id: 'te_2_4', source: 'tree_2', target: 'tree_4' },
        { id: 'te_2_5', source: 'tree_2', target: 'tree_5' },
        { id: 'te_3_6', source: 'tree_3', target: 'tree_6' },
        { id: 'te_3_7', source: 'tree_3', target: 'tree_7' },
      ]
    }
  },
  {
    id: 'cyclic-diamond',
    name: 'Diamond Lattice (Multi-Cycle)',
    description: 'Lattice structure with intersecting cycles highlighting DFS back-edge detection and BFS shortest-hop paths.',
    isDirected: false,
    graph: {
      isDirected: false,
      nodes: [
        { id: 'dia_A', label: 'Start', x: 420, y: 60 },
        { id: 'dia_B', label: 'B', x: 260, y: 170 },
        { id: 'dia_C', label: 'C', x: 580, y: 170 },
        { id: 'dia_D', label: 'Mid-Left', x: 200, y: 300 },
        { id: 'dia_E', label: 'Center', x: 420, y: 270 },
        { id: 'dia_F', label: 'Mid-Right', x: 640, y: 300 },
        { id: 'dia_G', label: 'G', x: 310, y: 430 },
        { id: 'dia_H', label: 'H', x: 530, y: 430 },
      ],
      edges: [
        { id: 'de_A_B', source: 'dia_A', target: 'dia_B' },
        { id: 'de_A_C', source: 'dia_A', target: 'dia_C' },
        { id: 'de_B_D', source: 'dia_B', target: 'dia_D' },
        { id: 'de_B_E', source: 'dia_B', target: 'dia_E' },
        { id: 'de_C_E', source: 'dia_C', target: 'dia_E' },
        { id: 'de_C_F', source: 'dia_C', target: 'dia_F' },
        { id: 'de_D_G', source: 'dia_D', target: 'dia_G' },
        { id: 'de_E_G', source: 'dia_E', target: 'dia_G' },
        { id: 'de_E_H', source: 'dia_E', target: 'dia_H' },
        { id: 'de_F_H', source: 'dia_F', target: 'dia_H' },
        { id: 'de_G_H', source: 'dia_G', target: 'dia_H' },
      ]
    }
  },
  {
    id: 'disconnected-clusters',
    name: 'Disconnected Islands',
    description: 'Two isolated subgraphs to examine how traversals handle unreachable components.',
    isDirected: false,
    graph: {
      isDirected: false,
      nodes: [
        { id: 'isc_1', label: 'Island A1', x: 200, y: 140 },
        { id: 'isc_2', label: 'Island A2', x: 330, y: 100 },
        { id: 'isc_3', label: 'Island A3', x: 310, y: 250 },
        { id: 'isc_4', label: 'Island A4', x: 180, y: 270 },
        { id: 'isc_5', label: 'Island B1', x: 570, y: 140 },
        { id: 'isc_6', label: 'Island B2', x: 700, y: 180 },
        { id: 'isc_7', label: 'Island B3', x: 610, y: 310 },
      ],
      edges: [
        { id: 'ie_1_2', source: 'isc_1', target: 'isc_2' },
        { id: 'ie_2_3', source: 'isc_2', target: 'isc_3' },
        { id: 'ie_3_4', source: 'isc_3', target: 'isc_4' },
        { id: 'ie_4_1', source: 'isc_4', target: 'isc_1' },
        { id: 'ie_1_3', source: 'isc_1', target: 'isc_3' },
        { id: 'ie_5_6', source: 'isc_5', target: 'isc_6' },
        { id: 'ie_6_7', source: 'isc_6', target: 'isc_7' },
        { id: 'ie_7_5', source: 'isc_7', target: 'isc_5' },
      ]
    }
  },
  {
    id: 'petersen-graph',
    name: 'Petersen Graph (10 Nodes)',
    description: 'The celebrated Petersen graph with 10 vertices and 15 edges: an outer 5-cycle connected to an inner 5-star.',
    isDirected: false,
    graph: {
      isDirected: false,
      nodes: [
        // Outer 5-gon
        { id: 'pet_0', label: '0', x: 420, y: 70 },
        { id: 'pet_1', label: '1', x: 610, y: 190 },
        { id: 'pet_2', label: '2', x: 535, y: 400 },
        { id: 'pet_3', label: '3', x: 305, y: 400 },
        { id: 'pet_4', label: '4', x: 230, y: 190 },
        // Inner 5-star
        { id: 'pet_5', label: '5', x: 420, y: 160 },
        { id: 'pet_6', label: '6', x: 515, y: 220 },
        { id: 'pet_7', label: '7', x: 480, y: 320 },
        { id: 'pet_8', label: '8', x: 360, y: 320 },
        { id: 'pet_9', label: '9', x: 325, y: 220 },
      ],
      edges: [
        // Outer cycle
        { id: 'pe_0_1', source: 'pet_0', target: 'pet_1' },
        { id: 'pe_1_2', source: 'pet_1', target: 'pet_2' },
        { id: 'pe_2_3', source: 'pet_2', target: 'pet_3' },
        { id: 'pe_3_4', source: 'pet_3', target: 'pet_4' },
        { id: 'pe_4_0', source: 'pet_4', target: 'pet_0' },
        // Spokes
        { id: 'pe_0_5', source: 'pet_0', target: 'pet_5' },
        { id: 'pe_1_6', source: 'pet_1', target: 'pet_6' },
        { id: 'pe_2_7', source: 'pet_2', target: 'pet_7' },
        { id: 'pe_3_8', source: 'pet_3', target: 'pet_8' },
        { id: 'pe_4_9', source: 'pet_4', target: 'pet_9' },
        // Inner star (5-7, 7-9, 9-6, 6-8, 8-5)
        { id: 'pe_5_7', source: 'pet_5', target: 'pet_7' },
        { id: 'pe_7_9', source: 'pet_7', target: 'pet_9' },
        { id: 'pe_9_6', source: 'pet_9', target: 'pet_6' },
        { id: 'pe_6_8', source: 'pet_6', target: 'pet_8' },
        { id: 'pe_8_5', source: 'pet_8', target: 'pet_5' },
      ]
    }
  },
  {
    id: 'complete-k5',
    name: 'Complete Graph K5',
    description: 'Dense 5-node graph where every vertex connects to every other vertex — showcasing cross edges in BFS and dense recursion branches in DFS.',
    isDirected: false,
    graph: {
      isDirected: false,
      nodes: [
        { id: 'k5_A', label: 'A', x: 420, y: 80 },
        { id: 'k5_B', label: 'B', x: 600, y: 210 },
        { id: 'k5_C', label: 'C', x: 530, y: 410 },
        { id: 'k5_D', label: 'D', x: 310, y: 410 },
        { id: 'k5_E', label: 'E', x: 240, y: 210 },
      ],
      edges: [
        { id: 'k5_A_B', source: 'k5_A', target: 'k5_B' },
        { id: 'k5_A_C', source: 'k5_A', target: 'k5_C' },
        { id: 'k5_A_D', source: 'k5_A', target: 'k5_D' },
        { id: 'k5_A_E', source: 'k5_A', target: 'k5_E' },
        { id: 'k5_B_C', source: 'k5_B', target: 'k5_C' },
        { id: 'k5_B_D', source: 'k5_B', target: 'k5_D' },
        { id: 'k5_B_E', source: 'k5_B', target: 'k5_E' },
        { id: 'k5_C_D', source: 'k5_C', target: 'k5_D' },
        { id: 'k5_C_E', source: 'k5_C', target: 'k5_E' },
        { id: 'k5_D_E', source: 'k5_D', target: 'k5_E' },
      ]
    }
  }
];
