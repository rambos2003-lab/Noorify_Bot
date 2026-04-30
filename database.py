import sqlite3

DATABASE_NAME = "noorify_bot.db"

def init_db():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    # جدول المستخدمين للمسبحة والإحصائيات
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            current_dhikr TEXT DEFAULT 'سبحان الله',
            tasbih_count INTEGER DEFAULT 0
        )
    """)
    
    # جدول المجموعات لإعدادات التذكير
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS groups (
            chat_id INTEGER PRIMARY KEY,
            reminders_enabled BOOLEAN DEFAULT TRUE,
            reminder_interval INTEGER DEFAULT 2 -- بالساعات
        )
    """)
    
    conn.commit()
    conn.close()

def get_user_data(user_id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT current_dhikr, tasbih_count FROM users WHERE user_id = ?", (user_id,))
    data = cursor.fetchone()
    conn.close()
    if data:
        return {"dhikr": data[0], "count": data[1]}
    return None

def update_user_data(user_id, dhikr=None, count=None):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    # تحقق مما إذا كان المستخدم موجودًا
    cursor.execute("SELECT 1 FROM users WHERE user_id = ?", (user_id,))
    exists = cursor.fetchone()
    
    if exists:
        updates = []
        params = []
        if dhikr is not None:
            updates.append("current_dhikr = ?")
            params.append(dhikr)
        if count is not None:
            updates.append("tasbih_count = ?")
            params.append(count)
        
        if updates:
            query = f"UPDATE users SET {', '.join(updates)} WHERE user_id = ?"
            params.append(user_id)
            cursor.execute(query, tuple(params))
    else:
        # إذا لم يكن موجودًا، قم بإضافته
        cursor.execute("INSERT INTO users (user_id, current_dhikr, tasbih_count) VALUES (?, ?, ?)", 
                       (user_id, dhikr if dhikr is not None else 'سبحان الله', count if count is not None else 0))
    
    conn.commit()
    conn.close()

def get_group_settings(chat_id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT reminders_enabled, reminder_interval FROM groups WHERE chat_id = ?", (chat_id,))
    data = cursor.fetchone()
    conn.close()
    if data:
        return {"enabled": bool(data[0]), "interval": data[1]}
    return None

def update_group_settings(chat_id, enabled=None, interval=None):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute("SELECT 1 FROM groups WHERE chat_id = ?", (chat_id,))
    exists = cursor.fetchone()
    
    if exists:
        updates = []
        params = []
        if enabled is not None:
            updates.append("reminders_enabled = ?")
            params.append(int(enabled))
        if interval is not None:
            updates.append("reminder_interval = ?")
            params.append(interval)
        
        if updates:
            query = f"UPDATE groups SET {', '.join(updates)} WHERE chat_id = ?"
            params.append(chat_id)
            cursor.execute(query, tuple(params))
    else:
        cursor.execute("INSERT INTO groups (chat_id, reminders_enabled, reminder_interval) VALUES (?, ?, ?)", 
                       (chat_id, int(enabled) if enabled is not None else True, interval if interval is not None else 2))
    
    conn.commit()
    conn.close()

def get_all_enabled_groups():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT chat_id, reminder_interval FROM groups WHERE reminders_enabled = TRUE")
    data = cursor.fetchall()
    conn.close()
    return data

# تهيئة قاعدة البيانات عند استيراد الوحدة
init_db()
