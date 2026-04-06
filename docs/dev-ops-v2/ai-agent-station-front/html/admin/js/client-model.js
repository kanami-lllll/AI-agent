const ClientModelManager = {
    currentPage: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
    deleteClientModelId: null,

    init() {
        this.bindEvents();
        this.loadClientModelList();
    },

    bindEvents() {
        $('#btn-search-model').on('click', () => {
            this.currentPage = 1;
            this.loadClientModelList();
        });

        $('#search-model-name').on('keypress', (e) => {
            if (e.which === 13) {
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
            const input = $('#client-model-api-key');
            const currentType = input.attr('type');
            const nextType = currentType === 'password' ? 'text' : 'password';
            input.attr('type', nextType);
            $('#btn-toggle-api-key').text(nextType === 'password' ? '显示' : '隐藏');
        });
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
                this.renderClientModelList(res);
                this.renderPagination();
            },
            error: () => {
                alert('加载客户端模型列表失败');
            }
        });
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

        const html = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.modelName || '-'}</td>
                <td class="d-none d-md-table-cell">${item.modelType || '-'}</td>
                <td class="d-none d-lg-table-cell">${this.escapeHtml(item.baseUrl || '-')}</td>
                <td class="d-none d-lg-table-cell">${item.modelVersion || '-'}</td>
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
        const params = {
            modelName: $('#client-model-name').val().trim(),
            modelType: $('#client-model-type').val(),
            modelVersion: $('#client-model-version').val().trim(),
            baseUrl: $('#client-model-base-url').val().trim(),
            apiKey: $('#client-model-api-key').val().trim(),
            completionsPath: $('#client-model-completions-path').val().trim(),
            embeddingsPath: $('#client-model-embeddings-path').val().trim(),
            timeout: parseInt($('#client-model-timeout').val(), 10),
            status: parseInt($('#client-model-status').val(), 10)
        };

        if (!params.modelName) {
            alert('请输入模型名称');
            return;
        }
        if (!params.baseUrl) {
            alert('请输入基础地址');
            return;
        }
        if (!params.apiKey) {
            alert('请输入 API Key');
            return;
        }
        if (!params.modelVersion) {
            alert('请输入模型版本');
            return;
        }
        if (!params.timeout || params.timeout <= 0) {
            alert('超时时间必须大于 0');
            return;
        }

        const id = $('#client-model-id').val();
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
                alert(id ? '更新成功' : '新增成功');
            },
            error: () => {
                alert(id ? '更新客户端模型失败' : '新增客户端模型失败');
            }
        });
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
        return value
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
