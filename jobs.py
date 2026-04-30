import random
from datetime import datetime
from data import DHIKRS, MESSAGES
from db import cursor

async def reminder(context):
    for row in cursor.execute("SELECT chat_id FROM groups WHERE enabled=1"):
        chat_id = row[0]
        d = random.choice(DHIKRS)
        m = random.choice(MESSAGES)
        await context.bot.send_message(chat_id, f"🔔 {d}\n\n{m}")

async def fasting(context):
    day = datetime.now().weekday()

    msg = None
    if day == 6:
        msg = "📢 لا تنس صيام الاثنين 🌙"
    elif day == 2:
        msg = "📢 لا تنس صيام الخميس 🌙"

    if msg:
        for row in cursor.execute("SELECT chat_id FROM groups"):
            await context.bot.send_message(row[0], msg)
