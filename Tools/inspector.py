import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(r"D:\AI_LAB\Database\log_events.db")
TABLE_NAME = "logs"   # change if needed

EXPECTED_COLUMNS = ["timestamp", "type", "event", "details"]

def connect():
    if not DB_PATH.exists():
        print("❌ DB not found:", DB_PATH)
        return None
    return sqlite3.connect(DB_PATH)

# --------------------------------------------------

def check_integrity(conn):
    print("\n🔍 DB INTEGRITY CHECK")
    cursor = conn.cursor()
    cursor.execute("PRAGMA integrity_check;")
    result = cursor.fetchone()[0]
    print("Result:", result)

# --------------------------------------------------

def inspect_schema(conn):
    print("\n📐 SCHEMA ANALYSIS")
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({TABLE_NAME});")
    cols = cursor.fetchall()

    actual_columns = [c[1] for c in cols]
    print("Columns:", actual_columns)

    missing = set(EXPECTED_COLUMNS) - set(actual_columns)
    extra = set(actual_columns) - set(EXPECTED_COLUMNS)

    if not missing and not extra:
        print("✅ Schema matches expected")
    else:
        if missing:
            print("❌ Missing columns:", missing)
        if extra:
            print("⚠️ Extra columns:", extra)

# --------------------------------------------------

def sample_logs(conn, limit=10):
    print(f"\n📊 SAMPLE ({limit} rows)")
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT * FROM {TABLE_NAME}
        ORDER BY rowid DESC
        LIMIT {limit}
    """)
    rows = cursor.fetchall()
    for r in rows:
        print(r)
    return rows

# --------------------------------------------------

def analyze_nulls(conn):
    print("\n🧨 NULL / EMPTY FIELD ANALYSIS")
    cursor = conn.cursor()

    for col in EXPECTED_COLUMNS:
        cursor.execute(f"""
            SELECT COUNT(*) FROM {TABLE_NAME}
            WHERE {col} IS NULL OR {col} = ''
        """)
        count = cursor.fetchone()[0]
        print(f"{col}: {count} problematic rows")

# --------------------------------------------------

def analyze_types(rows):
    print("\n🧪 DATA SHAPE ANALYSIS (sample-based)")

    for r in rows:
        timestamp, type_, event, details = r

        # timestamp check
        try:
            datetime.fromisoformat(timestamp)
        except Exception:
            print("❌ Bad timestamp:", timestamp)

        # suspicious details
        if isinstance(details, str):
            if details.strip() == "[object Object]":
                print("❌ Serialization issue in details:", details)

        if not type_:
            print("❌ Missing type:", r)

        if not event:
            print("❌ Missing event:", r)

# --------------------------------------------------

def analyze_patterns(conn):
    print("\n📈 PATTERN ANALYSIS")

    cursor = conn.cursor()

    # frequency of event types
    cursor.execute(f"""
        SELECT type, COUNT(*) 
        FROM {TABLE_NAME}
        GROUP BY type
    """)
    print("\nEvent type distribution:")
    for row in cursor.fetchall():
        print(row)

    # duplicate detection
    cursor.execute(f"""
        SELECT event, COUNT(*)
        FROM {TABLE_NAME}
        GROUP BY event
        HAVING COUNT(*) > 5
    """)
    duplicates = cursor.fetchall()
    if duplicates:
        print("\n⚠️ High-frequency duplicate events:")
        for d in duplicates:
            print(d)

# --------------------------------------------------

def timeline_check(conn):
    print("\n⏱️ TIMELINE CONSISTENCY")

    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT timestamp FROM {TABLE_NAME}
        ORDER BY rowid ASC
        LIMIT 20
    """)
    timestamps = [r[0] for r in cursor.fetchall()]

    previous = None
    for ts in timestamps:
        try:
            current = datetime.fromisoformat(ts)
            if previous and current < previous:
                print("❌ Time regression detected:", ts)
            previous = current
        except:
            print("❌ Invalid timestamp format:", ts)

# --------------------------------------------------

def main():
    conn = connect()
    if not conn:
        return

    check_integrity(conn)
    inspect_schema(conn)

    rows = sample_logs(conn)

    analyze_nulls(conn)
    analyze_types(rows)
    analyze_patterns(conn)
    timeline_check(conn)

    conn.close()
    print("\n✅ Inspection complete")

# --------------------------------------------------

if __name__ == "__main__":
    main()