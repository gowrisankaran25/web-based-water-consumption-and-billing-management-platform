import re

with open('src/main/java/com/watermanagement/config/DataSeeder.java', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('''            }
            
            }
        }

        // --- Seed Bulk Water Purchases ---''', '''            }
        }

        // --- Seed Bulk Water Purchases ---''')

text = text.replace('''        }

        }

        // Seed Field Tech User''', '''        }

        // Seed Field Tech User''')

with open('src/main/java/com/watermanagement/config/DataSeeder.java', 'w', encoding='utf-8') as f:
    f.write(text)
