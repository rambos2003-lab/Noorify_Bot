from telegram import InlineKeyboardButton, InlineKeyboardMarkup

def main_menu():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📿 ذكر عشوائي", callback_data="random")],
        [InlineKeyboardButton("🧮 المسبحة", callback_data="tasbih")],
        [InlineKeyboardButton("📚 المكتبة", callback_data="library")],
        [InlineKeyboardButton("📊 إحصائياتي", callback_data="stats")],
        [InlineKeyboardButton("⚙️ إعدادات (أدمن)", callback_data="admin")]
    ])

def back():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔙 رجوع", callback_data="menu")]
    ])
