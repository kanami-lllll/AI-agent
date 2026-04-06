const ClientModelManager = {
    currentPage: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
    deleteClientModelId: null,

    init() {
        this.bindEvents();
        this.loadClientModelList();
        this.loadCurrentChatModelSetting();
    },

    bindEvents() {
        $('#btn-search-model').on('click', () => {
            this.currentPage = 1;
            this.loadClientModelList();
        });

        $('#search-model-name').on('keypress', (event) => {
            if (event.which === 13) {
                this.currentPage = 1;
                this.loadClientModelList();
            }
        });

        $('#btn-add-client-model').on('click', () => {
            this.showClientModelModal();
        });

        $('#btn-save-client-model').on('click', () => {
            this.saveClientModel();
        });

        $('#btn-confirm-delete').on('click', () => {
            this.deleteClientModel();
        });

        $('#btn-toggle-api-key').on('click', () => {
            this.togglePasswordInput('#client-model-api-key', '#btn-toggle-api-key');
        });

        $('#btn-toggle-current-chat-api-key').on('click', () => {
            this.togglePasswordInput('#current-chat-model-api-key', '#btn-toggle-current-chat-api-key');
        });

        $('#btn-save-current-chat-model').on('click', () => {
            this.saveCurrentChatModelSetting();
        });

        $('#btn-switch-current-chat-model').on('click', () => {
            this.switchCurrentChatModel();
        });
    },

    togglePasswordInput(inputSelector, buttonSelector) {
        const input = $(inputSelector);
        const currentType = input.attr('type');
        const nextType = currentType === 'password' ? 'text' : 'password';
        input.attr('type', nextType);
        $(buttonSelector).text(nextType === 'password' ? '显示' : '隐藏');
    },

    loadClientModelList() {
        const params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
            modelName: $('#search-model-name').val()
        };

        $.ajax({
            url: ApiConfig.getApiUrl('/ai/admin/client/model/queryClientModelList'),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
            success: (res) => {
                this.renderClientModelList(res || []);
                this.renderCurrentModelOptions(res || []);
                this.renderPagination();
            },
            error: () => {
                alert('加载客户端模型列表失败');
            }
        });
    },

    loadCurrentChatModelSetting() {
        $.ajax({
            url: ApiConfig.getApiUrl('/ai/admin/client/model/queryCurrentChatModelSetting'),
            type: 'GET',
            success: (res) => {
                this.renderCurrentChatModelSetting(res);
            },
            error: () => {
                $('#current-chat-model-meta').text('加载当前聊天模型信息失败');
            }
        });
    },

    renderCurrentChatModelSetting(model) {
        if (!model) {
            $('#current-chat-model-meta').text('当前没有可用的首页聊天模型配置。');
            return;
        }

        $('#current-chat-model-meta').html(`
            当前首页智能体：<strong>${this.escapeHtml(model.agentName || '-')}</strong>
            <span class="mx-2">|</span>
            客户端 ID：<strong>${model.clientId || '-'}</strong>
            <span class="mx-2">|</span>
            当前模型：<strong>${this.escapeHtml(model.modelName || '-')}</strong>
        `);

        $('#current-chat-model-select').val(String(model.id));
        $('#current-chat-model-name').val(model.modelName || '');
        $('#current-chat-model-type').val(model.modelType || 'openai');
        $('#current-chat-model-version').val(model.modelVersion || '');
        $('#current-chat-model-base-url').val(model.baseUrl || '');
        $('#current-chat-model-api-key').val(model.apiKey || '');
        $('#current-chat-model-completions-path').val(model.completionsPath || 'v1/chat/completions');
        $('#current-chat-model-embeddings-path').val(model.embeddingsPath || 'v1/embeddings');
        $('#current-chat-model-timeout').val(model.timeout || 30);
    },

    renderCurrentModelOptions(data) {
        const select = $('#current-chat-model-select');
        const selectedValue = select.val();
        select.empty();

        if (!data || data.length === 0) {
            select.append('<option value="">暂无可切换模型</option>');
            return;
        }

        data.forEach((item) => {
            select.append(`<option value="${item.id}">${this.escapeHtml(item.modelName || `模型 ${item.id}`)}</option>`);
        });

        if (selectedValue) {
            select.val(selectedValue);
        }
    },

    renderClientModelList(data) {
        if (!data || data.length === 0) {
            $('#client-model-list').html('<tr><td colspan="9" class="text-center">暂无数据</td></tr>');
            this.total = 0;
            this.pages = 0;
            return;
        }

        this.total = data[0].total || 0;
        this.pages = data[0].pages || 0;

        const html = data.map((item) => `
            <tr>
                <td>${item.id}</td>
                <td>${this.escapeHtml(item.modelName || '-')}</td>
                <td class="d-none d-md-table-cell">${this.escapeHtml(item.modelType || '-')}</td>
                <td class="d-none d-lg-table-cell">${this.escapeHtml(item.baseUrl || '-')}</td>
                <td class="d-none d-lg-table-cell">${this.escapeHtml(item.modelVersion || '-')}</td>
                <td class="d-none d-xl-table-cell masked-key">${this.maskApiKey(item.apiKey)}</td>
                <td>${item.status === 1 ? '<span class="badge bg-success">启用</span>' : '<span class="badge bg-secondary">禁用</span>'}</td>
                <td class="d-none d-md-table-cell">${this.formatDate(item.updateTime)}</td>
                <td>
                    <div class="d-flex flex-wrap gap-1">
                        <button class="btn btn-sm btn-outline-primary" onclick="ClientModelManager.editClientModel(${item.id})">
                            <i class="fas fa-edit"></i><span class="d-none d-md-inline"> 编辑</span>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="ClientModelManager.showDeleteModal(${item.id})">
                            <i class="fas fa-trash"></i><span class="d-none d-md-inline"> 删除</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        $('#client-model-list').html(html);
    },

    renderPagination() {
        if (this.pages <= 1) {
            $('#pagination').html('');
            return;
        }

        let html = `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" onclick="ClientModelManager.goToPage(${this.currentPage - 1})">上一页</a>
            </li>
        `;

        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.pages, startPage + 4);

        for (let i = startPage; i <= endPage; i += 1) {
            html += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0);" onclick="ClientModelManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }

        html += `
            <li class="page-item ${this.currentPage === this.pages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" onclick="ClientModelManager.goToPage(${this.currentPage + 1})">下一页</a>
            </li>
        `;

        $('#pagination').html(html);
    },

    goToPage(page) {
        if (page < 1 || page > this.pages) {
            return;
        }

        this.currentPage = page;
        this.loadClientModelList();
    },

    showClientModelModal(clientModel) {
        $('#clientModelForm')[0].reset();
        $('#client-model-id').val('');
        $('#btn-toggle-api-key').text('显示');
        $('#client-model-api-key').attr('type', 'password');

        if (clientModel) {
            $('#clientModelModalLabel').text('编辑客户端模型');
            $('#client-model-id').val(clientModel.id);
            $('#client-model-name').val(clientModel.modelName || '');
            $('#client-model-type').val(clientModel.modelType || 'openai');
            $('#client-model-version').val(clientModel.modelVersion || '');
            $('#client-model-base-url').val(clientModel.baseUrl || '');
            $('#client-model-api-key').val(clientModel.apiKey || '');
            $('#client-model-completions-path').val(clientModel.completionsPath || 'v1/chat/completions');
            $('#client-model-embeddings-path').val(clientModel.embeddingsPath || 'v1/embeddings');
            $('#client-model-timeout').val(clientModel.timeout || 30);
            $('#client-model-status').val(clientModel.status ?? 1);
        } else {
            $('#clientModelModalLabel').text('新增客户端模型');
            $('#client-model-type').val('openai');
            $('#client-model-completions-path').val('v1/chat/completions');
            $('#client-model-embeddings-path').val('v1/embeddings');
            $('#client-model-timeout').val(30);
            $('#client-model-status').val(1);
        }

        const modal = new bootstrap.Modal(document.getElementById('clientModelModal'));
        modal.show();
    },

    editClientModel(id) {
        $.ajax({
            url: ApiConfig.getApiUrl(`/ai/admin/client/model/queryClientModelById?id=${id}`),
            type: 'GET',
            success: (res) => {
                this.showClientModelModal(res);
            },
            error: () => {
                alert('获取客户端模型详情失败');
            }
        });
    },

    saveClientModel() {
        const params = this.collectModelForm('#client-model');
        const id = $('#client-model-id').val();

        if (!this.validateModelForm(params)) {
            return;
        }

        const url = id
            ? '/ai/admin/client/model/updateClientModel'
            : '/ai/admin/client/model/addClientModel';

        if (id) {
            params.id = parseInt(id, 10);
        }

        $.ajax({
            url: ApiConfig.getApiUrl(url),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
            success: (res) => {
                if (!res) {
                    alert(id ? '更新失败' : '新增失败');
                    return;
                }

                bootstrap.Modal.getInstance(document.getElementById('clientModelModal')).hide();
                this.loadClientModelList();
                this.loadCurrentChatModelSetting();
                alert(id ? '更新成功' : '新增成功');
            },
            error: () => {
                alert(id ? '更新客户端模型失败' : '新增客户端模型失败');
            }
        });
    },

    saveCurrentChatModelSetting() {
        const params = this.collectModelForm('#current-chat-model');
        params.status = 1;

        if (!this.validateModelForm(params)) {
            return;
        }

        $.ajax({
            url: ApiConfig.getApiUrl('/ai/admin/client/model/updateCurrentChatModelSetting'),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
            success: (res) => {
                if (!res) {
                    alert('保存当前聊天模型失败');
                    return;
                }

                this.loadClientModelList();
                this.loadCurrentChatModelSetting();
                alert('当前聊天模型已更新并立即生效');
            },
            error: () => {
                alert('更新当前聊天模型失败');
            }
        });
    },

    switchCurrentChatModel() {
        const targetModelId = $('#current-chat-model-select').val();
        if (!targetModelId) {
            alert('请先选择一个可切换模型');
            return;
        }

        $.ajax({
            url: ApiConfig.getApiUrl('/ai/admin/client/model/switchCurrentChatModel'),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: parseInt(targetModelId, 10) }),
            success: (res) => {
                if (!res) {
                    alert('切换当前聊天模型失败');
                    return;
                }

                this.loadClientModelList();
                this.loadCurrentChatModelSetting();
                alert('当前聊天模型已切换并立即生效');
            },
            error: () => {
                alert('切换当前聊天模型失败');
            }
        });
    },

    collectModelForm(prefix) {
        return {
            modelName: $(`${prefix}-name`).val().trim(),
            modelType: $(`${prefix}-type`).val(),
            modelVersion: $(`${prefix}-version`).val().trim(),
            baseUrl: $(`${prefix}-base-url`).val().trim(),
            apiKey: $(`${prefix}-api-key`).val().trim(),
            completionsPath: $(`${prefix}-completions-path`).val().trim(),
            embeddingsPath: $(`${prefix}-embeddings-path`).val().trim(),
            timeout: parseInt($(`${prefix}-timeout`).val(), 10)
        };
    },

    validateModelForm(params) {
        if (!params.modelName) {
            alert('请输入模型名称');
            return false;
        }
        if (!params.baseUrl) {
            alert('请输入 Base URL');
            return false;
        }
        if (!params.apiKey) {
            alert('请输入 API Key');
            return false;
        }
        if (!params.modelVersion) {
            alert('请输入模型版本');
            return false;
        }
        if (!params.timeout || params.timeout <= 0) {
            alert('超时时间必须大于 0');
            return false;
        }
        return true;
    },

    showDeleteModal(id) {
        this.deleteClientModelId = id;
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    },

    deleteClientModel() {
        if (!this.deleteClientModelId) {
            return;
        }

        $.ajax({
            url: ApiConfig.getApiUrl(`/ai/admin/client/model/deleteClientModel?id=${this.deleteClientModelId}`),
            type: 'GET',
            success: (res) => {
                if (!res) {
                    alert('删除失败');
                    return;
                }

                bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
                this.loadClientModelList();
                this.loadCurrentChatModelSetting();
                alert('删除成功');
            },
            error: () => {
                alert('删除客户端模型失败');
            }
        });
    },

    maskApiKey(apiKey) {
        if (!apiKey) {
            return '-';
        }
        if (apiKey.length <= 8) {
            return `${apiKey.slice(0, 2)}****`;
        }
        return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`;
    },

    escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    },

    formatDate(dateStr) {
        if (!dateStr) {
            return '-';
        }
        return new Date(dateStr).toLocaleString();
    }
};

$(document).ready(() => {
    ClientModelManager.init();
});
