package main
import "regexp"
import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "os/exec"
    "strings"
)

// FileNode represents a folder or file in the tree
type FileNode struct {
    Name     string              `json:"name"`
    Path     string              `json:"path"`
    IsFolder bool                `json:"isFolder"`
    Children []*FileNode         `json:"children,omitempty"`
    Def      string              `json:"definition,omitempty"`
}
var asciiTreeChars = regexp.MustCompile(`[├└│─ ]+`)
// runStructureUpdater executes your Python script to refresh file_tree.txt
func runStructureUpdater() error {
    cmd := exec.Command("python", "D:\\AI_LAB\\Utility\\structure.py")
    return cmd.Run()
}

// parseFileTree reads file_tree.txt and builds a nested structure
func parseFileTree() *FileNode {
    data, _ := ioutil.ReadFile("D:\\AI_LAB\\Structure\\file_tree.txt")
    lines := strings.Split(string(data), "\n")

    root := &FileNode{Name: "root", Path: "", IsFolder: true}
    stack := []*FileNode{root}

    for _, line := range lines {
        if strings.TrimSpace(line) == "" {
            continue
        }
        depth := strings.Count(line, "│") + strings.Count(line, "    ")
// Clean line from ASCII tree symbols
cleanName := asciiTreeChars.ReplaceAllString(line, "")
cleanName = strings.TrimSpace(cleanName)

isFolder := strings.HasSuffix(cleanName, "/")

// adjust stack depth
if depth < len(stack) {
    stack = stack[:depth+1]
}
parent := stack[len(stack)-1]

node := &FileNode{
    Name:     cleanName,
    Path:     strings.TrimRight(parent.Path, "/") + "/" + cleanName,
    IsFolder: isFolder,
}

parent.Children = append(parent.Children, node)


        if isFolder {
            stack = append(stack, node)
        }
    }
    return root
}

// definitions map (you can extend this manually or auto-generate)
var definitions = map[string]string{
    "chat_ui.js":             "Main chat interface logic",
    "editApprovalButtons.js": "Renders Accept/Reject buttons under AI edit proposals",
    "validation_runner.js":   "Runs validation container IPC bridge",
    "tool_executor.js":       "Executes AI tool calls",
}

// /tree endpoint
func treeHandler(w http.ResponseWriter, r *http.Request) {
    tree := parseFileTree()
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(tree)
}

// /definition endpoint
func definitionHandler(w http.ResponseWriter, r *http.Request) {
    path := r.URL.Query().Get("path")
    def := definitions[path]
    if def == "" {
        def = "No description available"
    }

    resp := map[string]string{
        "file":       path,
        "location":   path,   // use the path string directly
        "definition": def,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
}


func main() {
    // Step 1: update file_tree.txt
    if err := runStructureUpdater(); err != nil {
        fmt.Println("Updater failed:", err)
    }

    // Step 2: start HTTP server
    http.HandleFunc("/tree", treeHandler)
    http.HandleFunc("/definition", definitionHandler)

    fmt.Println("Server running at http://localhost:3000")
    http.Handle("/", http.FileServer(http.Dir("D:\\AI_LAB\\Utility\\FileTree_Endpoint")))
    http.ListenAndServe(":3000", nil)
}
