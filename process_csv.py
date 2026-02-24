import csv
import json
import os

csv_file = r"c:\Users\Aditya\OneDrive\Desktop\mini project sem 4\IndianFoodDatasetCSV.csv"
js_file = r"c:\Users\Aditya\OneDrive\Desktop\mini project sem 4\recipes_data.js"

recipes = []

# Mapping Diets
diet_map = {
    "Vegetarian": "veg",
    "High Protein Vegetarian": "veg",
    "Diabetic Friendly": "veg",
    "Non Vegeterian": "nonveg",
    "Non-Vegetarian": "nonveg",
    "High Protein Non-Vegetarian": "nonveg",
    "Eggetarian": "egg",
    "No Onion No Garlic (Vegan)": "veg",
    "Vegan": "veg",
    "Gluten Free": "veg"
}

# Mapping Meals (Course)
def get_meal_tags(course):
    course = str(course).lower()
    tags = []
    if "breakfast" in course:
        tags.append("breakfast")
    if "lunch" in course or "main course" in course or "dinner" in course or "side dish" in course:
        tags.extend(["lunch", "dinner"])
    if "snack" in course or "appetizer" in course or "dessert" in course:
        tags.extend(["breakfast", "lunch", "dinner"]) # Snacks are all day
    
    # Default to lunch/dinner if unknown
    if not tags:
        tags = ["lunch", "dinner"]
    return list(set(tags))

if not os.path.exists(csv_file):
    print(f"Error: {csv_file} not found")
else:
    with open(csv_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('TranslatedRecipeName') or row.get('RecipeName')
            if not name: continue
            
            diet_raw = row.get('Diet', 'Vegetarian')
            diet = diet_map.get(diet_raw, "veg")
            
            course = row.get('Course', '')
            meal = get_meal_tags(course)
            
            # Simple nutrition estimation
            # Base: 200 cal, 5g protein
            cal = 250
            pro = 6
            if diet == "nonveg":
                pro = 22
                cal = 300
            elif diet == "egg":
                pro = 14
                cal = 220
            
            if "paneer" in name.lower() or "dal" in name.lower() or "chole" in name.lower():
                pro += 8
                
            recipes.append({
                "name": name,
                "diet": diet,
                "meal": meal,
                "cat": row.get('Course', 'Indian'),
                "cal": cal,
                "pro": pro,
                "price": 40 if diet == "veg" else 80, # Dummy average price
                "ingredients": row.get('TranslatedIngredients', ''),
                "instructions": row.get('TranslatedInstructions', '')
            })

    # Write as JS file
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write("const RECIPE_DB = ")
        json.dump(recipes, f, ensure_ascii=False, indent=2)
        f.write(";")

    print(f"Successfully processed {len(recipes)} recipes into {js_file}")
