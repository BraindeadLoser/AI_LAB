import sqlite3
import os
from pathlib import Path

# Database path
db_path = Path(__file__).parent / 'log_events.db'

def get_last_three_entries():
    """Retrieve the last 3 entries from logs database"""
    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row  # Returns results as dictionaries
        cursor = conn.cursor()
        
        # Get last 3 entries (newest first)
        cursor.execute("""
            SELECT id, timestamp, type, event, details 
            FROM logs 
            ORDER BY id DESC 
            LIMIT 3
        """)
        
        entries = cursor.fetchall()
        conn.close()
        
        return entries
    
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return None

def display_entries(entries):
    """Pretty print the entries"""
    if not entries:
        print("No entries found in database")
        return
    
    print(f"\n{'='*80}")
    print(f"Last 3 Log Entries")
    print(f"{'='*80}\n")
    
    for idx, entry in enumerate(entries, 1):
        print(f"Entry {idx}:")
        print(f"  ID:        {entry['id']}")
        print(f"  Timestamp: {entry['timestamp']}")
        print(f"  Type:      {entry['type']}")
        print(f"  Event:     {entry['event']}")
        print(f"  Details:   {entry['details']}")
        print()

if __name__ == "__main__":
    entries = get_last_three_entries()
    display_entries(entries)
