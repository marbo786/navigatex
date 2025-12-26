# DSA Project - Interactive Data Structures & Algorithms Visualization

A comprehensive project demonstrating core Data Structures and Algorithms through both C++ implementations and interactive web visualizations.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Data Structures & Algorithms](#data-structures--algorithms)
- [Technologies Used](#technologies-used)
- [Screenshots](#screenshots)

## 🎯 Overview

This project provides a dual implementation of essential Data Structures and Algorithms:
- **C++ Backend**: Clean, well-commented implementations with demonstration functions
- **Web Frontend**: Interactive visualizations using HTML, JavaScript, and visualization libraries

Perfect for learning, teaching, and understanding how DSA concepts work in practice.

## ✨ Features

- **7 Core Data Structures** implemented in C++
- **Interactive Web Visualizations** for each structure
- **Step-by-step Demonstrations** showing how algorithms work
- **Real-time Visual Feedback** in the web interface
- **Educational Comments** explaining time complexities and operations
- **Ready-to-run Examples** for each data structure

## 📁 Project Structure

```
project/
│
├── Navigate-X.cpp          # C++ implementations with demonstrations
├── index.html              # Web interface for visualizations
├── dsa-visualization.js    # JavaScript visualization logic
├── Navigate-X.exe          # Compiled C++ executable (Windows)
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- **For C++**: 
  - C++ compiler (GCC, Clang, or MSVC)
  - Windows/Linux/Mac OS

- **For Web Visualization**:
  - Modern web browser (Chrome, Firefox, Edge, Safari)
  - No server required - runs locally

### Compilation (C++)

#### Windows
```powershell
g++ Navigate-X.cpp -o Navigate-X.exe
.\Navigate-X.exe
```

#### Linux/Mac
```bash
g++ Navigate-X.cpp -o Navigate-X
./Navigate-X
```

### Running Web Visualization

1. Open `index.html` in your web browser
2. No installation or server setup required
3. All visualizations work interactively

## 💻 Usage

### C++ Demonstrations

Run the compiled executable to see all demonstrations:

```bash
./Navigate-X.exe
```

This will display:
- Hash Map operations
- Trie prefix matching
- Graph traversals (BFS, DFS, Dijkstra's)
- Linked List operations
- Queue operations
- AVL Tree operations
- Custom Hash Table operations

### Web Interface

1. Open `index.html` in your browser
2. Use the interactive controls to:
   - Add/remove elements
   - Visualize operations in real-time
   - See step-by-step algorithm execution
   - Explore different data structures

## 📊 Data Structures & Algorithms

### 1. Hash Map (unordered_map)
- **Operations**: Insert, Search, Delete
- **Time Complexity**: O(1) average
- **Use Case**: User storage and management
- **Visualization**: Hash buckets display

### 2. Trie (Prefix Tree)
- **Operations**: Insert, Prefix Search
- **Time Complexity**: O(m) where m is word length
- **Use Case**: Location auto-complete
- **Visualization**: Interactive tree with zoom/pan

### 3. Graph Algorithms
- **Dijkstra's Algorithm**: Shortest path finding
  - Time Complexity: O((V + E) log V)
- **BFS (Breadth-First Search)**: Level-order traversal
  - Time Complexity: O(V + E)
- **DFS (Depth-First Search)**: Deep traversal
  - Time Complexity: O(V + E)
- **Use Case**: Location network and routing
- **Visualization**: Interactive graph with drag-and-drop nodes

### 4. Linked List
- **Operations**: Insert, Delete, Reverse, Traverse
- **Time Complexity**: O(n) for most operations
- **Use Case**: Bus route management
- **Visualization**: Animated linked list display

### 5. Queue (FIFO)
- **Operations**: Enqueue, Dequeue, Process All
- **Time Complexity**: O(1) per operation
- **Use Case**: Traffic update processing
- **Visualization**: Queue display with front/rear indicators

### 6. AVL Tree
- **Operations**: Insert, Delete, Search, Inorder Traversal
- **Time Complexity**: O(log n) for all operations
- **Use Case**: Self-balancing binary search tree
- **Visualization**: Tree structure printing

### 7. Custom Hash Table
- **Operations**: Insert, Search, Delete, Rehash
- **Time Complexity**: O(1) average, O(n) worst case
- **Use Case**: Custom hash table with chaining
- **Visualization**: Hash table buckets with collision chains

## 🛠️ Technologies Used

### C++ Implementation
- **Language**: C++11/14
- **STL Libraries**: 
  - `<vector>`, `<queue>`, `<unordered_map>`
  - `<algorithm>`, `<string>`, `<limits>`

### Web Visualization
- **HTML5**: Structure and layout
- **JavaScript (ES6+)**: Core logic and algorithms
- **Bootstrap 5**: Responsive UI framework
- **D3.js**: Graph and tree visualizations
- **vis-network**: Interactive graph rendering
- **Font Awesome**: Icons

## 📸 Key Features

### C++ Code Features
- ✅ Clean, professional code structure
- ✅ Comprehensive comments and documentation
- ✅ Time complexity annotations
- ✅ Demonstration functions for each structure
- ✅ Visualization helpers (print functions)
- ✅ Error handling and validation

### Web Visualization Features
- ✅ Real-time visual updates
- ✅ Interactive controls (drag, zoom, pan)
- ✅ Toast notifications for user feedback
- ✅ Responsive design
- ✅ Color-coded visualizations
- ✅ Step-by-step algorithm highlighting

## 🎓 Educational Value

This project is ideal for:
- **Students** learning Data Structures and Algorithms
- **Educators** teaching DSA concepts
- **Developers** reviewing fundamental algorithms
- **Interview preparation** for technical interviews

## 📝 Example Usage

### C++ Example
```cpp
// Hash Map
UserSystem us;
us.addUser("U001", "Alice");
User* user = us.findUser("U001");

// Graph Algorithms
Graph g;
g.addLocation("Mumbai");
g.addLocation("Delhi");
g.addEdge("Mumbai", "Delhi", 1400);
vector<string> path;
int dist;
g.shortestPath("Mumbai", "Delhi", path, dist);

// AVL Tree
AVLTree tree;
tree.insert("Mumbai", 100);
int* value = tree.search("Mumbai");
```

### Web Interface
- Click "Add" buttons to insert elements
- Use search functions to find elements
- Watch real-time visualizations update
- See algorithm steps highlighted in color

## 🔧 Customization

### Adding New Algorithms
1. Implement in `Navigate-X.cpp`
2. Add visualization logic in `dsa-visualization.js`
3. Add UI controls in `index.html`

### Modifying Visualizations
- Edit `dsa-visualization.js` for visualization logic
- Modify `index.html` for UI changes
- Update CSS styles in `index.html` `<style>` section

## 📄 License

This project is created for educational purposes.

## 👤 Author

1: Mohsin Saeed
2: Ahmad Sajid
3: Muhammad Taha

## 🙏 Acknowledgments

- D3.js community for visualization library
- vis-network for graph visualization
- Bootstrap team for UI framework

## 📞 Support

For issues or questions:
1. Check the code comments for explanations
2. Review the demonstration functions
3. Examine the web console for JavaScript errors

---

**Happy Learning! 🚀**

