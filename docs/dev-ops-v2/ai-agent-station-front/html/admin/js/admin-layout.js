(() => {
    const pageConfigs = {
        'index.html': {
            title: '后台管理',
            summary: '统一维护智能体、模型、提示词、工具、知识库和业务场景配置。',
            role: '如果你第一次进入后台，建议先从“客户端模型管理”或“接口巡检配置”开始。',
            impact: '这里不是一个普通 CRUD 后台，而是“配置驱动”的运行控制台。',
            steps: [
                '先确认首页聊天当前使用的模型连接是否正确。',
                '再决定要不要继续配置提示词、顾问、工具和知识库。',
                '如果你只关心接口巡检场景，优先进入“接口巡检配置”和“巡检结果记录”。'
            ],
            next: [
                ['ai-client-model.html', '先设置当前对话模型'],
                ['ai-api-patrol.html', '进入接口巡检配置'],
                ['ai-agent.html', '查看智能体定义']
            ]
        },
        'ai-agent.html': {
            title: 'AI智能体管理',
            summary: '定义系统里有哪些智能体可用，包括名称、描述、通道和启用状态。',
            role: '这页定义“智能体本身是谁”，但不直接决定它用哪个模型或工具。',
            impact: '如果某个智能体被禁用，首页和任务调度都不会再使用它。',
            steps: [
                '先新增或编辑智能体基础信息。',
                '再到“智能体客户端关联”里给它绑定执行链路。',
                '如果它要定时执行，再去“AI代理任务调度”配置 cron。'
            ],
            next: [
                ['ai-agent-client.html', '继续绑定客户端链路'],
                ['ai-agent-task.html', '为智能体配置定时任务']
            ]
        },
        'ai-agent-client.html': {
            title: '智能体客户端关联',
            summary: '把智能体和客户端绑定起来，并决定执行顺序。',
            role: '这页决定“一个智能体最终由哪些客户端组成”。',
            impact: '顺序不同，最终上下文传递和输出结果也会不同。',
            steps: [
                '为某个智能体选择 1 个或多个客户端。',
                '通过 sequence 控制执行顺序。',
                '确认客户端本身已经绑定模型、提示词、顾问或工具。'
            ],
            next: [
                ['ai-client-model-config.html', '给客户端绑定模型'],
                ['ai-client-system-prompt.html', '维护系统提示词']
            ]
        },
        'ai-agent-task.html': {
            title: 'AI代理任务调度',
            summary: '给智能体配置 cron 任务，让它自动执行。',
            role: '这页把“会对话的智能体”升级成“会自动跑的任务”。',
            impact: '任务一旦启用，系统会在后台按时间表达式自动触发。',
            steps: [
                '选择要执行的智能体。',
                '配置 cron 表达式和任务参数。',
                '确认目标智能体已经能正常工作，再打开调度。'
            ],
            next: [
                ['ai-agent.html', '回看智能体定义'],
                ['ai-agent-client.html', '确认执行链路']
            ]
        },
        'ai-client-model.html': {
            title: '客户端模型管理',
            summary: '维护模型连接信息，并直接控制首页聊天当前使用的模型。',
            role: '这是最直接影响首页对话体验的页面。',
            impact: '修改当前对话模型设置后，首页聊天会立即使用新的 Base URL、API Key 和模型版本。',
            steps: [
                '优先使用页面顶部的“当前对话模型设置”。',
                '如果只是替换当前模型服务，直接改 Base URL、API Key 和模型版本即可。',
                '如果你有多个模型连接，先在下方新增，再通过顶部快速切换。'
            ],
            next: [
                ['ai-client-model-config.html', '查看客户端绑定了哪个模型'],
                ['ai-agent.html', '确认首页用的是哪个智能体']
            ]
        },
        'ai-client-model-config.html': {
            title: '客户端模型配置',
            summary: '把客户端绑定到具体模型连接。',
            role: '模型管理是“定义模型”，这页是“客户端实际使用哪个模型”。',
            impact: '如果客户端没绑定模型，就算模型连接本身存在，也不会被真正调用。',
            steps: [
                '选择目标客户端。',
                '绑定一个已有模型。',
                '如有多客户端链路，分别确认每个客户端的模型配置。'
            ],
            next: [
                ['ai-client-model.html', '先维护模型连接'],
                ['ai-agent-client.html', '确认客户端属于哪个智能体']
            ]
        },
        'ai-client-system-prompt.html': {
            title: '系统提示词管理',
            summary: '维护系统提示词模板，用来控制模型的默认角色和回答风格。',
            role: '这里定义“模型默认以什么身份说话”。',
            impact: '提示词会显著影响回答风格、约束条件和输出结构。',
            steps: [
                '新增或编辑一条提示词模板。',
                '再通过客户端配置把提示词绑定给某个客户端。',
                '如果首页表现不符合预期，优先检查这里。'
            ],
            next: [
                ['ai-agent-client.html', '确认智能体使用了哪个客户端'],
                ['ai-client-model-config.html', '确认客户端绑定链路']
            ]
        },
        'ai-client-advisor.html': {
            title: '客户端顾问管理',
            summary: '定义可复用的增强能力，例如会话记忆和 RAG 检索。',
            role: '这里是“能力定义层”，不是实际生效层。',
            impact: '只在客户端绑定了 Advisor 后，这些能力才会真正参与运行。',
            steps: [
                '先定义顾问类型和参数。',
                '再到顾问配置页面把它绑定给客户端。',
                '如果是知识库增强，记得同时准备 RAG 数据。'
            ],
            next: [
                ['ai-client-advisor-config.html', '给客户端绑定顾问'],
                ['ai-rag-order.html', '查看知识库标签']
            ]
        },
        'ai-client-advisor-config.html': {
            title: '客户端顾问配置',
            summary: '把顾问能力绑定到具体客户端。',
            role: '这里决定“某个客户端实际上启用了哪些增强能力”。',
            impact: '比如记忆、RAG 等能力只有绑定后才会参与对话。',
            steps: [
                '选择客户端。',
                '选择要启用的 Advisor。',
                '如果发现首页没有上下文或没有知识库效果，先检查这里。'
            ],
            next: [
                ['ai-client-advisor.html', '先定义顾问能力'],
                ['ai-rag-order.html', '确认 RAG 数据存在']
            ]
        },
        'ai-client-tool-mcp.html': {
            title: 'MCP工具管理',
            summary: '定义一个 MCP 工具服务怎么连接，例如 sse、stdio、命令参数和地址。',
            role: '这是工具定义层。',
            impact: '如果这里配置错了，客户端工具绑定也不会生效。',
            steps: [
                '先定义工具本身的连接信息。',
                '确认工具服务地址或命令可用。',
                '再去客户端工具配置把它绑定给客户端。'
            ],
            next: [
                ['ai-client-tool-config.html', '把工具绑定给客户端']
            ]
        },
        'ai-client-tool-config.html': {
            title: '客户端工具配置',
            summary: '把 MCP 工具绑定到客户端，让客户端具备外部执行能力。',
            role: '工具管理是“定义工具”，这页是“客户端实际能用什么工具”。',
            impact: '只有绑定成功，客户端在运行时才会拥有调用工具的能力。',
            steps: [
                '先确认 MCP 工具已经存在。',
                '把目标工具绑定给客户端。',
                '如果工具调用没效果，先检查工具定义和这里的绑定关系。'
            ],
            next: [
                ['ai-client-tool-mcp.html', '回看 MCP 工具定义']
            ]
        },
        'ai-rag-order.html': {
            title: 'RAG订单管理',
            summary: '维护知识库条目元信息，用于首页和对话链路选择知识库。',
            role: '这里不是向量内容本身，而是知识库标签入口。',
            impact: '如果这里没有对应条目，首页就无法选择对应知识库。',
            steps: [
                '确认已经上传过知识库。',
                '查看知识库名称和标签。',
                '如果想在对话中引用知识库，先确认这里有可选项。'
            ],
            next: [
                ['../upload.html', '去上传知识库文件']
            ]
        },
        'ai-api-patrol.html': {
            title: '接口巡检配置',
            summary: '配置要巡检的接口、断言规则和定时策略。',
            role: '这是当前项目最明确的业务场景入口。',
            impact: '这里决定系统会对哪些接口发请求，以及怎样判断它们是否正常。',
            steps: [
                '配置请求方法、URL、请求头和请求体。',
                '设置状态码、JSON 字段和响应时间断言。',
                '先手动执行验证，再决定要不要打开定时任务。'
            ],
            next: [
                ['ai-api-patrol-result.html', '查看巡检结果和 AI 报告']
            ]
        },
        'ai-api-patrol-result.html': {
            title: '巡检结果记录',
            summary: '查看每次接口巡检的成功率、失败原因和 AI 生成的回归报告。',
            role: '这是巡检场景的结果面板。',
            impact: '这里的结果最适合拿来验证场景是否真正可用。',
            steps: [
                '先执行一次巡检。',
                '查看返回码、耗时和失败信息。',
                '重点关注 AI 报告是否能总结出异常接口和建议方向。'
            ],
            next: [
                ['ai-api-patrol.html', '回到巡检配置继续调整规则']
            ]
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

    function isAdminPageDetail() {
        return window.location.pathname.includes('/admin/page/');
    }

    function buildPageHref(file) {
        return isAdminPageDetail() ? file : `page/${file}`;
    }

    function renderSidebar() {
        const sidebarBody = document.querySelector('nav.sidebar .position-sticky, #sidebarMenu .position-sticky');
        if (!sidebarBody) {
            return;
        }

        const page = currentPage();
        const html = navGroups.map((group) => {
            const itemsHtml = group.items.map(([file, icon, label]) => {
                const active = file === page ? 'active' : '';
                return `
                    <li class="nav-item">
                        <a class="nav-link ${active}" href="${buildPageHref(file)}">
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
            const href = isAdminPageDetail() ? '../index.html' : 'index.html';
            brand.setAttribute('href', href);
        }

        const heading = document.querySelector('main h1.h2, main h1.h3, main .border-bottom h1');
        if (heading) {
            heading.textContent = config.title;
        }
    }

    function renderLinks(items) {
        if (!items || items.length === 0) {
            return '';
        }

        return items.map(([file, text]) => `
            <a class="btn btn-sm btn-outline-primary me-2 mb-2" href="${buildPageHref(file)}">${text}</a>
        `).join('');
    }

    function renderSteps(steps) {
        if (!steps || steps.length === 0) {
            return '';
        }

        return `
            <ol class="mb-0 ps-3">
                ${steps.map((step) => `<li class="mb-1">${step}</li>`).join('')}
            </ol>
        `;
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
        intro.className = 'card border-0 shadow-sm page-intro-card mt-3 mb-3';
        intro.innerHTML = `
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-lg-4">
                        <div class="intro-block-title">本页作用</div>
                        <div>${config.summary}</div>
                    </div>
                    <div class="col-lg-4">
                        <div class="intro-block-title">会影响什么</div>
                        <div>${config.impact}</div>
                    </div>
                    <div class="col-lg-4">
                        <div class="intro-block-title">怎么用</div>
                        <div class="text-muted small mb-2">${config.role}</div>
                        ${renderSteps(config.steps)}
                    </div>
                </div>
                ${config.next && config.next.length ? `
                    <hr class="my-3">
                    <div class="intro-block-title mb-2">推荐下一步</div>
                    <div>${renderLinks(config.next)}</div>
                ` : ''}
            </div>
        `;
        anchor.insertAdjacentElement('afterend', intro);
    }

    function renderIndexOverview() {
        if (currentPage() !== 'index.html') {
            return;
        }

        const main = document.querySelector('main');
        const anchor = main?.querySelector('.border-bottom');
        if (!main || !anchor || main.querySelector('.admin-overview-card')) {
            return;
        }

        const card = document.createElement('div');
        card.className = 'card border-0 shadow-sm admin-overview-card mt-3 mb-4';
        card.innerHTML = `
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-lg-4">
                        <div class="overview-title">1. 先配当前聊天模型</div>
                        <div class="text-muted small">先把首页聊天实际使用的模型服务配通，再谈提示词、工具和顾问。</div>
                        <div class="mt-2">${renderLinks([['ai-client-model.html', '打开模型设置']])}</div>
                    </div>
                    <div class="col-lg-4">
                        <div class="overview-title">2. 再理解配置驱动链路</div>
                        <div class="text-muted small">智能体定义、客户端绑定、模型配置、提示词、顾问和工具是分层配置的。</div>
                        <div class="mt-2">${renderLinks([
                            ['ai-agent.html', '看智能体定义'],
                            ['ai-agent-client.html', '看客户端关联']
                        ])}</div>
                    </div>
                    <div class="col-lg-4">
                        <div class="overview-title">3. 最后进入业务场景</div>
                        <div class="text-muted small">如果你主要关注接口巡检，这部分已经是当前项目最完整、最容易验证的业务模块。</div>
                        <div class="mt-2">${renderLinks([
                            ['ai-api-patrol.html', '配置巡检接口'],
                            ['ai-api-patrol-result.html', '查看巡检结果']
                        ])}</div>
                    </div>
                </div>
            </div>
        `;

        anchor.insertAdjacentElement('afterend', card);
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
            .intro-block-title,
            .overview-title {
                font-size: 0.85rem;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        renderSidebar();
        updateHeaderAndTitle();
        renderPageIntro();
        renderIndexOverview();
    });
})();
