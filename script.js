// ========== Health Plate — script.js ==========

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
  const dietInput   = document.querySelector('input[name="diet"]:checked');

  const weight = parseFloat(weightInput.value);
  const budget = parseFloat(budgetInput.value);
  const diet   = dietInput ? dietInput.value : null;

  // Simple validation
  if (!weight || weight <= 0) { alert('Please enter a valid weight.'); return; }
  if (!selectedGoal)          { alert('Please select your goal.');     return; }
  if (!budget || budget <= 0) { alert('Please enter a valid budget.'); return; }
  if (!diet)                  { alert('Please select a diet type.');   return; }

  // Protein calculation (g per kg body-weight)
  const proteinMultiplier = { gain: 2.0, maintain: 1.6, lose: 1.4 };
  const protein = Math.round(weight * (proteinMultiplier[selectedGoal] || 1.6));

  // Fill summary
  document.getElementById('resultWeight').textContent  = weight;
  document.getElementById('resultGoal').textContent    = capitalise(selectedGoal);
  document.getElementById('resultProtein').textContent = protein;

  // Generate add-on suggestions
  const suggestions = getAddonSuggestions(diet, budget, selectedGoal);
  const addonList   = document.getElementById('addonList');
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

  const gainSuggestion  = ['🍌 2 Bananas (~₹10/day)', '🍚 Extra cup of rice (~₹5/day)'];
  const loseSuggestion  = ['🥗 Cucumber salad (free!)', '🍋 Lemon water (~₹2/day)'];

  let list = [...base];

  if (diet === 'veg')          list = [...list, ...vegSuggestions];
  if (diet === 'eggetarian')   list = [...list, ...eggetarianSuggestions];
  if (diet === 'nonveg')       list = [...list, ...nonvegSuggestions];
  if (goal === 'gain')         list = [...list, ...gainSuggestion];
  if (goal === 'lose')         list = [...list, ...loseSuggestion];

  // Filter by rough affordability — keep items whose cost hint fits
  return list.filter(item => {
    const match = item.match(/₹(\d+)/);
    return match ? parseInt(match[1]) <= budget * 0.3 : true;
  });
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
