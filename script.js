const numberInput = document.getElementById('numberInput');
const baseSelect = document.getElementById('baseSelect');
const resultTable = document.getElementById('resultTable');
const resultsGrid = document.getElementById('resultsGrid');
const explanationSection = document.getElementById('explanationSection');
const explanationContent = document.getElementById('explanationContent');

// Convert number automatically when input changes
numberInput.addEventListener('input', convertNumber);
baseSelect.addEventListener('change', convertNumber);

function convertNumber() {
    const inputValue = numberInput.value.trim();
    const fromBase = parseInt(baseSelect.value);
    
    // Clear results if input is empty
    if (!inputValue) {
        resultTable.classList.add('hidden');
        explanationSection.classList.add('hidden');
        return;
    }
    
    // Handle negative numbers
    let isNegative = false;
    let cleanValue = inputValue;
    if (inputValue.startsWith('-')) {
        isNegative = true;
        cleanValue = inputValue.substring(1);
        if (!cleanValue) {
            resultTable.classList.add('hidden');
            explanationSection.classList.add('hidden');
            return;
        }
    }
    
    // Validate input based on selected base
    if (!isValidNumber(cleanValue, fromBase)) {
        showError();
        return;
    }
    
    try {
        // Convert to decimal first
        let decimalValue;
        if (fromBase === 10) {
            decimalValue = parseInt(cleanValue, 10);
        } else {
            decimalValue = parseInt(cleanValue, fromBase);
        }
        
        // Apply negative sign if needed
        if (isNegative) {
            decimalValue = -decimalValue;
        }
        
        // Check if conversion was successful
        if (isNaN(decimalValue)) {
            showError();
            return;
        }
        
        // Generate conversions
        const conversions = [
            { base: 'Decimal', icon: '🔢', value: decimalValue.toString(10) },
            { base: 'Binary', icon: '🔁', value: decimalValue < 0 ? '-' + Math.abs(decimalValue).toString(2) : decimalValue.toString(2) },
            { base: 'Octal', icon: '🔸', value: decimalValue < 0 ? '-' + Math.abs(decimalValue).toString(8) : decimalValue.toString(8) },
            { base: 'Hexadecimal', icon: '🔶', value: (decimalValue < 0 ? '-' + Math.abs(decimalValue).toString(16) : decimalValue.toString(16)).toUpperCase() }
        ];
        
        displayResults(conversions, fromBase);
        showExplanation(inputValue, fromBase, decimalValue);
        
    } catch (error) {
        showError();
    }
}

function isValidNumber(value, base) {
    const cleanValue = value.replace(/\s+/g, '').toUpperCase();
    
    switch (base) {
        case 2: return /^[01]+$/.test(cleanValue);
        case 8: return /^[0-7]+$/.test(cleanValue);
        case 10: return /^[0-9]+$/.test(cleanValue);
        case 16: return /^[0-9A-F]+$/.test(cleanValue);
        default: return false;
    }
}

function displayResults(conversions, fromBase) {
    resultsGrid.innerHTML = '';
    
    const baseNames = { 10: 'Decimal', 2: 'Binary', 8: 'Octal', 16: 'Hexadecimal' };
    
    conversions.forEach(conversion => {
        const currentBaseName = baseNames[fromBase];
        if (conversion.base === currentBaseName) return; // Skip input base
        
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-info">
                <div class="result-base">${conversion.icon} ${conversion.base}</div>
                <div class="result-value">${conversion.value}</div>
            </div>
            <button class="copy-btn" onclick="copyToClipboard('${conversion.value}', this)">Copy</button>
        `;
        
        resultsGrid.appendChild(card);
    });
    
    resultTable.classList.remove('hidden');
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        button.textContent = '✓ Copied!';
        setTimeout(() => button.textContent = 'Copy', 2000);
    });
}

function showError() {
    resultsGrid.innerHTML = `
        <div class="error-card">
            ❌ Cannot convert - Invalid number for selected base
        </div>
    `;
    resultTable.classList.remove('hidden');
    explanationSection.classList.add('hidden');
}

function showExplanation(inputValue, fromBase, decimalValue) {
    const baseNames = { 10: 'Decimal', 2: 'Binary', 8: 'Octal', 16: 'Hexadecimal' };
    
    let explanation = '';
    const isNegative = inputValue.startsWith('-');
    const cleanInput = isNegative ? inputValue.substring(1) : inputValue;
    const absDecimal = Math.abs(decimalValue);
    
    // Step 1: Input Analysis
    explanation += `<div class="explanation-step">
        <div class="step-title">🔍 Step 1: Input Analysis</div>
        <div class="step-content">
            Input: "${inputValue}" in ${baseNames[fromBase]} (Base ${fromBase})
            ${isNegative ? '<br><strong>Note:</strong> Negative number detected' : ''}
        </div>
    </div>`;
    
    // Step 2: Conversion Process
    if (fromBase !== 10) {
        explanation += `<div class="explanation-step">
            <div class="step-title">🔄 Step 2: Convert to Decimal</div>
            <div class="step-content">`;
        
        if (fromBase === 2) {
            explanation += generateBinaryToDecimalExplanation(cleanInput, absDecimal);
        } else if (fromBase === 8) {
            explanation += generateOctalToDecimalExplanation(cleanInput, absDecimal);
        } else if (fromBase === 16) {
            explanation += generateHexToDecimalExplanation(cleanInput, absDecimal);
        }
        
        explanation += `</div></div>`;
    }
    
    // Step 3: Convert FROM decimal
    if (fromBase === 10) {
        explanation += generateDecimalConversions(absDecimal, isNegative);
    } else {
        explanation += `<div class="explanation-step">
            <div class="step-title">📊 Step 3: Convert Decimal to Other Bases</div>
            <div class="step-content">
                Now that we have decimal ${absDecimal}, we can convert to other bases:
                <div class="formula">
                    • Binary: ${absDecimal.toString(2)}<br>
                    • Octal: ${absDecimal.toString(8)}<br>
                    • Hexadecimal: ${absDecimal.toString(16).toUpperCase()}
                </div>
            </div>
        </div>`;
    }
    
    explanationContent.innerHTML = explanation;
    explanationSection.classList.remove('hidden');
}

function generateBinaryToDecimalExplanation(binary, decimal) {
    let explanation = `Converting binary ${binary} to decimal:<div class="formula">`;
    
    const steps = [];
    for (let i = 0; i < binary.length; i++) {
        const digit = binary[binary.length - 1 - i];
        steps.unshift(`(${digit} × 2^${i})`);
    }
    explanation += steps.join(" + "); 
    explanation += ` = ${decimal}</div>`;
    return explanation;
}

function generateOctalToDecimalExplanation(octal, decimal) {
    let explanation = `Converting octal ${octal} to decimal:<div class="formula">`;
    
    for (let i = 0; i < octal.length; i++) {
        const digit = parseInt(octal[octal.length - 1 - i]);
        const power = i;
        const value = digit * Math.pow(8, power);
        explanation += `${digit} × 8^${power} = ${value}`;
        if (i < octal.length - 1) explanation += ' + ';
    }
    
    explanation += ` = ${decimal}</div>`;
    return explanation;
}

function generateHexToDecimalExplanation(hex, decimal) {
    let explanation = `Converting hexadecimal ${hex.toUpperCase()} to decimal:<div class="formula">`;
    
    for (let i = 0; i < hex.length; i++) {
        const digit = hex[hex.length - 1 - i];
        const digitValue = parseInt(digit, 16);
        const power = i;
        const value = digitValue * Math.pow(16, power);
        explanation += `${digit.toUpperCase()}(${digitValue}) × 16^${power} = ${value}`;
        if (i < hex.length - 1) explanation += ' + ';
    }
    
    explanation += ` = ${decimal}</div>`;
    return explanation;
}

function generateDecimalConversions(decimal, isNegative) {
    let explanation = '';
    
    // Binary conversion
    explanation += `<div class="explanation-step">
        <div class="step-title">🔁 Convert to Binary</div>
        <div class="step-content">
            Divide by 2 repeatedly, read remainders from bottom to top:
            <div class="formula">`;
    
    let num = decimal;
    let steps = [];
    while (num > 0) {
        const remainder = num % 2;
        const quotient = Math.floor(num / 2);
        steps.push(`${num} ÷ 2 = ${quotient} remainder ${remainder}`);
        num = quotient;
    }
    
    steps.forEach(step => {
        explanation += `<div class="division-step">${step}</div>`;
    });
    
    explanation += `</div>
            <div class="final-result">
                Result: ${isNegative ? '-' : ''}${decimal.toString(2)}
            </div>
        </div>
    </div>`;
    
    // Octal conversion
    explanation += `<div class="explanation-step">
        <div class="step-title">🔸 Convert to Octal</div>
        <div class="step-content">
            Divide by 8 repeatedly:
            <div class="formula">`;
    
    num = decimal;
    steps = [];
    while (num > 0) {
        const remainder = num % 8;
        const quotient = Math.floor(num / 8);
        steps.push(`${num} ÷ 8 = ${quotient} remainder ${remainder}`);
        num = quotient;
    }
    
    steps.forEach(step => {
        explanation += `<div class="division-step">${step}</div>`;
    });
    
    explanation += `</div>
            <div class="final-result">
                Result: ${isNegative ? '-' : ''}${decimal.toString(8)}
            </div>
        </div>
    </div>`;
    
    // Hex conversion
    explanation += `<div class="explanation-step">
        <div class="step-title">🔶 Convert to Hexadecimal</div>
        <div class="step-content">
            Divide by 16 repeatedly:
            <div class="formula">`;
    
    num = decimal;
    steps = [];
    while (num > 0) {
        const remainder = num % 16;
        const quotient = Math.floor(num / 16);
        const hexRemainder = remainder < 10 ? remainder : String.fromCharCode(65 + remainder - 10);
        steps.push(`${num} ÷ 16 = ${quotient} remainder ${remainder}(${hexRemainder})`);
        num = quotient;
    }
    
    steps.forEach(step => {
        explanation += `<div class="division-step">${step}</div>`;
    });
    
    explanation += `</div>
            <div class="final-result">
                Result: ${isNegative ? '-' : ''}${decimal.toString(16).toUpperCase()}
            </div>
        </div>
    </div>`;
    
    return explanation;
}

// Focus on input when page loads
window.addEventListener('load', () => {
    numberInput.focus();
});