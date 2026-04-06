const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const submitBtn = document.getElementById('submitBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatList = document.getElementById('chatList');
const welcomeMessage = document.getElementById('welcomeMessage');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const clearAllChatsBtn = document.getElementById('clearAllChatsBtn');
let currentEventSource = null;
let currentChatId = null;

// 鏈湴瀛樺偍宸ュ叿鍑芥暟
async function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        return false;
    }
}

async function getStorageItem(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error('Storage error:', error);
        return null;
    }
}

// 鑾峰彇鐭ヨ瘑搴撳垪琛?document.addEventListener('DOMContentLoaded', function() {
    // 鑾峰彇鐭ヨ瘑搴撳垪琛?    const loadRagOptions = () => {
        const ragSelect = document.getElementById('ragSelect');

        fetch(ApiConfig.getApiUrl('/ai/admin/rag/queryAllValidRagOrder'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    // 娓呯┖鐜版湁閫夐」锛堜繚鐣欑涓€涓粯璁ら€夐」锛?                    while (ragSelect.options.length > 1) {
                        ragSelect.remove(1);
                    }

                    // 娣诲姞鏂伴€夐」
                    data.forEach(item => {
                        const option = new Option(`Rag锛?{item.ragName}`, item.id);
                        ragSelect.add(option);
                    });
                }
            })
            .catch(error => {
                console.error('鑾峰彇鐭ヨ瘑搴撳垪琛ㄥけ璐?', error);
            });
    };

    // 鑾峰彇AI浠ｇ悊鍒楄〃
    function fetchAiAgents() {
        // 鍙戦€佽姹傝幏鍙朅I浠ｇ悊鍒楄〃
        fetch(ApiConfig.getApiUrl('/ai/admin/agent/queryAllAgentConfigListByChannel'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'channel=chat_stream'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('缃戠粶鍝嶅簲涓嶆甯?);
            }
            return response.json();
        })
        .then(data => {
            const aiAgentSelect = document.getElementById('aiAgent');
            // 娓呯┖鐜版湁閫夐」
            aiAgentSelect.innerHTML = '';

            // 娣诲姞浠庢湇鍔″櫒鑾峰彇鐨勯€夐」
            if (data && data.length > 0) {
                data.forEach((agent, index) => {
                    const option = document.createElement('option');
                    option.value = agent.id;
                    option.textContent = agent.agentName;
                    // 濡傛灉鏄涓€涓€夐」锛岃缃负閫変腑鐘舵€?                    if (index === 0) {
                        option.selected = true;
                    }
                    aiAgentSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('鑾峰彇AI浠ｇ悊鍒楄〃澶辫触:', error);
        });
    }

    // 鑾峰彇鎻愮ず璇嶅垪琛?    function fetchPromptTemplates() {
        fetch(ApiConfig.getApiUrl('/ai/admin/client/system/prompt/queryAllSystemPromptConfig'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('缃戠粶鍝嶅簲涓嶆甯?);
            }
            return response.json();
        })
        .then(data => {
            const promptSelect = document.getElementById('promptSelect');
            // 娓呯┖鐜版湁閫夐」锛堜繚鐣欑涓€涓粯璁ら€夐」锛?            while (promptSelect.options.length > 1) {
                promptSelect.remove(1);
            }

            // 娣诲姞浠庢湇鍔″櫒鑾峰彇鐨勯€夐」
            if (data && data.length > 0) {
                data.forEach(prompt => {
                    const option = document.createElement('option');
                    option.value = prompt.promptContent;
                    option.textContent = prompt.promptName;
                    promptSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('鑾峰彇鎻愮ず璇嶅垪琛ㄥけ璐?', error);
        });
    }

    // 鍒濆鍖栧姞杞?    loadRagOptions();
    // 鑾峰彇AI浠ｇ悊鍒楄〃
    fetchAiAgents();
    // 鑾峰彇鎻愮ず璇嶅垪琛?    fetchPromptTemplates();

    // 娣诲姞鎻愮ず璇嶉€夋嫨浜嬩欢鐩戝惉
    const promptSelect = document.getElementById('promptSelect');
    promptSelect.addEventListener('change', function() {
        const selectedPrompt = this.value;
        if (selectedPrompt) {
            const messageInput = document.getElementById('messageInput');
            // 濡傛灉杈撳叆妗嗗凡鏈夊唴瀹癸紝鍒欏湪鍐呭鍓嶆坊鍔犳彁绀鸿瘝
            if (messageInput.value.trim()) {
                messageInput.value = selectedPrompt + '\n\n' + messageInput.value;
            } else {
                messageInput.value = selectedPrompt;
            }
            // 閲嶇疆閫夋嫨妗?            this.value = '';
            // 鑱氱劍鍒拌緭鍏ユ
            messageInput.focus();
        }
    });
});

async function createNewChat() {
    const chatId = Date.now().toString();
    currentChatId = chatId;
    await setStorageItem('currentChatId', chatId);
    await setStorageItem(`chat_${chatId}`, JSON.stringify({
        name: `鏂拌亰澶?${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`,
        messages: []
    }));
    await updateChatList();
    clearChatArea();
    return chatId;
}

function deleteChat(chatId) {
    if (confirm('纭畾瑕佸垹闄よ繖涓亰澶╄褰曞悧锛?)) {
        localStorage.removeItem(`chat_${chatId}`); // Remove the chat from localStorage
        if (currentChatId === chatId) { // If the current chat is being deleted
            createNewChat(); // Create a new chat
        }
        updateChatList(); // Update the chat list to reflect changes
    }
}

function updateChatList() {
    chatList.innerHTML = '';
    const chats = Object.keys(localStorage)
      .filter(key => key.startsWith('chat_'));

    const currentChatIndex = chats.findIndex(key => key.split('_')[1] === currentChatId);
    if (currentChatIndex!== -1) {
        const currentChat = chats[currentChatIndex];
        chats.splice(currentChatIndex, 1);
        chats.unshift(currentChat);
    }

    chats.forEach(chatKey => {
        let chatData = JSON.parse(localStorage.getItem(chatKey));
        const chatId = chatKey.split('_')[1];

        // 鏁版嵁杩佺Щ锛氬皢鏃ф暟缁勬牸寮忚浆鎹负鏂板璞℃牸寮?        if (Array.isArray(chatData)) {
            chatData = {
                name: `鑱婂ぉ ${new Date(parseInt(chatId)).toLocaleDateString()}`,
                messages: chatData
            };
            localStorage.setItem(chatKey, JSON.stringify(chatData));
        }

        const li = document.createElement('li');
        li.className = `chat-item flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors ${chatId === currentChatId? 'bg-blue-50' : ''}`;
        li.innerHTML = `
            <div class="flex-1">
                <div class="text-sm font-medium">${chatData.name}</div>
                <div class="text-xs text-gray-400">${new Date(parseInt(chatId)).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
            </div>
            <div class="chat-actions flex items-center gap-1 opacity-0 transition-opacity duration-200">
                <button class="p-1 hover:bg-gray-200 rounded text-gray-500" onclick="renameChat('${chatId}')">閲嶅懡鍚?/button>
                <button class="p-1 hover:bg-red-200 rounded text-red-500" onclick="deleteChat('${chatId}')">鍒犻櫎</button>
            </div>
        `;
        li.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-actions')) {
                loadChat(chatId);
            }
        });
        li.addEventListener('mouseenter', () => {
            li.querySelector('.chat-actions').classList.remove('opacity-0');
        });
        li.addEventListener('mouseleave', () => {
            li.querySelector('.chat-actions').classList.add('opacity-0');
        });
        chatList.appendChild(li);
    });
}

let currentContextMenu = null;
// 浼樺寲鍚庣殑涓婁笅鏂囪彍鍗?function showChatContextMenu(event, chatId) {
    event.stopPropagation();
    closeContextMenu();

    const buttonRect = event.target.closest('button').getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${buttonRect.left}px`;
    menu.style.top = `${buttonRect.bottom + 4}px`;

    menu.innerHTML = `
        <div class="context-menu-item" onclick="renameChat('${chatId}')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            閲嶅懡鍚?        </div>
        <div class="context-menu-item text-red-500" onclick="deleteChat('${chatId}')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            鍒犻櫎
        </div>
    `;

    document.body.appendChild(menu);
    currentContextMenu = menu;

    // 鐐瑰嚮澶栭儴鍏抽棴鑿滃崟
    setTimeout(() => {
        document.addEventListener('click', closeContextMenu, { once: true });
    });
}

function closeContextMenu() {
    if (currentContextMenu) {
        currentContextMenu.remove();
        currentContextMenu = null;
    }
}

function renameChat(chatId) {
    const chatKey = `chat_${chatId}`;
    const chatData = JSON.parse(localStorage.getItem(chatKey));
    const currentName = chatData.name || `鑱婂ぉ ${new Date(parseInt(chatId)).toLocaleString()}`;
    let newName = prompt('璇疯緭鍏ユ柊鐨勮亰澶╁悕绉?, currentName);
    if (newName && newName.length > 10) {
        newName = newName.substring(0, 10);
    }

    if (newName) {
        chatData.name = newName;
        localStorage.setItem(chatKey, JSON.stringify(chatData));
        updateChatList();
    }
}

function loadChat(chatId) {
    currentChatId = chatId;
    localStorage.setItem('currentChatId', chatId);
    clearChatArea();
    const chatData = JSON.parse(localStorage.getItem(`chat_${chatId}`) || { messages: [] });
    chatData.messages.forEach(msg => {
        appendMessage(msg.content, msg.isAssistant, false);
    });
    updateChatList()
}

function clearChatArea() {
    chatArea.innerHTML = '';
    welcomeMessage.style.display = 'flex';
}

function buildConversationPrompt(rawMessage) {
    if (!currentChatId) {
        return rawMessage;
    }

    const chatData = JSON.parse(localStorage.getItem(`chat_${currentChatId}`) || '{"messages": []}');
    const messages = Array.isArray(chatData.messages) ? chatData.messages : [];
    const historyMessages = messages.slice(Math.max(0, messages.length - 9), Math.max(0, messages.length - 1));

    if (historyMessages.length === 0) {
        return rawMessage;
    }

    const historyText = historyMessages
        .map(item => `${item.isAssistant ? '鍔╂墜' : '鐢ㄦ埛'}: ${item.content}`)
        .join('\n');

    return `浣犳鍦ㄥ拰鍚屼竴涓敤鎴疯繛缁璇濓紝璇风粨鍚堟渶杩戜笂涓嬫枃缁х画鍥炵瓟锛屼笉瑕佽浣犳棤娉曡浣忓巻鍙插唴瀹广€俓n\n鏈€杩戝璇濓細\n${historyText}\n\n褰撳墠鐢ㄦ埛闂锛歕n${rawMessage}`;
}

function appendMessage(content, isAssistant = false, saveToStorage = true) {
    welcomeMessage.style.display = 'none';
    const messageDiv = document.createElement('div');
    messageDiv.className = `max-w-4xl mx-auto mb-4 p-4 rounded-lg ${isAssistant ? 'bg-gray-100' : 'bg-white border'} markdown-body relative`;

    const renderedContent = DOMPurify.sanitize(marked.parse(content));
    messageDiv.innerHTML = renderedContent;

    // 娣诲姞澶嶅埗鎸夐挳
    const copyBtn = document.createElement('button');
    copyBtn.className = 'absolute top-2 right-2 p-1 bg-gray-200 rounded-md text-xs';
    copyBtn.textContent = '澶嶅埗';
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(content).then(() => {
            copyBtn.textContent = '宸插鍒?;
            setTimeout(() => copyBtn.textContent = '澶嶅埗', 2000);
        });
    };
    messageDiv.appendChild(copyBtn);

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;

    // 浠呭湪闇€瑕佹椂淇濆瓨鍒版湰鍦板瓨鍌?    if (saveToStorage && currentChatId) {
        // 纭繚璇诲彇鍜屼繚瀛樺畬鏁寸殑鏁版嵁缁撴瀯
        const chatData = JSON.parse(localStorage.getItem(`chat_${currentChatId}`) || '{"name": "鏂拌亰澶?, "messages": []}');
        chatData.messages.push({ content, isAssistant });

        // 濡傛灉鏄敤鎴风殑绗竴鏉℃秷鎭紝灏嗗叾浣滀负鑱婂ぉ鍚嶇О
        if (!isAssistant && chatData.messages.length === 1) {
            const nameContent = content.length > 20 ? content.substring(0, 20) + '...' : content;
            chatData.name = nameContent;
        }

        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(chatData));
        updateChatList(); // 鏇存柊鑱婂ぉ鍒楄〃浠ユ樉绀烘柊鍚嶇О
    }
}

function startEventStream(message) {
    if (currentEventSource) {
        currentEventSource.close();
    }

    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    const ragId = document.getElementById('ragSelect').value;
    const ragIdParam = ragId ? ragId : '0';
    const aiAgentSelect = document.getElementById('aiAgent');
    const aiAgentId = aiAgentSelect.value;
    const promptMessage = buildConversationPrompt(message);
    const url = `${ApiConfig.BASE_URL}${ApiConfig.API_PREFIX}/ai/agent/chat_stream?aiAgentId=${aiAgentId}&ragId=${ragIdParam}&message=${encodeURIComponent(promptMessage)}`;

    currentEventSource = new EventSource(url);
    let renderedContent = '';
    let pendingContent = '';
    let tempMessageDiv = null;
    let renderTimer = null;
    let streamFinished = false;

    function ensureAssistantBox() {
        if (!tempMessageDiv) {
            tempMessageDiv = document.createElement('div');
            tempMessageDiv.className = 'max-w-4xl mx-auto mb-4 p-4 rounded-lg bg-gray-100 markdown-body relative';
            chatArea.appendChild(tempMessageDiv);
            welcomeMessage.style.display = 'none';
        }
    }

    function finalizeAssistantMessage(finalContent) {
        if (!tempMessageDiv) {
            return;
        }

        tempMessageDiv.innerHTML = DOMPurify.sanitize(marked.parse(finalContent));

        const copyBtn = document.createElement('button');
        copyBtn.className = 'absolute top-2 right-2 p-1 bg-gray-200 rounded-md text-xs';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(finalContent).then(() => {
                copyBtn.textContent = 'Copied';
                setTimeout(() => copyBtn.textContent = 'Copy', 2000);
            });
        };
        tempMessageDiv.appendChild(copyBtn);

        if (currentChatId) {
            const chatData = JSON.parse(localStorage.getItem(`chat_${currentChatId}`) || '{"name":"New Chat","messages":[]}');
            chatData.messages.push({ content: finalContent, isAssistant: true });
            localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(chatData));
        }

        loadingSpinner.classList.add('hidden');
        submitBtn.disabled = false;
    }

    function scheduleRender() {
        if (renderTimer) {
            return;
        }

        renderTimer = setInterval(() => {
            if (pendingContent.length > 0) {
                ensureAssistantBox();
                const step = pendingContent.slice(0, 2);
                pendingContent = pendingContent.slice(2);
                renderedContent += step;
                tempMessageDiv.textContent = renderedContent;
                chatArea.scrollTop = chatArea.scrollHeight;
                return;
            }

            clearInterval(renderTimer);
            renderTimer = null;

            if (streamFinished) {
                finalizeAssistantMessage(renderedContent);
            }
        }, 20);
    }

    currentEventSource.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);

            if (data.result) {
                const output = data.result.output;
                if (output.text) {
                    pendingContent += output.text;
                    scheduleRender();
                }

                if (output.metadata.finishReason === 'STOP') {
                    currentEventSource.close();
                    streamFinished = true;
                    if (!renderTimer && pendingContent.length === 0) {
                        finalizeAssistantMessage(renderedContent);
                    }
                }
            } else {
                currentEventSource.close();
                loadingSpinner.classList.add('hidden');
                submitBtn.disabled = false;
            }
        } catch (e) {
            console.error('Error parsing event data:', e);
            loadingSpinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    };

    currentEventSource.onerror = function(error) {
        console.error('EventSource error:', error);
        currentEventSource.close();
        if (renderTimer) {
            clearInterval(renderTimer);
            renderTimer = null;
        }
        loadingSpinner.classList.add('hidden');
        submitBtn.disabled = false;
    };
}
submitBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (!message) return;

    if (!currentChatId) {
        createNewChat();
    }

    appendMessage(message, false);
    messageInput.value = '';
    startEventStream(message);
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitBtn.click();
    }
});

newChatBtn.addEventListener('click', createNewChat);

toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    updateSidebarIcon();
});

function updateSidebarIcon() {
    const iconPath = document.getElementById('sidebarIconPath');
    if (sidebar.classList.contains('-translate-x-full')) {
        iconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    } else {
        iconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    }
}

// Initialize
updateChatList();
const savedChatId = localStorage.getItem('currentChatId');
if (savedChatId) {
    loadChat(savedChatId);
}

// Handle window resize for responsive design
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('-translate-x-full');
    } else {
        sidebar.classList.add('-translate-x-full');
    }
});

// Initial check for mobile devices
if (window.innerWidth <= 768) {
    sidebar.classList.add('-translate-x-full');
}

updateSidebarIcon();

// 娓呯┖鎵€鏈夎亰澶╄褰?function clearAllChats() {
    if (confirm('纭畾瑕佹竻绌烘墍鏈夎亰澶╄褰曞悧锛熸鎿嶄綔涓嶅彲鎭㈠锛?)) {
        // 鑾峰彇鎵€鏈夎亰澶╄褰曠殑key
        const keys = Object.keys(localStorage).filter(key => key.startsWith('chat_'));
        
        // 鍒犻櫎鎵€鏈夎亰澶╄褰?        keys.forEach(key => localStorage.removeItem(key));
        
        // 娓呴櫎褰撳墠鑱婂ぉID
        localStorage.removeItem('currentChatId');
        currentChatId = null;
        
        // 娓呯┖UI
        clearChatArea();
        updateChatList();
        
        // 鍒涘缓鏂扮殑绌鸿亰澶?        createNewChat();
    }
}

// 缁戝畾娓呯┖鎸夐挳浜嬩欢
clearAllChatsBtn.addEventListener('click', clearAllChats);

// 涓婁紶鐭ヨ瘑涓嬫媺鑿滃崟鎺у埗
// 鑾峰彇涓婁紶鐭ヨ瘑鎸夐挳鍜岃彍鍗曞厓绱?const uploadMenuButton = document.getElementById('uploadMenuButton');
const uploadMenu = document.getElementById('uploadMenu');

// 鍒囨崲鑿滃崟鏄剧ず
uploadMenuButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadMenu.style.display === 'none' || uploadMenu.style.display === '') {
        uploadMenu.style.display = 'block';
    } else {
        uploadMenu.style.display = 'none';
    }
});

// 鐐瑰嚮澶栭儴鍖哄煙鍏抽棴鑿滃崟
document.addEventListener('click', (e) => {
    if (!uploadMenu.contains(e.target) && e.target !== uploadMenuButton && !uploadMenuButton.contains(e.target)) {
        uploadMenu.style.display = 'none';
    }
});

// 鑿滃崟椤圭偣鍑诲悗鍏抽棴鑿滃崟
document.querySelectorAll('#uploadMenu a').forEach(item => {
    item.addEventListener('click', () => {
        uploadMenu.style.display = 'none';
    });
});

