// Listener de mensagens vindas do Side Panel / Background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_FIELDS") {
    const data = extractPageData();
    sendResponse(data);
    return true;
  }

  if (request.action === "HIGHLIGHT_OR_FILL") {
    applyResponseToPage(request.data);
    sendResponse({ success: true });
    return true;
  }
});

function extractPageData() {
  // 1. Tentar detectar estrutura de Quiz (Pergunta + Opções/Botões)
  const questionEl = document.querySelector('h1, h2, h3, .question, [class*="pergunta"], [class*="question"]');
  const optionEls = Array.from(document.querySelectorAll('button, input[type="radio"], input[type="checkbox"], label, .option, [class*="opcao"]'));

  // Filtrar opções válidas e visíveis
  const validOptions = optionEls
    .filter(el => el.innerText && el.innerText.trim().length > 0)
    .slice(0, 10); // Limita às opções relevantes da tela

  if (questionEl && validOptions.length > 0) {
    // Atribui IDs temporários para o Claude conseguir referenciar qual clicar
    const optionsData = validOptions.map((el, index) => {
      const optId = `claude-option-${index + 1}`;
      el.setAttribute("data-claude-id", optId);
      return {
        id: optId,
        text: el.innerText.trim()
      };
    });

    return {
      isQuiz: true,
      question: questionEl.innerText.trim(),
      options: optionsData
    };
  }

  // 2. Fallback para formulários padrão (Inputs, Textareas, Selects)
  const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select'));
  const standardFields = inputs.map((input, index) => {
    const fieldId = input.id || input.name || `field-${index + 1}`;
    input.setAttribute("data-claude-id", fieldId);
    
    // Tenta encontrar a label associada ao campo
    let labelText = "";
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) labelText = label.innerText;
    }
    if (!labelText && input.placeholder) {
      labelText = input.placeholder;
    }

    return {
      id: fieldId,
      label: labelText.trim() || `Campo ${index + 1}`,
      type: input.type || input.tagName.toLowerCase()
    };
  });

  return {
    isQuiz: false,
    standardFields: standardFields
  };
}

function applyResponseToPage(data) {
  if (!data) return;

  // Se for resposta de Quiz
  if (data.opcao_correta_id) {
    const targetEl = document.querySelector(`[data-claude-id="${data.opcao_correta_id}"]`);
    if (targetEl) {
      targetEl.style.outline = "4px solid #22c55e";
      targetEl.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.click(); // Autoclique na opção correta
    }
    return;
  }

  // Se for resposta de Formulário (Lista de campos)
  if (Array.isArray(data)) {
    data.forEach(item => {
      const inputEl = document.querySelector(`[data-claude-id="${item.id}"]`) || document.getElementById(item.id);
      if (inputEl && item.resposta) {
        inputEl.value = item.resposta;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        inputEl.style.border = "2px solid #22c55e";
      }
    });
  }
}