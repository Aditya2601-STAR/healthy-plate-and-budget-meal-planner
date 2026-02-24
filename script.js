// ========== Health Plate — script.js ==========

const SPOONACULAR_KEY = '1562b6de6d5c492ea09b23f6d688cd90';
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

// ========== Live Price Search (Spoonacular) ==========
async function searchPrice() {
    const query = document.getElementById('priceQuery').value.trim();
    const resultsDiv = document.getElementById('priceResults');

    if (!query) {
        resultsDiv.innerHTML = '<p class="price-error">Please enter an ingredient name.</p>';
        return;
    }

    resultsDiv.innerHTML = '<p class="price-loading">⏳ Fetching prices...</p>';

    try {
        // Step 1: Search for matching ingredients
        const searchRes = await fetch(
            `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(query)}&number=4&apiKey=${SPOONACULAR_KEY}`
        );
        const searchData = await searchRes.json();

        if (!searchData.results || searchData.results.length === 0) {
            resultsDiv.innerHTML = '<p class="price-error">No results found. Try a different ingredient.</p>';
            return;
        }

        // Step 2: Fetch price info for each result
        const cards = await Promise.all(
            searchData.results.map(async (item) => {
                const infoRes = await fetch(
                    `https://api.spoonacular.com/food/ingredients/${item.id}/information?amount=100&unit=grams&apiKey=${SPOONACULAR_KEY}`
                );
                const info = await infoRes.json();
                const costUSD = info.estimatedCost ? info.estimatedCost.value / 100 : null;
                const costINR = costUSD ? Math.round(costUSD * USD_TO_INR) : null;
                const img = item.image
                    ? `<img src="https://spoonacular.com/cdn/ingredients_100x100/${item.image}" alt="${item.name}" class="price-img" />`
                    : '';

                return `
                    <div class="price-card">
                        ${img}
                        <div class="price-info">
                            <span class="price-name">${capitalise(item.name)}</span>
                            <span class="price-amount">
                                ${costINR !== null ? `~₹${costINR} <small>per 100g</small>` : 'Price unavailable'}
                            </span>
                        </div>
                    </div>`;
            })
        );

        resultsDiv.innerHTML = cards.join('');
    } catch (err) {
        resultsDiv.innerHTML = '<p class="price-error">⚠️ Could not fetch prices. Check your connection.</p>';
    }
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
