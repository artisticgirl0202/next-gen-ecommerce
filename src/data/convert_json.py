import json
import re

# Load the uploaded file
input_path = 'demo_products_500.json'
output_path = 'demo_products_500_english.json'

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Regex pattern to capture components from the Korean description
# Pattern: [Name] — [Brand]의 [Category]용 제품으로, [Specs]을(를) 제공합니다. [Extra]
pattern = re.compile(r"(.*?) — (.*?)의 (.*?)용 제품으로, (.*?)을\(를\) 제공합니다\. (.*)")

count = 0
for item in data:
    if "description" in item:
        original_desc = item["description"]
        match = pattern.match(original_desc)
        if match:
            name, brand, category, specs, extra = match.groups()
            # Construct English sentence
            new_desc = f"{name} — A {category} product by {brand}, featuring {specs}. {extra}"
            item["description"] = new_desc
            count += 1

# Save the transformed data
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Converted {count} items.")
