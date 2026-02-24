// ========== Health Plate — script.js ==========

const SPOONACULAR_KEY = '1562b6de6d5c492ea09b23f6d688cd90';
const DATA_GOV_KEY = '579b464db66ec23bdd00000131f9a32ca0424b8f45573d97b3ee0d19';
const USD_TO_INR = 83;

let selectedGoal = '';

// Show/hide step sections
function showStep(stepNumber) {
    // Hide all form sections & results
    document.querySelectorAll('.form-section, .results').forEach(el => {
        el.style.display = 'none';
    });

    const target = document.getElementById('step' + stepNumber);
    if (target) {
        target.style.display = 'block';
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Select a fitness goal and highlight the chosen card
function selectGoal(goal) {
    selectedGoal = goal;

    document.querySelectorAll('.goal-card').forEach(card => {
        card.classList.remove('selected');
    });

    // identify clicked card by its onclick attribute text
    document.querySelectorAll('.goal-card').forEach(card => {
        if (card.getAttribute('onclick').includes(goal)) {
            card.classList.add('selected');
        }
    });
}

// Generate personalised meal plan
function generatePlan() {
    const weightInput = document.getElementById('weight');
    const budgetInput = document.getElementById('budget');
    const dietInput = document.querySelector('input[name="diet"]:checked');

    const weight = parseFloat(weightInput.value);
    const budget = parseFloat(budgetInput.value);
    const diet = dietInput ? dietInput.value : null;

    // Simple validation
    if (!weight || weight <= 0) { alert('Please enter a valid weight.'); return; }
    if (!selectedGoal) { alert('Please select your goal.'); return; }
    if (!budget || budget <= 0) { alert('Please enter a valid budget.'); return; }
    if (!diet) { alert('Please select a diet type.'); return; }

    // Protein calculation (g per kg body-weight)
    const proteinMultiplier = { gain: 2.0, maintain: 1.6, lose: 1.4 };
    const protein = Math.round(weight * (proteinMultiplier[selectedGoal] || 1.6));

    // Fill summary
    document.getElementById('resultWeight').textContent = weight;
    document.getElementById('resultGoal').textContent = capitalise(selectedGoal);
    document.getElementById('resultProtein').textContent = protein;

    // Generate add-on suggestions
    const suggestions = getAddonSuggestions(diet, budget, selectedGoal);
    const addonList = document.getElementById('addonList');
    addonList.innerHTML = suggestions
        .map(s => `<li>${s}</li>`)
        .join('');

    // Show results
    document.querySelectorAll('.form-section').forEach(el => { el.style.display = 'none'; });
    const results = document.getElementById('results');
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Suggestion engine
function getAddonSuggestions(diet, budget, goal) {
    const base = [
        '🥜 Peanuts (high protein, ~₹10/day)',
        '🥛 Curd / Dahi (~₹15/day)',
        '🫘 Sprouts (~₹10/day)',
        '🥚 Boiled Egg — 2 nos. (~₹12/day)',
    ];

    const vegSuggestions = [
        '🫘 Soya Chunks (~₹12/day)',
        '🥛 Paneer 50g (~₹20/day)',
        '🌱 Moong Dal — extra cup (~₹8/day)',
    ];

    const eggetarianSuggestions = [
        '🥚 2 Eggs (scrambled/boiled) (~₹12/day)',
        '🧀 Cheese slice (~₹15/day)',
    ];

    const nonvegSuggestions = [
        '🍗 Boiled Chicken 100g (~₹40/day)',
        '🐟 Fish curry portion (~₹35/day)',
        '🥚 Egg bhurji (~₹15/day)',
    ];

    const gainSuggestion = ['🍌 2 Bananas (~₹10/day)', '🍚 Extra cup of rice (~₹5/day)'];
    const loseSuggestion = ['🥗 Cucumber salad (free!)', '🍋 Lemon water (~₹2/day)'];

    let list = [...base];

    if (diet === 'veg') list = [...list, ...vegSuggestions];
    if (diet === 'eggetarian') list = [...list, ...eggetarianSuggestions];
    if (diet === 'nonveg') list = [...list, ...nonvegSuggestions];
    if (goal === 'gain') list = [...list, ...gainSuggestion];
    if (goal === 'lose') list = [...list, ...loseSuggestion];

    // Filter by rough affordability — keep items whose cost hint fits
    return list.filter(item => {
        const match = item.match(/₹(\d+)/);
        return match ? parseInt(match[1]) <= budget * 0.3 : true;
    });
}

function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== Live Price Search (Agmarknet + Spoonacular) ==========
async function searchPrice() {
    const query = document.getElementById('priceQuery').value.trim();
    const resultsDiv = document.getElementById('priceResults');

    if (!query) {
        resultsDiv.innerHTML = '<p class="price-error">Please enter an ingredient name.</p>';
        return;
    }

    resultsDiv.innerHTML = '<p class="price-loading">⏳ Fetching live Indian market prices...</p>';

    try {
        // Run both API calls in parallel
        const [mandiResult, nutritionResult] = await Promise.allSettled([
            fetchAgmarknetPrices(query),
            fetchSpoonacularNutrition(query)
        ]);

        let html = '';

        // --- Section 1: Indian Mandi Prices (data.gov.in) ---
        const mandiData = mandiResult.status === 'fulfilled' ? mandiResult.value : [];
        if (mandiData.length > 0) {
            html += '<div class="price-section-title">📊 Indian Market (Mandi) Prices</div>';
            html += mandiData.map(r => `
                <div class="price-card market-card">
                    <div class="market-icon">🏪</div>
                    <div class="price-info">
                        <span class="price-name">${r.commodity} <small style="color:var(--text-muted)">${r.variety ? '— ' + r.variety : ''}</small></span>
                        <span class="price-location">📍 ${r.market}, ${r.state}</span>
                        <span class="price-amount">~₹${Math.round(r.modal_price / 100)}<small>/kg</small></span>
                        <span class="price-range">Range: ₹${Math.round(r.min_price / 100)} – ₹${Math.round(r.max_price / 100)}/kg &nbsp;|&nbsp; ${r.date}</span>
                    </div>
                </div>`).join('');
        } else {
            html += '<p class="price-note">ℹ️ No mandi data for this item. Try: rice, dal, wheat, tomato, milk, potato, onion.</p>';
        }

        // --- Section 2: Nutrition (Spoonacular) ---
        const nutritionData = nutritionResult.status === 'fulfilled' ? nutritionResult.value : [];
        if (nutritionData.length > 0) {
            html += '<div class="price-section-title mt">🥗 Nutrition Info (per 100g)</div>';
            html += nutritionData.map(item => `
                <div class="price-card nutrition-card">
                    ${item.img ? `<img src="${item.img}" alt="${item.name}" class="price-img" />` : '<div class="market-icon">🥘</div>'}
                    <div class="price-info">
                        <span class="price-name">${capitalise(item.name)}</span>
                        ${item.calories ? `<span class="price-range">🔥 Calories: ${item.calories} kcal</span>` : ''}
                        ${item.protein ? `<span class="price-range">💪 Protein: ${item.protein}g</span>` : ''}
                        ${item.costINR ? `<span class="price-amount">~₹${item.costINR}<small>/100g</small> <small style="color:var(--text-muted)">(global est.)</small></span>` : ''}
                    </div>
                </div>`).join('');
        }

        if (!html) {
            html = '<p class="price-error">No results found. Try ingredients like: rice, dal, paneer, milk, eggs.</p>';
        }

        resultsDiv.innerHTML = html;

    } catch (err) {
        resultsDiv.innerHTML = '<p class="price-error">⚠️ Could not fetch prices. Check your connection.</p>';
    }
}

// Fetch wholesale mandi prices from data.gov.in (Agmarknet)
async function fetchAgmarknetPrices(query) {
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${DATA_GOV_KEY}&format=json&filters[commodity]=${encodeURIComponent(query)}&limit=4`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.records || data.records.length === 0) return [];
    return data.records.map(r => ({
        commodity: r.commodity,
        variety: r.variety || '',
        market: r.market,
        state: r.state,
        min_price: parseFloat(r.min_price) || 0,
        max_price: parseFloat(r.max_price) || 0,
        modal_price: parseFloat(r.modal_price) || 0,
        date: r.arrival_date || ''
    }));
}

// Fetch nutrition info from Spoonacular
async function fetchSpoonacularNutrition(query) {
    const searchRes = await fetch(
        `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(query)}&number=2&apiKey=${SPOONACULAR_KEY}`
    );
    const searchData = await searchRes.json();
    if (!searchData.results || searchData.results.length === 0) return [];

    return await Promise.all(searchData.results.map(async item => {
        const infoRes = await fetch(
            `https://api.spoonacular.com/food/ingredients/${item.id}/information?amount=100&unit=grams&apiKey=${SPOONACULAR_KEY}`
        );
        const info = await infoRes.json();
        const costUSD = info.estimatedCost ? info.estimatedCost.value / 100 : null;
        const costINR = costUSD ? Math.round(costUSD * USD_TO_INR) : null;
        const calories = info.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount;
        const protein = info.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount;
        return {
            name: item.name,
            img: item.image ? `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` : null,
            costINR,
            calories: calories ? Math.round(calories) : null,
            protein: protein ? Math.round(protein * 10) / 10 : null
        };
    }));
}

// Allow pressing Enter in the price search input
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('priceQuery');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchPrice();
        });
    }
});
