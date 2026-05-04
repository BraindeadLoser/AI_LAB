package main

import (
	"database/sql"
	"fmt"
	"log"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type LogEntry struct {
	ID        int
	Timestamp string
	Type      string
	Event     string
	Details   string
}

func getLastThreeEntries() ([]LogEntry, error) {
	dbPath := filepath.Join(".", "log_events.db")
	
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	query := `
		SELECT id, timestamp, type, event, details 
		FROM logs 
		ORDER BY id DESC 
		LIMIT 3
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var entries []LogEntry

	for rows.Next() {
		var entry LogEntry
		err := rows.Scan(&entry.ID, &entry.Timestamp, &entry.Type, &entry.Event, &entry.Details)
		if err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}
		entries = append(entries, entry)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return entries, nil
}

func displayEntries(entries []LogEntry) {
	if len(entries) == 0 {
		fmt.Println("No entries found in database")
		return
	}

	fmt.Println("\n" + "="*80)
	fmt.Println("Last 3 Log Entries")
	fmt.Println("="*80 + "\n")

	for idx, entry := range entries {
		fmt.Printf("Entry %d:\n", idx+1)
		fmt.Printf("  ID:        %d\n", entry.ID)
		fmt.Printf("  Timestamp: %s\n", entry.Timestamp)
		fmt.Printf("  Type:      %s\n", entry.Type)
		fmt.Printf("  Event:     %s\n", entry.Event)
		fmt.Printf("  Details:   %s\n\n", entry.Details)
	}
}

func main() {
	entries, err := getLastThreeEntries()
	if err != nil {
		log.Fatalf("Error retrieving entries: %v", err)
	}

	displayEntries(entries)
}
