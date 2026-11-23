import sqlite3

def view_db():
    conn = sqlite3.connect("backend/noise_monitor.db")
    c = conn.cursor()

    print("=" * 75)
    print("       NOISESCAPE - SQLITE DATABASE BROWSER (noise_monitor.db)")
    print("=" * 75)

    # 1. Stations Table
    print("\n[TABLE 1: STATIONS] (Monitored Sectors in Madurai)")
    print("-" * 75)
    c.execute("SELECT id, name, zone, status, latitude, longitude FROM stations")
    stations = c.fetchall()
    print(f"{'ID':<4} | {'Sector Name':<38} | {'Zone':<12} | {'Coordinates'}")
    print("-" * 75)
    for s in stations:
        coords = f"({s[4]:.4f}, {s[5]:.4f})"
        print(f"{s[0]:<4} | {s[1]:<38} | {s[2]:<12} | {coords}")

    # 2. Latest Noise Readings
    print("\n[TABLE 2: NOISE_READINGS] (Latest 10 Recorded Measurements in Database)")
    print("-" * 75)
    c.execute("""
        SELECT r.id, s.name, s.zone, r.decibel_value, r.is_breach, r.recorded_at 
        FROM noise_readings r 
        JOIN stations s ON r.station_id = s.id 
        ORDER BY r.id DESC LIMIT 10
    """)
    readings = c.fetchall()
    print(f"{'ID':<6} | {'Location':<30} | {'Decibels':<10} | {'Breach':<8} | {'Timestamp'}")
    print("-" * 75)
    for r in readings:
        breach_str = "YES (!)" if r[4] else "NO"
        print(f"{r[0]:<6} | {r[1][:30]:<30} | {r[3]:<10.1f} | {breach_str:<8} | {r[5]}")

    # 3. Latest Alerts
    print("\n[TABLE 3: ALERTS] (Recent CPCB Breach Threshold Alerts)")
    print("-" * 75)
    c.execute("""
        SELECT a.id, s.name, a.severity, a.actual_value, a.threshold_exceeded, a.is_resolved 
        FROM alerts a 
        JOIN stations s ON a.station_id = s.id 
        ORDER BY a.id DESC LIMIT 5
    """)
    alerts = c.fetchall()
    print(f"{'ID':<5} | {'Severity':<9} | {'Measured':<9} | {'Limit':<8} | {'Resolved':<9} | {'Location'}")
    print("-" * 75)
    for a in alerts:
        res_str = "YES" if a[5] else "NO"
        print(f"{a[0]:<5} | {a[2]:<9} | {a[3]:<9.1f} | {a[4]:<8.1f} | {res_str:<9} | {a[1]}")

    print("\n" + "=" * 75)
    conn.close()

if __name__ == "__main__":
    view_db()
