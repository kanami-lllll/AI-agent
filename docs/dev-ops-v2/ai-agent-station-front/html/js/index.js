const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const submitBtn = document.getElementById('submitBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatList = document.getElementById('chatList');
const welcomeMessage = document.getElementById('welcomeMessage');
const clearAllChatsBtn = document.getElementById('clearAllChatsBtn');
const aiAgentSelect = document.getElementById('aiAgent');
const ragSelect = document.getElementById('ragSelect');
const promptSelect = document.getElementById('promptSelect');
const loadingSpinner = document.getElementById('loadingSpinner');

let currentChatId = null;
let currentEventSource = null;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function parseJsonSafely(raw, fallback) {
    try {
        return JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
}

function getChatStorageKey(chatId) {
    return `chat_${chatId}`;
}

function readChat(chatId) {
    const fallback = {
        name: '新聊天',
        messages: []
    };
    return parseJsonSafely(localStorage.getItem(getChatStorageKey(chatId)), fallback);
}

function saveChat(chatId, chatData) {
    localStorage.setItem(getChatStorageKey(chatId), JSON.stringify(chatData));
}

function getAllChats() {
    return Object.keys(localStorage)
        .filter((key) => key.startsWith('chat_'))
        .map((key) => {
            const chatId = key.substring(5);
            const chatData = readChat(chatId);
            return { chatId, chatData };
        })
        .sort((a, b) => Number(b.chatId) - Number(a.chatId));
}

function setWelcomeVisible(visible) {
    if (welcomeMessage) {
        welcomeMessage.style.display = visible ? 'flex' : 'none';
    }
}

function removeRenderedMessages() {
    chatArea.querySelectorAll('.chat-message').forEach((node) => node.remove());
}

function clearChatArea() {
    removeRenderedMessages();
    setWelcomeVisible(true);
}

function createCopyButton(contentGetter) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'absolute top-2 right-2 p-1 bg-gray-200 rounded-md text-xs';
    copyBtn.textContent = '复制';
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(contentGetter()).then(() => {
            copyBtn.textContent = '已复制';
            setTimeout(() => {
                copyBtn.textContent = '复制';
            }, 1500);
        });
    };
    return copyBtn;
}

function createMessageElement(content, isAssistant) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message max-w-4xl mx-auto mb-4 p-4 rounded-lg ${
        isAssistant ? 'bg-gray-100' : 'bg-white border'
    } markdown-body relative`;
    messageDiv.dataset.role = isAssistant ? 'assistant' : 'user';
    messageDiv.dataset.rawContent = content;

    if (isAssistant) {
        messageDiv.innerHTML = DOMPurify.sanitize(marked.parse(content));
    } else {
        messageDiv.innerHTML = `<div class="whitespace-pre-wrap text-gray-800">${escapeHtml(content)}</div>`;
    }

    messageDiv.appendChild(createCopyButton(() => messageDiv.dataset.rawContent || ''));
    return messageDiv;
}

function appendMessage(content, isAssistant, saveToStorage = true) {
    setWelcomeVisible(false);
    const messageDiv = createMessageElement(content, isAssistant);
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;

    if (saveToStorage && currentChatId) {
        const chatData = readChat(currentChatId);
        chatData.messages.push({ content, isAssistant });

        if (!isAssistant && chatData.messages.filter((item) => !item.isAssistant).length === 1) {
            chatData.name = content.length > 20 ? `${content.slice(0, 20)}...` : content;
        }

        saveChat(currentChatId, chatData);
        updateChatList();
    }

    return messageDiv;
}

function updateChatList() {
    chatList.innerHTML = '';
    const chats = getAllChats();

    if (currentChatId) {
        chats.sort((a, b) => {
            if (a.chatId === currentChatId) {
                return -1;
            }
            if (b.chatId === currentChatId) {
                return 1;
            }
            return Number(b.chatId) - Number(a.chatId);
        });
    }

    chats.forEach(({ chatId, chatData }) => {
        const item = document.createElement('li');
        item.className = `chat-item flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors ${
            chatId === currentChatId ? 'bg-blue-50' : ''
        }`;

        item.innerHTML = `
            <div class="flex-1 overflow-hidden">
                <div class="text-sm font-medium truncate">${escapeHtml(chatData.name || '新聊天')}</div>
                <div class="text-xs text-gray-400">${new Date(Number(chatId)).toLocaleString('zh-CN')}</div>
            </div>
            <div class="chat-actions flex items-center gap-1 opacity-0 transition-opacity duration-200">
                <button class="p-1 hover:bg-gray-200 rounded text-gray-500" type="button">重命名</button>
                <button class="p-1 hover:bg-red-200 rounded text-red-500" type="button">删除</button>
            </div>
        `;

        const [renameBtn, deleteBtn] = item.querySelectorAll('button');
        renameBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            renameChat(chatId);
        });
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteChat(chatId);
        });
        item.addEventListener('click', () => loadChat(chatId));
        item.addEventListener('mouseenter', () => {
            item.querySelector('.chat-actions').classList.remove('opacity-0');
        });
        item.addEventListener('mouseleave', () => {
            item.querySelector('.chat-actions').classList.add('opacity-0');
        });

        chatList.appendChild(item);
    });
}

function createNewChat() {
    const chatId = Date.now().toString();
    currentChatId = chatId;
    localStorage.setItem('currentChatId', chatId);
    saveChat(chatId, {
        name: `新聊天 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`,
        messages: []
    });
    clearChatArea();
    updateChatList();
    return chatId;
}

function loadChat(chatId) {
    currentChatId = chatId;
    localStorage.setItem('currentChatId', chatId);
    const chatData = readChat(chatId);

    clearChatArea();
    chatData.messages.forEach((message) => {
        appendMessage(message.content, message.isAssistant, false);
    });
    setWelcomeVisible(chatData.messages.length === 0);
    updateChatList();
}

function deleteChat(chatId) {
    if (!confirm('确定要删除这个聊天记录吗？')) {
        return;
    }

    localStorage.removeItem(getChatStorageKey(chatId));

    if (currentChatId === chatId) {
        currentChatId = null;
        localStorage.removeItem('currentChatId');
        clearChatArea();
    }

    const chats = getAllChats();
    if (!currentChatId && chats.length > 0) {
        loadChat(chats[0].chatId);
        return;
    }

    if (!currentChatId) {
        createNewChat();
        return;
    }

    updateChatList();
}

function renameChat(chatId) {
    const chatData = readChat(chatId);
    const currentName = chatData.name || '新聊天';
    const newName = prompt('请输入新的聊天名称', currentName);
    if (!newName) {
        return;
    }

    chatData.name = newName.trim().slice(0, 30) || currentName;
    saveChat(chatId, chatData);
    updateChatList();
}

function clearAllChats() {
    if (!confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) {
        return;
    }

    Object.keys(localStorage)
        .filter((key) => key.startsWith('chat_'))
        .forEach((key) => localStorage.removeItem(key));

    localStorage.removeItem('currentChatId');
    currentChatId = null;
    clearChatArea();
    updateChatList();
    createNewChat();
}

function buildConversationPrompt(rawMessage) {
    if (!currentChatId) {
        return rawMessage;
    }

    const chatData = readChat(currentChatId);
    const historyMessages = Array.isArray(chatData.messages)
        ? chatData.messages.slice(Math.max(0, chatData.messages.length - 8))
        : [];

    if (historyMessages.length === 0) {
        return rawMessage;
    }

    const historyText = historyMessages
        .map((item) => `${item.isAssistant ? '助手' : '用户'}: ${item.content}`)
        .join('\n');

    return `以下是当前会话最近的上下文，请结合上下文继续回答，不要说自己无法记住历史。\n\n${historyText}\n\n用户最新问题：${rawMessage}`;
}

async function loadRagOptions() {
    const response = await fetch(ApiConfig.getApiUrl('/ai/admin/rag/queryAllValidRagOrder'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    while (ragSelect.options.length > 1) {
        ragSelect.remove(1);
    }

    if (Array.isArray(data)) {
        data.forEach((item) => {
            ragSelect.add(new Option(`RAG：${item.ragName}`, item.id));
        });
    }
}

async function fetchAiAgents() {
    const response = await fetch(ApiConfig.getApiUrl('/ai/admin/agent/queryAllAgentConfigListByChannel'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'channel=chat_stream'
    });

    if (!response.ok) {
        throw new Error('获取智能体列表失败');
    }

    const data = await response.json();
    aiAgentSelect.innerHTML = '';

    if (Array.isArray(data) && data.length > 0) {
        data.forEach((agent, index) => {
            const option = document.createElement('option');
            option.value = agent.id;
            option.textContent = agent.agentName;
            if (index === 0) {
                option.selected = true;
            }
            aiAgentSelect.appendChild(option);
        });
    }
}

async function fetchPromptTemplates() {
    const response = await fetch(ApiConfig.getApiUrl('/ai/admin/client/system/prompt/queryAllSystemPromptConfig'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('获取提示词列表失败');
    }

    const data = await response.json();
    while (promptSelect.options.length > 1) {
        promptSelect.remove(1);
    }

    if (Array.isArray(data)) {
        data.forEach((prompt) => {
            const option = document.createElement('option');
            option.value = prompt.promptContent;
            option.textContent = prompt.promptName;
            promptSelect.appendChild(option);
        });
    }
}

function extractStreamText(payload) {
    if (!payload) {
        return '';
    }

    if (typeof payload === 'string') {
        return payload;
    }

    if (payload.result?.output?.text) {
        return payload.result.output.text;
    }

    if (payload.output?.text) {
        return payload.output.text;
    }

    if (payload.text) {
        return payload.text;
    }

    return '';
}

function isStreamFinished(payload) {
    return payload?.result?.output?.metadata?.finishReason === 'STOP'
        || payload?.output?.metadata?.finishReason === 'STOP'
        || payload?.finishReason === 'STOP';
}

function stopStreamingState() {
    if (loadingSpinner) {
        loadingSpinner.classList.add('hidden');
    }
    submitBtn.disabled = false;
}

function startEventStream(message) {
    if (currentEventSource) {
        currentEventSource.close();
        currentEventSource = null;
    }

    if (loadingSpinner) {
        loadingSpinner.classList.remove('hidden');
    }
    submitBtn.disabled = true;

    const ragId = ragSelect.value || '0';
    const aiAgentId = aiAgentSelect.value;
    const promptMessage = buildConversationPrompt(message);
    const streamUrl = `${ApiConfig.BASE_URL}${ApiConfig.API_PREFIX}/ai/agent/chat_stream?aiAgentId=${encodeURIComponent(aiAgentId)}&ragId=${encodeURIComponent(ragId)}&message=${encodeURIComponent(promptMessage)}`;

    const assistantBox = appendMessage('', true, false);
    assistantBox.dataset.rawContent = '';
    const copyBtn = assistantBox.querySelector('button');
    if (copyBtn) {
        copyBtn.remove();
    }

    const contentNode = document.createElement('div');
    contentNode.className = 'whitespace-pre-wrap text-gray-800';
    assistantBox.innerHTML = '';
    assistantBox.appendChild(contentNode);

    let renderedContent = '';
    let pendingContent = '';
    let renderTimer = null;
    let streamFinished = false;

    const finalize = () => {
        assistantBox.dataset.rawContent = renderedContent;
        assistantBox.innerHTML = DOMPurify.sanitize(marked.parse(renderedContent || ''));
        assistantBox.appendChild(createCopyButton(() => assistantBox.dataset.rawContent || ''));

        if (currentChatId) {
            const chatData = readChat(currentChatId);
            chatData.messages.push({ content: renderedContent, isAssistant: true });
            saveChat(currentChatId, chatData);
            updateChatList();
        }

        stopStreamingState();
    };

    const scheduleRender = () => {
        if (renderTimer) {
            return;
        }

        renderTimer = setInterval(() => {
            if (pendingContent.length > 0) {
                renderedContent += pendingContent.slice(0, 2);
                pendingContent = pendingContent.slice(2);
                contentNode.textContent = renderedContent;
                chatArea.scrollTop = chatArea.scrollHeight;
                return;
            }

            clearInterval(renderTimer);
            renderTimer = null;

            if (streamFinished) {
                finalize();
            }
        }, 18);
    };

    currentEventSource = new EventSource(streamUrl);

    currentEventSource.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data);
            const delta = extractStreamText(payload);
            if (delta) {
                pendingContent += delta;
                scheduleRender();
            }

            if (isStreamFinished(payload)) {
                currentEventSource.close();
                currentEventSource = null;
                streamFinished = true;
                if (!renderTimer && pendingContent.length === 0) {
                    finalize();
                }
            }
        } catch (error) {
            console.error('解析流式消息失败:', error);
        }
    };

    currentEventSource.onerror = () => {
        if (currentEventSource) {
            currentEventSource.close();
            currentEventSource = null;
        }
        if (renderTimer) {
            clearInterval(renderTimer);
            renderTimer = null;
        }

        if (!renderedContent && !pendingContent) {
            assistantBox.innerHTML = '<div class="text-red-500">对话请求失败，请稍后重试。</div>';
        } else if (pendingContent.length > 0) {
            renderedContent += pendingContent;
            pendingContent = '';
            finalize();
            return;
        }

        stopStreamingState();
    };
}

async function handleSubmit() {
    const message = messageInput.value.trim();
    if (!message) {
        return;
    }

    if (!currentChatId) {
        createNewChat();
    }

    appendMessage(message, false, true);
    messageInput.value = '';
    startEventStream(message);
}

function bindEvents() {
    submitBtn.addEventListener('click', handleSubmit);
    newChatBtn.addEventListener('click', createNewChat);
    clearAllChatsBtn.addEventListener('click', clearAllChats);

    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    });

    promptSelect.addEventListener('change', function () {
        const selectedPrompt = this.value;
        if (!selectedPrompt) {
            return;
        }

        if (messageInput.value.trim()) {
            messageInput.value = `${selectedPrompt}\n\n${messageInput.value}`;
        } else {
            messageInput.value = selectedPrompt;
        }

        this.value = '';
        messageInput.focus();
    });
}

async function initializePage() {
    bindEvents();

    try {
        await Promise.all([
            loadRagOptions(),
            fetchAiAgents(),
            fetchPromptTemplates()
        ]);
    } catch (error) {
        console.error('初始化首页数据失败', error);
    }

    updateChatList();
    const savedChatId = localStorage.getItem('currentChatId');
    if (savedChatId && localStorage.getItem(getChatStorageKey(savedChatId))) {
        loadChat(savedChatId);
    } else {
        clearChatArea();
    }
}

window.createNewChat = createNewChat;
window.deleteChat = deleteChat;
window.renameChat = renameChat;
window.loadChat = loadChat;
window.clearAllChats = clearAllChats;

document.addEventListener('DOMContentLoaded', initializePage);
