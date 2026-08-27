import re

with open('src/pages/dashboard/Resident.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'<Bar dataKey="value" radius=\{\[8, 8, 8, 8\]\} label=\{renderCustomBarLabel\}>\s*\{getFilteredChartData\(\)\.map\(\(entry, index\) => <Cell key=\{\`cell-\$\{index\}\`\} fill="url\(#colorUv\)" />\)\}\s*</Bar>',
    '<Bar dataKey="yourValue" name="Your Usage" fill="#6366f1" radius={[4, 4, 0, 0]} />\n<Bar dataKey="avgValue" name="Community Avg" fill="#cbd5e1" radius={[4, 4, 0, 0]} />',
    content
)

with open('src/pages/dashboard/Resident.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
