import re

with open('src/pages/dashboard/Resident.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const [meterReadings, setMeterReadings] = useState([]);',
    'const [meterReadings, setMeterReadings] = useState([]);\n  const [allMeterReadings, setAllMeterReadings] = useState([]);'
)

content = content.replace(
    'setMeterReadings(data.filter(m => m.flatNumber === flatNumber));',
    'setMeterReadings(data.filter(m => m.flatNumber === flatNumber));\n        setAllMeterReadings(data);'
)

content = content.replace(
    'value: reading.readingValue',
    'yourValue: reading.readingValue,\n        avgValue: parseFloat((allMeterReadings.filter(r => new Date(r.readingDate).getMonth() === date.getMonth()).reduce((a,b)=>a+b.readingValue,0) / (allMeterReadings.filter(r => new Date(r.readingDate).getMonth() === date.getMonth()).length || 1)).toFixed(1))'
)

# Fix the BarChart
old_bar = '''<Bar dataKey="value" radius={[8, 8, 8, 8]} label={renderCustomBarLabel}>
                              {getFilteredChartData().map((entry, index) => <Cell key={`cell-${index}`} fill="url(#colorUv)" />)}
                            </Bar>'''
new_bar = '''<Bar dataKey="yourValue" name="Your Usage" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avgValue" name="Community Avg" fill="#cbd5e1" radius={[4, 4, 0, 0]} />'''
content = content.replace(old_bar, new_bar)

old_bar2 = '''<Bar dataKey="value" radius={[8, 8, 8, 8]} label={renderCustomBarLabel}>
                          {getFilteredChartData().map((entry, index) => <Cell key={`cell-${index}`} fill="url(#colorUv)" />)}
                        </Bar>'''
new_bar2 = '''<Bar dataKey="yourValue" name="Your Usage" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="avgValue" name="Community Avg" fill="#cbd5e1" radius={[4, 4, 0, 0]} />'''
content = content.replace(old_bar2, new_bar2)


# Replace total usage sum
content = content.replace(
    '{getFilteredChartData().reduce((acc, curr) => acc + curr.value, 0)}',
    '{getFilteredChartData().reduce((acc, curr) => acc + (curr.yourValue || 0), 0).toFixed(1)}'
)

with open('src/pages/dashboard/Resident.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
