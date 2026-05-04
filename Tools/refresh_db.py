import sqlite3
import os

DB_PATH = r"D:\AI_LAB\Database\log_events.db"

def refresh_db():
    if not os.path.exists(DB_PATH):
        print("Database file not found.")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Delete all rows
        cursor.execute("DELETE FROM logs;")

        # Reset auto-increment (important for clean state)
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='logs';")

        conn.commit()
        conn.close()

        print("Database cleared successfully.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    refresh_db()