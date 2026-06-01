package main

import (
	"database/sql"
	"fmt"
	"log"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	dbPath := `D:\AI_LAB\Database\file_descriptions.db`

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Failed to open DB: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Database unreachable: %v", err)
	}

	fileName := filepath.Base("prompt_builder.js") // just filename

	var description string
	err = db.QueryRow(`SELECT description FROM file_descriptions WHERE file_name = ?`, fileName).Scan(&description)
	if err == sql.ErrNoRows {
		fmt.Printf("No description found for: %s\n", fileName)
		return
	}
	if err != nil {
		log.Fatalf("Query error: %v", err)
	}

	fmt.Printf("Description for %s: %s\n", fileName, description)
}
