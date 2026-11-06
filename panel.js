document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const modelSelect = document.getElementById("modelSelect");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const applyBtn = document.getElementById("applyBtn");
  const statusBanner = document.getElementById("statusBanner");
  const resultCard = document.getElementById("resultCard");
  const userFriendlyAnswer = document.getElementById("userFriendlyAnswer");

  let lastResponseData = null;

  // Carregar API Key e Modelo salvos
  chrome.storage.local.get(["anthropicApiKey", "anthropicModel"], (result) => {
    if (result.anthropicApiKey) {
      apiKeyInput.value = result.anthropicApiKey;
    }
    if (result.anthropicModel) {
      modelSelect.value = result.anthropicModel;
    }
  });

  // Salvar Configurações
  saveSettingsBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    const selectedModel = modelSelect.value;

    if (!key) {
      showStatus("Por favor, insira uma API Key válida.", "error");
      return;
    }

    chrome.storage.local.set(
      { anthropicApiKey: key, anthropicModel: selectedModel },
      () => {
        showStatus("Configurações guardadas com sucesso!", "success");
      }
    );
  });

  // Analisar Página / Quiz
  analyzeBtn.addEventListener("click", async () => {
    const key = apiKeyInput.value.trim();
    const selectedModel = modelSelect.value;

    if (!key) {
      showStatus("API Key necessária para continuar.", "error");
      return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "⏳ Analisando...";
    hideStatus();
    resultCard.style.display = "none";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        showStatus("Nenhuma aba ativa encontrada.", "error");
        resetAnalyzeBtn();
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_FIELDS" }, (response) => {
        if (chrome.runtime.lastError) {
          showStatus("Não foi possível ler a página. Atualize a aba (F5) e tente novamente.", "error");
          resetAnalyzeBtn();
          return;
        }

        if (!response) {
          showStatus("Nenhum formulário ou quiz detetado nesta página.", "error");
          resetAnalyzeBtn();
          return;
        }

        chrome.runtime.sendMessage(
          { 
            action: "CALL_CLAUDE_API", 
            apiKey: key, 
            model: selectedModel,
            context: response 
          },
          (apiRes) => {
            resetAnalyzeBtn();

            if (chrome.runtime.lastError || !apiRes) {
              showStatus(chrome.runtime.lastError?.message || "Sem resposta do Service Worker.", "error");
              return;
            }

            if (!apiRes.success) {
              showStatus(apiRes.error || "Erro ao consultar a API do Claude.", "error");
              return;
            }

            lastResponseData = apiRes.data;

            if (apiRes.data.resposta_texto) {
              userFriendlyAnswer.textContent = apiRes.data.resposta_texto;
            } else if (Array.isArray(apiRes.data)) {
              userFriendlyAnswer.textContent = `${apiRes.data.length} campos prontos para preenchimento.`;
            } else {
              userFriendlyAnswer.textContent = "Resposta processada com sucesso.";
            }

            resultCard.style.display = "flex";
            showStatus("Análise concluída com sucesso!", "success");
          }
        );
      });
    } catch (err) {
      showStatus("Erro de execução: " + err.message, "error");
      resetAnalyzeBtn();
    }
  });

  // Aplicar na página
  applyBtn.addEventListener("click", async () => {
    if (!lastResponseData) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    chrome.tabs.sendMessage(
      tab.id,
      { action: "HIGHLIGHT_OR_FILL", data: lastResponseData },
      () => {
        showStatus("Ação aplicada na página!", "success");
      }
    );
  });

  function showStatus(msg, type) {
    statusBanner.textContent = msg;
    statusBanner.className = `status-banner ${type}`;
    statusBanner.style.display = "block";
  }

  function hideStatus() {
    statusBanner.className = "status-banner";
    statusBanner.style.display = "none";
    statusBanner.textContent = "";
  }

  function resetAnalyzeBtn() {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "⚡ Analisar Página / Quiz";
  }
});