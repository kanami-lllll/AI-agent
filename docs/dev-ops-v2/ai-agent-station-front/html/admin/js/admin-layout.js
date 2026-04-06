(() => {
    const pageConfigs = {
        'ai-agent.html': {
            title: 'AI智能体管理',
            description: '定义一个智能体本身的基础信息，例如名称、用途、对话通道和启用状态。',
            impact: '这里决定“系统里有哪些智能体可用”，但不会直接决定模型、工具或提示词。'
        },
        'ai-agent-client.html': {
            title: '智能体客户端关联',
            description: '把智能体和客户端绑定起来，并决定一个智能体要按什么顺序执行哪些客户端。',
            impact: '这里决定“一个智能体由哪些客户端组成”，属于编排层配置。'
        },
        'ai-agent-task.html': {
            title: 'AI代理任务调度',
            description: '配置定时触发的智能体任务，让智能体在固定时间自动执行。',
            impact: '这里决定“哪些智能体会自动跑”，适合日报、巡检、批处理等场景。'
        },
        'ai-api-patrol.html': {
            title: '接口巡检配置',
            description: '配置需要巡检的接口、请求方式、断言规则和定时策略。',
            impact: '这里决定“巡检会对哪些接口发请求，以及怎么判断成功失败”。'
        },
        'ai-api-patrol-result.html': {
            title: '巡检结果记录',
            description: '查看每次接口巡检的执行结果、失败原因和 AI 巡检报告。',
            impact: '这里用于回看巡检历史，判断接口是否稳定，辅助定位问题。'
        },
        'ai-client-advisor.html': {
            title: '客户端顾问管理',
            description: '定义客户端可用的 Advisor，例如会话记忆和 RAG 检索增强。',
            impact: '这里决定“客户端有哪些增强能力可选”，属于能力定义层。'
        },
        'ai-client-advisor-config.html': {
            title: '客户端顾问配置',
            description: '把具体的 Advisor 绑定到客户端上，并配置使用参数。',
            impact: '这里决定“某个客户端实际启用了哪些顾问能力”。'
        },
        'ai-client-model.html': {
            title: '客户端模型管理',
            description: '维护模型连接信息，包括 baseUrl、API Key、模型版本和超时时间。',
            impact: '这里决定“系统如何连接模型服务”，是最核心的运行时配置之一。'
        },
        'ai-client-model-config.html': {
            title: '客户端模型配置',
            description: '把客户端绑定到具体模型，并补充模型参数。',
            impact: '这里决定“某个客户端实际使用哪个模型连接配置”。'
        },
        'ai-client-system-prompt.html': {
            title: '系统提示词管理',
            description: '维护系统提示词模板，给客户端提供默认角色设定和约束。',
            impact: '这里决定“模型默认以什么身份、什么规则进行回答”。'
        },
        'ai-client-tool-config.html': {
            title: '客户端工具配置',
            description: '把 MCP 工具绑定到客户端上，让客户端具备可调用的外部能力。',
            impact: '这里决定“某个客户端实际可以调用哪些工具”。'
        },
        'ai-client-tool-mcp.html': {
            title: 'MCP工具管理',
            description: '定义 MCP 工具本身的连接方式，例如 SSE、stdio、地址和命令。',
            impact: '这里决定“工具服务怎么连”，属于工具定义层。'
        },
        'ai-rag-order.html': {
            title: 'RAG订单管理',
            description: '维护知识库条目元信息，用于在对话中选择知识库来源。',
            impact: '这里决定“对话可选哪些知识库标签”，向量内容本体在 pgvector 中。'
        },
        'index.html': {
            title: '后台管理',
            description: '统一查看和维护智能体、模型、工具、知识库与业务场景配置。',
            impact: '建议从“AI智能体管理”或“接口巡检配置”开始使用。'
        }
    };

    const navGroups = [
        {
            label: '智能体编排',
            items: [
                ['ai-agent.html', 'fa-robot', 'AI智能体管理'],
                ['ai-agent-client.html', 'fa-link', '智能体客户端关联'],
                ['ai-agent-task.html', 'fa-tasks', 'AI代理任务调度']
            ]
        },
        {
            label: '模型与提示词',
            items: [
                ['ai-client-model.html', 'fa-microchip', '客户端模型管理'],
                ['ai-client-model-config.html', 'fa-cogs', '客户端模型配置'],
                ['ai-client-system-prompt.html', 'fa-comment-dots', '系统提示词管理']
            ]
        },
        {
            label: '增强能力',
            items: [
                ['ai-client-advisor.html', 'fa-user-tie', '客户端顾问管理'],
                ['ai-client-advisor-config.html', 'fa-sliders', '客户端顾问配置'],
                ['ai-client-tool-mcp.html', 'fa-screwdriver-wrench', 'MCP工具管理'],
                ['ai-client-tool-config.html', 'fa-toolbox', '客户端工具配置'],
                ['ai-rag-order.html', 'fa-database', 'RAG订单管理']
            ]
        },
        {
            label: '业务场景',
            items: [
                ['ai-api-patrol.html', 'fa-network-wired', '接口巡检配置'],
                ['ai-api-patrol-result.html', 'fa-clipboard-check', '巡检结果记录']
            ]
        }
    ];

    function currentPage() {
        const path = window.location.pathname;
        return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    }

    function renderSidebar() {
        const sidebarBody = document.querySelector('nav.sidebar .position-sticky, #sidebarMenu .position-sticky');
        if (!sidebarBody) {
            return;
        }

        const page = currentPage();
        const html = navGroups.map(group => {
            const itemsHtml = group.items.map(([file, icon, label]) => {
                const active = file === page ? 'active' : '';
                return `
                    <li class="nav-item">
                        <a class="nav-link ${active}" href="${file}">
                            <i class="fas ${icon}"></i> ${label}
                        </a>
                    </li>
                `;
            }).join('');

            return `
                <div class="admin-nav-group">
                    <div class="admin-nav-group-title">${group.label}</div>
                    <ul class="nav flex-column">${itemsHtml}</ul>
                </div>
            `;
        }).join('');

        sidebarBody.innerHTML = html;
    }

    function updateHeaderAndTitle() {
        const page = currentPage();
        const config = pageConfigs[page] || pageConfigs['index.html'];
        document.title = `${config.title} - AI Agent Console`;

        const brand = document.querySelector('.navbar-brand');
        if (brand) {
            brand.textContent = 'AI Agent Console';
            const href = window.location.pathname.includes('/admin/page/') ? '../index.html' : 'index.html';
            brand.setAttribute('href', href);
        }

        const heading = document.querySelector('main h1.h2, main h1.h3, main .border-bottom h1');
        if (heading) {
            heading.textContent = config.title;
        }
    }

    function renderPageIntro() {
        const page = currentPage();
        const config = pageConfigs[page];
        if (!config) {
            return;
        }

        const main = document.querySelector('main');
        const anchor = main?.querySelector('.border-bottom');
        if (!main || !anchor || main.querySelector('.page-intro-card')) {
            return;
        }

        const intro = document.createElement('div');
        intro.className = 'alert alert-light border page-intro-card mt-3 mb-3';
        intro.innerHTML = `
            <div class="fw-bold mb-2">${config.title}</div>
            <div class="mb-1">${config.description}</div>
            <div class="text-muted small">${config.impact}</div>
        `;
        anchor.insertAdjacentElement('afterend', intro);
    }

    function injectStyles() {
        if (document.getElementById('admin-layout-style')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'admin-layout-style';
        style.textContent = `
            .admin-nav-group {
                margin-bottom: 1rem;
            }
            .admin-nav-group-title {
                padding: 0.25rem 1rem;
                color: #6c757d;
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }
            .page-intro-card {
                background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
            }
        `;
        document.head.appendChild(style);
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        renderSidebar();
        updateHeaderAndTitle();
        renderPageIntro();
    });
})();
