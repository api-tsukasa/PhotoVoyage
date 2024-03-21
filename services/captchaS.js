// PhotoVoyage
// Code developed by the photoVoyage team and collaborators
// https://github.com/api-tsukasa/PhotoVoyage/graphs/contributors

function generateCaptcha() {
    const operators = ['+', '-', '*'];
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const question = `${num1} ${operator} ${num2}`;
    let answer;
    switch (operator) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            answer = num1 - num2;
            break;
        case '*':
            answer = num1 * num2;
            break;
    }
    return { question: question, answer: answer };
}

module.exports = generateCaptcha;
