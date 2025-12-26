// ===================================================================
// DSA PROJECT: Data Structures & Algorithms Implementation
// ===================================================================
// Core implementations demonstrating:
// 1. Hash Map (unordered_map) - O(1) operations
// 2. Trie (Prefix Tree) - O(m) prefix matching
// 3. Graph Algorithms - Dijkstra's, BFS, DFS - O(V+E) to O(V+E log V)
// 4. Linked List - O(n) operations
// 5. Queue (FIFO) - O(1) operations
// 6. AVL Tree - O(log n) balanced operations
// 7. Custom Hash Table - O(1) average with chaining
// ===================================================================

#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <unordered_map>
#include <algorithm>
#include <cctype>
#include <limits>

using namespace std;

const int INF = numeric_limits<int>::max();

string toLower(string s) {
    transform(s.begin(), s.end(), s.begin(), ::tolower);
    return s;
}

// ===================================================================
// HASH MAP - User Storage using unordered_map
// Time Complexity: O(1) average for all operations
// ===================================================================

class User {
public:
    string name;
    string id;
    
    User() : name(""), id("") {}
    User(string n, string i) : name(n), id(i) {}
};

class UserSystem {
private:
    unordered_map<string, User> users;

public:
    bool addUser(string id, string name) {
        if (users.find(id) != users.end()) {
            return false;
        }
        users[id] = User(name, id);
        return true;
    }

    User* findUser(string id) {
        auto it = users.find(id);
        return (it != users.end()) ? &it->second : nullptr;
    }

    bool removeUser(string id) {
        if (users.find(id) == users.end()) {
            return false;
        }
        users.erase(id);
        return true;
    }

    int size() { return users.size(); }
    bool isEmpty() { return users.empty(); }
};

// ===================================================================
// TRIE - Prefix Tree for Location Auto-Complete
// Time Complexity: O(m) insert/search where m is word length
// ===================================================================

class TrieNode {
public:
    bool isEnd;
    TrieNode* children[26];

    TrieNode() {
        isEnd = false;
        fill(begin(children), end(children), nullptr);
    }
};

class Trie {
private:
    TrieNode* root;

    int idx(char c) {
        if (isalpha(c)) {
            return tolower(c) - 'a';
        }
        return -1;
    }

    void collectAll(TrieNode* node, string prefix, vector<string> &out) {
        if (!node) return;
        
        if (node->isEnd) {
            out.push_back(prefix);
        }

        for (int i = 0; i < 26; i++) {
            if (node->children[i]) {
                collectAll(node->children[i], prefix + char('a' + i), out);
            }
        }
    }

    void destroyTrie(TrieNode* node) {
        if (!node) return;
        for (int i = 0; i < 26; i++) {
            if (node->children[i]) {
                destroyTrie(node->children[i]);
            }
        }
        delete node;
    }

public:
    Trie() {
        root = new TrieNode();
    }

    ~Trie() {
        destroyTrie(root);
    }

    void insert(const string &word) {
        TrieNode* cur = root;
        
        for (char c : word) {
            int i = idx(c);
            if (i == -1) continue;

            if (!cur->children[i]) {
                cur->children[i] = new TrieNode();
            }
            cur = cur->children[i];
        }
        
        cur->isEnd = true;
    }

    vector<string> suggest(const string &prefix) {
        TrieNode* cur = root;
        string p;

        for (char c : prefix) {
            int i = idx(c);
            if (i == -1) continue;

            if (!cur->children[i]) {
                return {};
            }
            
            cur = cur->children[i];
            p.push_back(tolower(c));
        }

        vector<string> out;
        collectAll(cur, p, out);
        return out;
    }
};

// ===================================================================
// GRAPH - Adjacency List with Dijkstra's, BFS, DFS
// Time Complexity: Dijkstra's O((V+E)log V), BFS/DFS O(V+E)
// ===================================================================

class Graph {
private:
    unordered_map<string, int> nameToNode;
    vector<string> nodeToName;
    vector<vector<pair<int, int>>> adj;

    void DFSHelper(int u, vector<bool> &visited, vector<string> &result) {
        visited[u] = true;
        result.push_back(nodeToName[u]);
        
        for (auto &edge : adj[u]) {
            int v = edge.first;
            if (!visited[v]) {
                DFSHelper(v, visited, result);
            }
        }
    }

public:
    Graph() {}

    int addLocation(string name) {
        string normalized = toLower(name);
        
        for (auto& pair : nameToNode) {
            if (toLower(pair.first) == normalized) {
                return pair.second;
            }
        }
        
        int id = nodeToName.size();
        nameToNode[name] = id;
        nodeToName.push_back(name);
        adj.push_back({});
        
        return id;
    }

    void addEdge(string uName, string vName, int w) {
        int u = addLocation(uName);
        int v = addLocation(vName);
        
        for (auto& edge : adj[u]) {
            if (edge.first == v) {
                edge.second = w;
                for (auto& revEdge : adj[v]) {
                    if (revEdge.first == u) {
                        revEdge.second = w;
                        break;
                    }
                }
                return;
            }
        }
        
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    bool hasLocation(string name) {
        string normalized = toLower(name);
        for (auto& pair : nameToNode) {
            if (toLower(pair.first) == normalized) {
                return true;
            }
        }
        return false;
    }

    string getActualLocationName(string name) {
        string normalized = toLower(name);
        for (auto& pair : nameToNode) {
            if (toLower(pair.first) == normalized) {
                return pair.first;
            }
        }
        return name;
    }

    bool shortestPath(string srcName, string destName, vector<string> &pathOut, int &distOut) {
        pathOut.clear();
        distOut = INF;

        srcName = getActualLocationName(srcName);
        destName = getActualLocationName(destName);

        if (!hasLocation(srcName) || !hasLocation(destName)) {
            return false;
        }

        int n = nodeToName.size();
        vector<int> dist(n, INF);
        vector<int> parent(n, -1);
        vector<bool> visited(n, false);

        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;

        int s = nameToNode[srcName];
        int t = nameToNode[destName];

        dist[s] = 0;
        pq.push({0, s});

        while (!pq.empty()) {
            auto cur = pq.top();
            pq.pop();
            int u = cur.second;

            if (visited[u]) continue;
            visited[u] = true;

            for (auto &edge : adj[u]) {
                int v = edge.first;
                int w = edge.second;

                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    parent[v] = u;
                    pq.push({dist[v], v});
                }
            }
        }

        if (dist[t] == INF) {
            return false;
        }

        int cur = t;
        while (cur != -1) {
            if (!nodeToName[cur].empty()) {
                pathOut.push_back(nodeToName[cur]);
            }
            cur = parent[cur];
        }

        reverse(pathOut.begin(), pathOut.end());
        distOut = dist[t];
        
        return true;
    }

    vector<string> BFS(string startName) {
        vector<string> result;
        if (!hasLocation(startName)) {
            return result;
        }

        startName = getActualLocationName(startName);
        int start = nameToNode[startName];
        int n = nodeToName.size();
        
        vector<bool> visited(n, false);
        queue<int> q;
        
        visited[start] = true;
        q.push(start);
        
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            result.push_back(nodeToName[u]);
            
            for (auto &edge : adj[u]) {
                int v = edge.first;
                if (!visited[v]) {
                    visited[v] = true;
                    q.push(v);
                }
            }
        }
        
        return result;
    }

    vector<string> DFS(string startName) {
        vector<string> result;
        if (!hasLocation(startName)) {
            return result;
        }

        startName = getActualLocationName(startName);
        int start = nameToNode[startName];
        int n = nodeToName.size();
        
        vector<bool> visited(n, false);
        DFSHelper(start, visited, result);
        
        return result;
    }

    bool isConnected() {
        if (nodeToName.empty()) return true;
        
        int n = nodeToName.size();
        vector<bool> visited(n, false);
        queue<int> q;
        
        visited[0] = true;
        q.push(0);
        
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            
            for (auto &edge : adj[u]) {
                int v = edge.first;
                if (!visited[v]) {
                    visited[v] = true;
                    q.push(v);
                }
            }
        }
        
        for (bool v : visited) {
            if (!v) return false;
        }
        return true;
    }

    int getNodeCount() { return nodeToName.size(); }
    int getEdgeCount() {
        int count = 0;
        for (auto& edges : adj) {
            count += edges.size();
        }
        return count / 2;
    }
};

// ===================================================================
// LINKED LIST - Bus Route Management
// Time Complexity: O(n) for insert/delete/reverse
// ===================================================================

struct Stop {
    string name;
    Stop* next;
    
    Stop(string n) : name(n), next(nullptr) {}
};

class BusRoute {
public:
    string routeName;
    Stop* head;

    BusRoute() : head(nullptr) {}
    BusRoute(string rn) : routeName(rn), head(nullptr) {}

    ~BusRoute() {
        while (head) {
            Stop* tmp = head;
            head = head->next;
            delete tmp;
        }
    }

    void addStop(string n) {
        Stop* node = new Stop(n);
        
        if (!head) {
            head = node;
            return;
        }

        Stop* cur = head;
        while (cur->next) {
            cur = cur->next;
        }
        cur->next = node;
    }

    bool deleteStop(string n) {
        if (!head) return false;
        
        if (head->name == n) {
            Stop* tmp = head;
            head = head->next;
            delete tmp;
            return true;
        }

        Stop* cur = head;
        while (cur->next && cur->next->name != n) {
            cur = cur->next;
        }

        if (!cur->next) return false;

        Stop* tmp = cur->next;
        cur->next = tmp->next;
        delete tmp;
        return true;
    }

    void reverseRoute() {
        Stop* prev = nullptr;
        Stop* cur = head;

        while (cur) {
            Stop* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }

        head = prev;
    }

    vector<string> getStopsVector() {
        vector<string> v;
        Stop* cur = head;
        while (cur) {
            v.push_back(cur->name);
            cur = cur->next;
        }
        return v;
    }

    int size() {
        int count = 0;
        Stop* cur = head;
        while (cur) {
            count++;
            cur = cur->next;
        }
        return count;
    }
};

class BusRouteManager {
private:
    unordered_map<string, BusRoute> routes;

public:
    bool addRoute(string rn) {
        if (routes.find(rn) != routes.end()) {
            return false;
        }
        routes[rn] = BusRoute(rn);
        return true;
    }

    bool addStopToRoute(string rn, string s) {
        if (routes.find(rn) == routes.end()) {
            return false;
        }
        routes[rn].addStop(s);
        return true;
    }

    bool deleteStopFromRoute(string rn, string s) {
        if (routes.find(rn) == routes.end()) {
            return false;
        }
        return routes[rn].deleteStop(s);
    }

    bool deleteRoute(string rn) {
        if (routes.find(rn) == routes.end()) {
            return false;
        }
        routes.erase(rn);
        return true;
    }

    bool reverseRoute(string rn) {
        if (routes.find(rn) == routes.end()) {
            return false;
        }
        routes[rn].reverseRoute();
        return true;
    }

    vector<string> getAllRouteNames() {
        vector<string> names;
        for (auto& pair : routes) {
            names.push_back(pair.first);
        }
        return names;
    }

    vector<string> getRouteStops(string rn) {
        if (routes.find(rn) == routes.end()) {
            return {};
        }
        return routes[rn].getStopsVector();
    }
};

// ===================================================================
// QUEUE - FIFO Data Structure for Traffic Updates
// Time Complexity: O(1) for enqueue/dequeue
// ===================================================================

enum TrafficLevel { LOW=1, MEDIUM=2, HIGH=3 };

struct TrafficUpdate {
    string routeName;
    TrafficLevel level;
    
    TrafficUpdate(string r="", TrafficLevel l=LOW) : routeName(r), level(l) {}
};

class TrafficManager {
private:
    queue<TrafficUpdate> updates;
    unordered_map<string, TrafficLevel> currentTraffic;

public:
    void pushUpdate(TrafficUpdate u) {
        updates.push(u);
    }

    int processUpdates() {
        int count = 0;
        while (!updates.empty()) {
            TrafficUpdate u = updates.front();
            updates.pop();
            currentTraffic[u.routeName] = u.level;
            count++;
        }
        return count;
    }

    int queueSize() { return updates.size(); }
    bool isEmpty() { return updates.empty(); }
};

// ===================================================================
// AVL TREE - Self-Balancing Binary Search Tree
// Time Complexity: O(log n) for all operations
// ===================================================================

struct AVLNode {
    string key;
    int value;
    AVLNode* left;
    AVLNode* right;
    int height;
    
    AVLNode(string k, int v) : key(k), value(v), left(nullptr), right(nullptr), height(1) {}
};

class AVLTree {
private:
    AVLNode* root;
    
    int getHeight(AVLNode* node) {
        return node ? node->height : 0;
    }
    
    int getBalance(AVLNode* node) {
        return node ? getHeight(node->left) - getHeight(node->right) : 0;
    }
    
    AVLNode* rightRotate(AVLNode* y) {
        AVLNode* x = y->left;
        AVLNode* T2 = x->right;
        
        x->right = y;
        y->left = T2;
        
        y->height = max(getHeight(y->left), getHeight(y->right)) + 1;
        x->height = max(getHeight(x->left), getHeight(x->right)) + 1;
        
        return x;
    }
    
    AVLNode* leftRotate(AVLNode* x) {
        AVLNode* y = x->right;
        AVLNode* T2 = y->left;
        
        y->left = x;
        x->right = T2;
        
        x->height = max(getHeight(x->left), getHeight(x->right)) + 1;
        y->height = max(getHeight(y->left), getHeight(y->right)) + 1;
        
        return y;
    }
    
    AVLNode* insertHelper(AVLNode* node, string key, int value) {
        if (!node) {
            return new AVLNode(key, value);
        }
        
        if (key < node->key) {
            node->left = insertHelper(node->left, key, value);
        } else if (key > node->key) {
            node->right = insertHelper(node->right, key, value);
        } else {
            node->value = value;
            return node;
        }
        
        node->height = 1 + max(getHeight(node->left), getHeight(node->right));
        int balance = getBalance(node);
        
        if (balance > 1 && key < node->left->key) {
            return rightRotate(node);
        }
        
        if (balance < -1 && key > node->right->key) {
            return leftRotate(node);
        }
        
        if (balance > 1 && key > node->left->key) {
            node->left = leftRotate(node->left);
            return rightRotate(node);
        }
        
        if (balance < -1 && key < node->right->key) {
            node->right = rightRotate(node->right);
            return leftRotate(node);
        }
        
        return node;
    }
    
    AVLNode* minValueNode(AVLNode* node) {
        AVLNode* current = node;
        while (current->left) {
            current = current->left;
        }
        return current;
    }
    
    AVLNode* deleteHelper(AVLNode* node, string key) {
        if (!node) return node;
        
        if (key < node->key) {
            node->left = deleteHelper(node->left, key);
        } else if (key > node->key) {
            node->right = deleteHelper(node->right, key);
        } else {
            if (!node->left || !node->right) {
                AVLNode* temp = node->left ? node->left : node->right;
                
                if (!temp) {
                    temp = node;
                    node = nullptr;
                } else {
                    *node = *temp;
                }
                delete temp;
            } else {
                AVLNode* temp = minValueNode(node->right);
                node->key = temp->key;
                node->value = temp->value;
                node->right = deleteHelper(node->right, temp->key);
            }
        }
        
        if (!node) return node;
        
        node->height = 1 + max(getHeight(node->left), getHeight(node->right));
        int balance = getBalance(node);
        
        if (balance > 1 && getBalance(node->left) >= 0) {
            return rightRotate(node);
        }
        
        if (balance > 1 && getBalance(node->left) < 0) {
            node->left = leftRotate(node->left);
            return rightRotate(node);
        }
        
        if (balance < -1 && getBalance(node->right) <= 0) {
            return leftRotate(node);
        }
        
        if (balance < -1 && getBalance(node->right) > 0) {
            node->right = rightRotate(node->right);
            return leftRotate(node);
        }
        
        return node;
    }
    
    AVLNode* searchHelper(AVLNode* node, string key) {
        if (!node || node->key == key) {
            return node;
        }
        
        if (key < node->key) {
            return searchHelper(node->left, key);
        }
        
        return searchHelper(node->right, key);
    }
    
    void inorderHelper(AVLNode* node, vector<pair<string, int>> &result) {
        if (node) {
            inorderHelper(node->left, result);
            result.push_back({node->key, node->value});
            inorderHelper(node->right, result);
        }
    }
    
    void destroyTree(AVLNode* node) {
        if (node) {
            destroyTree(node->left);
            destroyTree(node->right);
            delete node;
        }
    }

    void printTreeHelper(AVLNode* node, int indent = 0) {
        if (node) {
            printTreeHelper(node->right, indent + 4);
            for (int i = 0; i < indent; i++) cout << " ";
            cout << node->key << "(" << node->value << ")" << endl;
            printTreeHelper(node->left, indent + 4);
        }
    }

public:
    AVLTree() : root(nullptr) {}
    
    ~AVLTree() {
        destroyTree(root);
    }
    
    void insert(string key, int value) {
        root = insertHelper(root, key, value);
    }
    
    bool remove(string key) {
        if (!search(key)) return false;
        root = deleteHelper(root, key);
        return true;
    }
    
    int* search(string key) {
        AVLNode* node = searchHelper(root, key);
        return node ? &node->value : nullptr;
    }
    
    vector<pair<string, int>> inorderTraversal() {
        vector<pair<string, int>> result;
        inorderHelper(root, result);
        return result;
    }
    
    bool isEmpty() {
        return root == nullptr;
    }

    void printTree() {
        if (root) {
            printTreeHelper(root);
        } else {
            cout << "(Empty tree)" << endl;
        }
    }
};

// ===================================================================
// CUSTOM HASH TABLE - Hash Table with Chaining
// Time Complexity: O(1) average, O(n) worst case
// ===================================================================

struct HashNode {
    string key;
    int value;
    HashNode* next;
    
    HashNode(string k, int v) : key(k), value(v), next(nullptr) {}
};

class CustomHashTable {
private:
    vector<HashNode*> table;
    int capacity;
    int size;
    const double LOAD_FACTOR_THRESHOLD = 0.75;
    
    int hashFunction(string key) {
        unsigned long hash = 5381;
        for (char c : key) {
            hash = ((hash << 5) + hash) + c;
        }
        return hash % capacity;
    }
    
    void rehash() {
        int oldCapacity = capacity;
        capacity *= 2;
        vector<HashNode*> newTable(capacity, nullptr);
        
        for (int i = 0; i < oldCapacity; i++) {
            HashNode* node = table[i];
            while (node) {
                HashNode* next = node->next;
                int newIndex = hashFunction(node->key);
                node->next = newTable[newIndex];
                newTable[newIndex] = node;
                node = next;
            }
        }
        
        table = newTable;
    }

public:
    CustomHashTable(int initialCapacity = 16) : capacity(initialCapacity), size(0) {
        table.resize(capacity, nullptr);
    }
    
    ~CustomHashTable() {
        for (int i = 0; i < capacity; i++) {
            HashNode* node = table[i];
            while (node) {
                HashNode* next = node->next;
                delete node;
                node = next;
            }
        }
    }
    
    bool insert(string key, int value) {
        int* existing = search(key);
        if (existing) {
            *existing = value;
            return false;
        }
        
        if ((double)size / capacity >= LOAD_FACTOR_THRESHOLD) {
            rehash();
        }
        
        int index = hashFunction(key);
        HashNode* newNode = new HashNode(key, value);
        newNode->next = table[index];
        table[index] = newNode;
        size++;
        
        return true;
    }
    
    int* search(string key) {
        int index = hashFunction(key);
        HashNode* node = table[index];
        
        while (node) {
            if (node->key == key) {
                return &node->value;
            }
            node = node->next;
        }
        
        return nullptr;
    }
    
    bool remove(string key) {
        int index = hashFunction(key);
        HashNode* node = table[index];
        HashNode* prev = nullptr;
        
        while (node) {
            if (node->key == key) {
                if (prev) {
                    prev->next = node->next;
                } else {
                    table[index] = node->next;
                }
                delete node;
                size--;
                return true;
            }
            prev = node;
            node = node->next;
        }
        
        return false;
    }
    
    int getSize() { return size; }
    int getCapacity() { return capacity; }
    double getLoadFactor() { return (double)size / capacity; }
    bool isEmpty() { return size == 0; }
    
    vector<pair<string, int>> getAllEntries() {
        vector<pair<string, int>> result;
        for (int i = 0; i < capacity; i++) {
            HashNode* node = table[i];
            while (node) {
                result.push_back({node->key, node->value});
                node = node->next;
            }
        }
        return result;
    }

    void printTable() {
        cout << "Hash Table (Size: " << size << ", Capacity: " << capacity 
             << ", Load Factor: " << getLoadFactor() << ")" << endl;
        for (int i = 0; i < capacity; i++) {
            if (table[i]) {
                cout << "Bucket " << i << ": ";
                HashNode* node = table[i];
                while (node) {
                    cout << "[" << node->key << ":" << node->value << "]";
                    if (node->next) cout << " -> ";
                    node = node->next;
                }
                cout << endl;
            }
        }
    }
};

// ===================================================================
// DEMONSTRATION & VISUALIZATION FUNCTIONS
// ===================================================================

void printVector(const vector<string>& vec, const string& label = "") {
    if (!label.empty()) cout << label << ": ";
    for (size_t i = 0; i < vec.size(); i++) {
        cout << vec[i];
        if (i < vec.size() - 1) cout << " -> ";
    }
    cout << endl;
}

void printPath(const vector<string>& path, int distance) {
    cout << "Path: ";
    printVector(path);
    cout << "Distance: " << distance << endl;
}

void demonstrateHashMap() {
    cout << "\n=== HASH MAP DEMONSTRATION ===" << endl;
    UserSystem us;
    
    us.addUser("U001", "Alice");
    us.addUser("U002", "Bob");
    us.addUser("U003", "Charlie");
    
    cout << "Added 3 users" << endl;
    cout << "Total users: " << us.size() << endl;
    
    User* found = us.findUser("U002");
    if (found) {
        cout << "Found user: " << found->name << endl;
    }
    
    us.removeUser("U001");
    cout << "After removal, total users: " << us.size() << endl;
}

void demonstrateTrie() {
    cout << "\n=== TRIE DEMONSTRATION ===" << endl;
    Trie trie;
    
    trie.insert("Mumbai");
    trie.insert("Delhi");
    trie.insert("Bangalore");
    trie.insert("Chennai");
    trie.insert("Mysore");
    
    cout << "Inserted: Mumbai, Delhi, Bangalore, Chennai, Mysore" << endl;
    
    vector<string> suggestions = trie.suggest("M");
    cout << "Suggestions for 'M': ";
    printVector(suggestions);
    
    suggestions = trie.suggest("Ban");
    cout << "Suggestions for 'Ban': ";
    printVector(suggestions);
}

void demonstrateGraph() {
    cout << "\n=== GRAPH DEMONSTRATION ===" << endl;
    Graph g;
    
    g.addLocation("Mumbai");
    g.addLocation("Delhi");
    g.addLocation("Bangalore");
    g.addLocation("Chennai");
    
    g.addEdge("Mumbai", "Delhi", 1400);
    g.addEdge("Mumbai", "Bangalore", 850);
    g.addEdge("Delhi", "Bangalore", 2150);
    g.addEdge("Bangalore", "Chennai", 350);
    
    cout << "Graph: " << g.getNodeCount() << " nodes, " << g.getEdgeCount() << " edges" << endl;
    
    vector<string> bfs = g.BFS("Mumbai");
    cout << "BFS from Mumbai: ";
    printVector(bfs);
    
    vector<string> dfs = g.DFS("Mumbai");
    cout << "DFS from Mumbai: ";
    printVector(dfs);
    
    vector<string> path;
    int dist;
    if (g.shortestPath("Mumbai", "Chennai", path, dist)) {
        cout << "Shortest path (Dijkstra's): ";
        printPath(path, dist);
    }
}

void demonstrateLinkedList() {
    cout << "\n=== LINKED LIST DEMONSTRATION ===" << endl;
    BusRouteManager brm;
    
    brm.addRoute("Route101");
    brm.addStopToRoute("Route101", "Stop1");
    brm.addStopToRoute("Route101", "Stop2");
    brm.addStopToRoute("Route101", "Stop3");
    
    vector<string> stops = brm.getRouteStops("Route101");
    cout << "Route stops: ";
    printVector(stops);
    
    brm.reverseRoute("Route101");
    stops = brm.getRouteStops("Route101");
    cout << "After reverse: ";
    printVector(stops);
}

void demonstrateQueue() {
    cout << "\n=== QUEUE DEMONSTRATION ===" << endl;
    TrafficManager tm;
    
    tm.pushUpdate(TrafficUpdate("Route1", HIGH));
    tm.pushUpdate(TrafficUpdate("Route2", MEDIUM));
    tm.pushUpdate(TrafficUpdate("Route3", LOW));
    
    cout << "Queue size: " << tm.queueSize() << endl;
    int processed = tm.processUpdates();
    cout << "Processed " << processed << " updates" << endl;
    cout << "Queue empty: " << (tm.isEmpty() ? "Yes" : "No") << endl;
}

void demonstrateAVLTree() {
    cout << "\n=== AVL TREE DEMONSTRATION ===" << endl;
    AVLTree tree;
    
    tree.insert("Mumbai", 100);
    tree.insert("Delhi", 200);
    tree.insert("Bangalore", 300);
    tree.insert("Chennai", 400);
    tree.insert("Kolkata", 500);
    
    cout << "Inserted 5 locations" << endl;
    cout << "Tree structure:" << endl;
    tree.printTree();
    
    vector<pair<string, int>> sorted = tree.inorderTraversal();
    cout << "Inorder traversal (sorted): ";
    for (auto& p : sorted) {
        cout << p.first << "(" << p.second << ") ";
    }
    cout << endl;
    
    int* value = tree.search("Bangalore");
    if (value) {
        cout << "Found Bangalore: " << *value << endl;
    }
}

void demonstrateCustomHashTable() {
    cout << "\n=== CUSTOM HASH TABLE DEMONSTRATION ===" << endl;
    CustomHashTable ht(8);
    
    ht.insert("Mumbai", 100);
    ht.insert("Delhi", 200);
    ht.insert("Bangalore", 300);
    ht.insert("Chennai", 400);
    
    cout << "Inserted 4 entries" << endl;
    ht.printTable();
    
    int* value = ht.search("Delhi");
    if (value) {
        cout << "Found Delhi: " << *value << endl;
    }
    
    ht.remove("Chennai");
    cout << "\nAfter removing Chennai:" << endl;
    ht.printTable();
}

// ===================================================================
// MAIN DEMONSTRATION FUNCTION
// ===================================================================

void runAllDemonstrations() {
    cout << "========================================" << endl;
    cout << "  DSA IMPLEMENTATIONS DEMONSTRATION" << endl;
    cout << "========================================" << endl;
    
    demonstrateHashMap();
    demonstrateTrie();
    demonstrateGraph();
    demonstrateLinkedList();
    demonstrateQueue();
    demonstrateAVLTree();
    demonstrateCustomHashTable();
    
    cout << "\n========================================" << endl;
    cout << "  DEMONSTRATION COMPLETE" << endl;
    cout << "========================================" << endl;
}

// ===================================================================
// MAIN FUNCTION
// ===================================================================

int main() {
    runAllDemonstrations();
    return 0;
}
