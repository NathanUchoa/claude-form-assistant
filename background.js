chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CALL_CLAUDE_API") {
    callClaudeAPI(request.apiKey, request.model, request.context)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    
    return true;
  }
});

async function callClaudeAPI(apiKey, selectedModel, context) {
  let prompt = "";
  const systemPrompt = "Você é um assistente especializado em responder formulários e quizzes. Responda APENAS em JSON válido conforme o formato solicitado, sem textos adicionais ou marcações markdown extra.";

  if (context.isQuiz) {
    prompt = `Pergunta do Quiz: "${context.question}"
Opções de resposta disponíveis:
${JSON.stringify(context.options, null, 2)}

Indique qual é a opção correta. Retorne exatamente este formato JSON:
{
  "opcao_correta_id": "ID_DA_OPCAO",
  "resposta_texto": "Texto exato da opção"
}`;
  } else {
    prompt = `Campos do formulário extraídos:
${JSON.stringify(context.standardFields, null, 2)}

Responda aos campos. Retorne exatamente este formato JSON:
[
  { "id": "ID_DO_CAMPO", "resposta": "Sua resposta direta aqui" }
]`;
  }

  const modelChoice = selectedModel || "claude-3-5-sonnet-latest";

  let response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: modelChoice,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        { role: "user", content: prompt }
      ]
    })
  });

  let responseData = await response.json();

  // Tratamento de fallback caso a chave não reconheça a string do modelo
  if (!response.ok && responseData.error?.type === "not_found_error") {
    const fallbackModel = "claude-opus-5-5";
    
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: fallbackModel,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });
    
    responseData = await response.json();
  }

  if (!response.ok) {
    const errorMsg = responseData.error?.message || `Erro HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  let textContent = "";
  if (Array.isArray(responseData.content)) {
    const textBlock = responseData.content.find((block) => block.type === "text");
    if (textBlock && textBlock.text) {
      textContent = textBlock.text;
    }
  }

  if (!textContent) {
    throw new Error("A API respondeu com sucesso, mas nenhum bloco de texto foi retornado pela Anthropic.");
  }

  const rawText = textContent.trim();

  try {
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    return rawText;
  }
}