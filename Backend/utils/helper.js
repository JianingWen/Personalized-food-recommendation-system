const preprocessIngredients = (ingredientsString) => {
    return ingredientsString.split(';').map(item => item.trim().toLowerCase());
};

module.exports = { preprocessIngredients };
