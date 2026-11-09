const { app, BrowserWindow, ipcMain } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs/promises");
const { execFile } = require("child_process");
let win;
let developMode = false;
const FILE_TREE_EXCLUDED_ITEMS = new Set([
  "venv",
  "node_modules",
  ".git",
  "__pycache__",
  "package-lock.json",
  ".gitignore",
  ".editorconfig"
]);

async function buildProjectFileTree(directory, prefix = "") {
  const entries = (await fs.readdir(directory, { withFileTypes: true }))
    .filter(entry => !FILE_TREE_EXCLUDED_ITEMS.has(entry.name.toLowerCase()))
    .sort((left, right) => left.name.localeCompare(right.name));

  let tree = "";

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const isLast = index === entries.length - 1;
    const connector = isLast ? "└── " : "├── ";

    tree += `${prefix}${connector}${entry.name}${entry.isDirectory() ? "/" : ""}\n`;

    if (entry.isDirectory()) {
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      tree += await buildProjectFileTree(
        path.join(directory, entry.name),
        childPrefix
      );
    }
  }

  return tree;
}

// Initialize database
const dbPath = path.join(__dirname, "Database", "log_events.db");
const db = new sqlite3.Database(dbPath);
// Initialize schema
db.run(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    type TEXT,
    event TEXT,
    details TEXT
  )
`);
function createWindow() {
  win = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });
  win.loadFile("Bone_Code/html/index.html");
}
// IPC Handlers for logging
ipcMain.handle("enable-develop-mode", () => {
  developMode = true;
  return { success: true, mode: developMode };
});
ipcMain.handle("disable-develop-mode", () => {
  developMode = false;
  return { success: true, mode: developMode };
});
ipcMain.handle("get-develop-mode", () => {
  return developMode;
});
ipcMain.handle("get-project-file-tree", async () => {
  try {
    const tree = await buildProjectFileTree(__dirname);
    const treePath = path.join(__dirname, "Structure", "file_tree.txt");
    await fs.mkdir(path.dirname(treePath), { recursive: true });
    await fs.writeFile(treePath, tree, "utf8");
    return tree;
  } catch (error) {
    console.error(
      "Project file tree generation failed:",
      error.message || error
    );
    throw new Error(
      `Unable to generate the project file tree: ${error.message || error}`
    );
  }
});
ipcMain.handle("add-log", (event, entry) => {
  if (!developMode) return;
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: entry.type || "info",
    event: entry.event || "",
    details: JSON.stringify(entry.details || {})
  };
  return new Promise((resolve) => {
    db.run(
      `INSERT INTO logs (timestamp, type, event, details) VALUES (?, ?, ?, ?)`,
      [logEntry.timestamp, logEntry.type, logEntry.event, logEntry.details],
      function(err) {
        if (err) {
          console.error("Log insert failed:", err);
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true });
        }
      }
    );
  });
});
ipcMain.handle("get-logs", (event, limit = 3) => {
  return new Promise((resolve) => {
    db.all(
      "SELECT * FROM logs ORDER BY id DESC LIMIT ?",
      [limit],
      (err, rows) => {
        if (err) {
          console.error("Log retrieval failed:", err);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
});

ipcMain.handle("list-sandbox-files", async () => {
    return [
        "sample.py",
        "sample.java",
        "sample.go",
        "sample.rb"
    ];
});

ipcMain.handle("synchronize-project-files", async () => {
    return new Promise((resolve, reject) => {
        execFile(
            "python",
            ["Tools/docker_testing.py", "sync"],
            {
                cwd: __dirname,
                windowsHide: true
            },
            (error, stdout, stderr) => {
                if (error) {
                    console.error(
                        "Project synchronization failed:",
                        stderr || error.message
                    );

                    reject(
                        new Error("Project synchronization failed")
                    );
                    return;
                }

                resolve(stdout.trim());
            }
        );
    });
});

ipcMain.handle("read-sandbox-file", async (event, filename) => {
    // Validate the relative project path.
    if (
        typeof filename !== "string" ||
        !filename.trim()
    ) {
        throw new Error("Invalid filename");
    }

    const normalizedPath = filename.replace(/\\/g, "/");

    if (
        normalizedPath.startsWith("/") ||
        /^[a-zA-Z]:/.test(normalizedPath) ||
        normalizedPath.split("/").some(
            part => part === ".." || part === ""
        )
    ) {
        throw new Error("Access denied");
    }

    return new Promise((resolve) => {
        execFile(
            "python",
            [
                "Tools/docker_testing.py",
                "read",
                normalizedPath
            ],
            {
                cwd: __dirname,
                windowsHide: true
            },
            (error, stdout, stderr) => {
                if (error) {
                    console.error(
                        "Docker retrieval error:",
                        stderr || error.message
                    );

                    resolve(
                        "ERROR: Sandbox not available"
                    );
                    return;
                }

                if (
                    !stdout ||
                    stdout.trim().length === 0
                ) {
                    resolve(
                        "ERROR: Sandbox not available"
                    );
                    return;
                }

                resolve(stdout);
            }
        );
    });
});

ipcMain.handle(
  "start-validation-container",
  async (event, payload) => {

    return new Promise((resolve) => {

      execFile(
        "python",
        [
          "Tools/Docker_Tools/validation_container.py",
          "start",
          JSON.stringify(payload)
        ],
        (error, stdout, stderr) => {

          if (error) {
            resolve({
              success: false,
              status: "failed",
              logs: [],
              errors: [
                stderr ||
                error.message
              ]
            });

            return;
          }

          try {
            resolve(
              JSON.parse(stdout)
            );
          } catch {
            resolve({
              success: false,
              status: "failed",
              logs: [],
              errors: [
                "Invalid validation response"
              ]
            });
          }
        }
      );
    });
  }
);

ipcMain.handle(
  "stop-validation-container",
  async (
    event,
    containerId
  ) => {

    return new Promise((resolve) => {

      execFile(
        "python",
        [
          "Tools/Docker_Tools/validation_container.py",
          "stop",
          containerId
        ],
        (error, stdout) => {

          if (error) {
            resolve({
              success: false,
              status: "failed"
            });

            return;
          }

          try {
            resolve(
              JSON.parse(stdout)
            );
          } catch {
            resolve({
              success: false,
              status: "failed"
            });
          }
        }
      );
    });
  }
);

ipcMain.handle(
  "save-patched-file",
  async (event, payload) => {

    const fs =
      require("fs/promises");

    try {
      const allowedFiles = [
        "sample.py",
        "sample.java",
        "sample.go",
        "sample.rb"
      ];

      if (
        !allowedFiles.includes(
          payload.file
        )
      ) {
        throw new Error(
          "Access denied"
        );
      }

      const targetPath =
        path.join(
          "D:\\AI_LAB\\Test\\Docker-Testing",
          payload.file
        );

      await fs.writeFile(
        targetPath,
        payload.content,
        "utf8"
      );

      return {
        success: true,
        file:
          payload.file,
        status: "saved"
      };

    } catch (err) {

      return {
        success: false,
        error:
          err.message ||
          String(err),
        status: "failed"
      };
    }
  }
);

app.commandLine.appendSwitch("remote-debugging-port", "9222");

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (db) db.close();
  app.quit();
});