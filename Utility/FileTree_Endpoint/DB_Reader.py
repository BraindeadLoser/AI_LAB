import os
import sqlite3

DB_PATH = r"D:\AI_LAB\Database\file_descriptions.db"
FILE_TREE_PATH = r"D:\AI_LAB\Structure\file_tree.txt"

def open_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS file_descriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT UNIQUE NOT NULL,
            description TEXT
        )
    ''')
    conn.commit()
    return conn

def load_file_names():
    file_names = set()
    with open(FILE_TREE_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue  # skip empty lines only
            # Extract the actual file name by splitting on the last '── ' (two dashes with space)
            # and taking the part after it
            if '── ' in line:
                clean_name = line.split('── ')[-1].strip()
            else:
                clean_name = line.strip()
            file_names.add(clean_name)

    return file_names

def sync_db(conn, file_names):
    cursor = conn.cursor()
    cursor.execute('SELECT file_name FROM file_descriptions')
    db_file_names = set(row[0] for row in cursor.fetchall())

    # Insert new files
    new_files = file_names - db_file_names
    for file_name in new_files:
        cursor.execute('INSERT OR IGNORE INTO file_descriptions (file_name, description) VALUES (?, ?)', (file_name, ''))

    # Delete removed files
    removed_files = db_file_names - file_names
    for file_name in removed_files:
        cursor.execute('DELETE FROM file_descriptions WHERE file_name = ?', (file_name,))

    conn.commit()

def main():
    conn = open_db()
    try:
        file_names = load_file_names()
        sync_db(conn, file_names)
        print("Database synced successfully.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
