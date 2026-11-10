# ✦ Claude Form & Quiz Assistant

Uma extensão do Google Chrome (Manifest V3) construída para automatizar a leitura de formulários e quizzes na web através da API oficial da Anthropic (Claude).

A extensão extrai estruturadamente as perguntas e opções diretamente do DOM da página ativa e utiliza modelos avançados do Claude para identificar, destacar e preencher automaticamente as respostas corretas.

---

## 🚀 Funcionalidades

- **Automação Inteligente de Quizzes & Formulários:** Leitura dinâmica de perguntas e campos na página ativa com suporte a múltiplos *iframes*.
- **Seleção Dinâmica de Modelos:** Escolha entre diferentes perfis de modelo diretamente na interface:
  - 🟢 **Claude 3.5 Sonnet:** Equilibrado e recomendado.
  - ⚡ **Claude 3.5 Haiku:** Ultra rápido e económico.
  - 🔥 **Claude Opus:** Máxima precisão para raciocínio complexo.
- **Transparência de Custos:** Indicadores visuais de estimativa de custo por milhão de tokens na interface.
- **Interface Amigável (Dark Mode):** Painel lateral (*Side Panel*) moderno com visualização clara da opção sugerida.
- **Armazenamento Seguro Local:** A API Key e as preferências são guardadas exclusivamente no armazenamento local do seu navegador (`chrome.storage.local`).

---

## 🛠️ Tecnologias Utilizadas

- **Chrome Extension API:** Manifest V3, Side Panel API, Service Worker e Content Scripts.
- **LLM Engine:** Anthropic Messages API (`/v1/messages`).
- **Frontend Panel:** HTML5, CSS3 (Modern Dark Theme), JavaScript ES6+.

---

## 📦 Como Instalar no Chrome (Modo Desenvolvedor)

1. **Faça o clone ou download deste repositório:**
   ```bash
   git clone [https://github.com/NathanUchoa/claude-form-assistant.git](https://github.com/NathanUchoa/claude-form-assistant.git)

Abra o separador de extensões no Chrome:
Navegue até chrome://extensions/ no seu navegador.

Ative o Modo do Desenvolvedor:
No canto superior direito da página, ative a opção Modo do desenvolvedor (Developer mode).

Carregue a extensão:
Clique no botão Carregar sem compactação (Load unpacked) e selecione a pasta raiz deste projeto.

**##💡 Como Utilizar**
Abra o Side Panel da extensão no Chrome.

**Insira a sua Anthropic API Key** (obtenha em console.anthropic.com) e escolha o modelo desejado. Clique em Guardar Configurações.

Navegue até à página com o quiz ou formulário que pretende analisar.

**Clique em ⚡ Analisar Página / Quiz.**

Verifique a resposta recomendada exibida no painel e clique em ✨ Destacar / Preencher na Página para aplicar o destaque verde e efetuar o clique automático na alternativa correta.

**📄 Licença**
Este projeto está sob a licença MIT. Sinta-se à vontade para contribuir, clonar e adaptar para o seu uso!
