import pymysql

try:
    conn = pymysql.connect(
        host='127.0.0.1',
        user='hots_pod_user',
        password='2114',
        database='hots_pod_db',
        port=3306
    )
    print("✅ DB Connection Success!")
    conn.close()
except Exception as e:
    print(f"❌ DB Connection Failed: {e}")
