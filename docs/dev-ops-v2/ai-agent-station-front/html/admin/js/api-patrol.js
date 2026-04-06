const ApiPatrolManager = {
    init: function () {
        this.bindEvents();
        this.loadList();
    },

    bindEvents: function () {
        $('#btn-search-patrol').on('click', () => this.loadList());
        $('#search-patrol-name').on('keypress', (e) => {
            if (e.which === 13) this.loadList();
        });
        $('#btn-add-patrol').on('click', () => this.showModal());
        $('#btn-save-patrol').on('click', () => this.save());
    },

    loadList: function () {
        const params = {
            patrolName: $('#search-patrol-name').val()
        };

        $.ajax({
            url: ApiConfig.getApiUrl('/ai/admin/api/patrol/queryApiPatrolConfigList'),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
            success: (res) => this.renderList(res || []),
            error: () => alert('加载巡检配置失败')
        });
    },

    renderList: function (list) {
        if (!list.length) {
            $('#patrol-list').html('<tr><td colspan="10" class="text-center">暂无数据</td></tr>');
            return;
        }

        let html = '';
        list.forEach(item => {
            html += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.patrolName || '-'}</td>
                    <td>${item.requestMethod || '-'}</td>
                    <td class="text-break">${item.requestUrl || '-'}</td>
                    <td>${item.expectedStatusCode || '-'}</td>
                    <td>${item.maxResponseTime || '-'} ms</td>
                    <td>${item.status === 1 ? '<span class="badge bg-success">启用</span>' : '<span class="badge bg-secondary">禁用</span>'}</td>
                    <td>${item.taskStatus === 1 ? '<span class="badge bg-primary">已调度</span>' : '<span class="badge bg-light text-dark">未调度</span>'}</td>
                    <td class="text-break">${item.cronExpression || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1 mb-1" onclick="ApiPatrolManager.edit(${item.id})">编辑</button>
                        <button class="btn btn-sm btn-outline-success me-1 mb-1" onclick="ApiPatrolManager.execute(${item.id})">执行</button>
                        <button class="btn btn-sm btn-outline-info me-1 mb-1" onclick="ApiPatrolManager.viewLatestResult(${item.id})">最近结果</button>
                        <button class="btn btn-sm btn-outline-danger mb-1" onclick="ApiPatrolManager.remove(${item.id})">删除</button>
                    </td>
                </tr>
            `;
        });

        $('#patrol-list').html(html);
    },

    showModal: function (item) {
        $('#patrolForm')[0].reset();
        $('#patrol-id').val('');
        $('#patrol-status').val('1');
        $('#patrol-task-status').val('0');
        $('#patrol-timeout').val('5000');
        $('#patrol-expected-status-code').val('200');
        $('#patrol-max-response-time').val('3000');

        if (item) {
            $('#patrolModalLabel').text('编辑巡检配置');
            $('#patrol-id').val(item.id);
            $('#patrol-name').val(item.patrolName);
            $('#patrol-method').val(item.requestMethod || 'GET');
            $('#patrol-url').val(item.requestUrl);
            $('#patrol-headers').val(item.requestHeaders);
            $('#patrol-body').val(item.requestBody);
            $('#patrol-timeout').val(item.timeout);
            $('#patrol-expected-status-code').val(item.expectedStatusCode);
            $('#patrol-expected-json-field').val(item.expectedJsonField);
            $('#patrol-max-response-time').val(item.maxResponseTime);
            $('#patrol-status').val(item.status);
            $('#patrol-task-status').val(item.taskStatus || 0);
            $('#patrol-cron-expression').val(item.cronExpression);
            $('#patrol-remark').val(item.remark);
        } else {
            $('#patrolModalLabel').text('新增巡检配置');
        }

        new bootstrap.Modal(document.getElementById('patrolModal')).show();
    },

    edit: function (id) {
        $.ajax({
            url: ApiConfig.getApiUrl(`/ai/admin/api/patrol/queryApiPatrolConfigById?id=${id}`),
            type: 'GET',
            success: (res) => this.showModal(res),
            error: () => alert('获取巡检配置失败')
        });
    },

    save: function () {
        const payload = {
            patrolName: $('#patrol-name').val(),
            requestMethod: $('#patrol-method').val(),
            requestUrl: $('#patrol-url').val(),
            requestHeaders: $('#patrol-headers').val(),
            requestBody: $('#patrol-body').val(),
            timeout: parseInt($('#patrol-timeout').val() || '5000', 10),
            expectedStatusCode: parseInt($('#patrol-expected-status-code').val() || '200', 10),
            expectedJsonField: $('#patrol-expected-json-field').val(),
            maxResponseTime: parseInt($('#patrol-max-response-time').val() || '3000', 10),
            status: parseInt($('#patrol-status').val() || '1', 10),
            taskStatus: parseInt($('#patrol-task-status').val() || '0', 10),
            cronExpression: $('#patrol-cron-expression').val(),
            remark: $('#patrol-remark').val()
        };

        if (!payload.patrolName || !payload.requestMethod || !payload.requestUrl) {
            alert('请至少填写巡检名称、请求方法和请求 URL');
            return;
        }

        if (payload.taskStatus === 1 && !payload.cronExpression) {
            alert('启用定时巡检时必须填写 cron 表达式');
            return;
        }

        const id = $('#patrol-id').val();
        const url = id
            ? '/ai/admin/api/patrol/updateApiPatrolConfig'
            : '/ai/admin/api/patrol/addApiPatrolConfig';

        if (id) {
            payload.id = parseInt(id, 10);
        }

        $.ajax({
            url: ApiConfig.getApiUrl(url),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: (res) => {
                if (!res) {
                    alert('保存失败');
                    return;
                }
                bootstrap.Modal.getInstance(document.getElementById('patrolModal')).hide();
                this.loadList();
            },
            error: () => alert('保存巡检配置失败')
        });
    },

    remove: function (id) {
        if (!confirm('确认删除这条巡检配置吗？')) {
            return;
        }

        $.ajax({
            url: ApiConfig.getApiUrl(`/ai/admin/api/patrol/deleteApiPatrolConfig?id=${id}`),
            type: 'GET',
            success: (res) => {
                if (!res) {
                    alert('删除失败');
                    return;
                }
                this.loadList();
            },
            error: () => alert('删除巡检配置失败')
        });
    },

    execute: function (id) {
        $.ajax({
            url: ApiConfig.getApiUrl(`/ai/admin/api/patrol/executeApiPatrol?id=${id}`),
            type: 'POST',
            success: (res) => this.showResult(res),
            error: () => alert('执行巡检失败')
        });
    },

    viewLatestResult: function (patrolId) {
        $.ajax({
            url: ApiConfig.getApiUrl(`/ai/admin/api/patrol/queryLatestApiPatrolResultByPatrolId?patrolId=${patrolId}`),
            type: 'GET',
            success: (res) => {
                if (!res || !res.id) {
                    alert('当前巡检配置还没有执行记录');
                    return;
                }
                this.showResult(res);
            },
            error: () => alert('查询最近结果失败')
        });
    },

    showResult: function (result) {
        $('#execute-result-summary').html(`
            <div class="mb-2"><strong>执行结果：</strong>${result.success === 1 ? '<span class="badge bg-success">成功</span>' : '<span class="badge bg-danger">失败</span>'}</div>
            <div class="mb-2"><strong>状态码：</strong>${result.responseCode ?? '-'}</div>
            <div class="mb-2"><strong>响应耗时：</strong>${result.responseTime ?? '-'} ms</div>
            <div class="mb-2"><strong>失败原因：</strong>${result.errorMessage || '无'}</div>
        `);
        $('#execute-result-body').text(result.responseBody || '');
        $('#execute-result-report').text(result.aiReport || '');
        new bootstrap.Modal(document.getElementById('executeResultModal')).show();
    }
};

$(document).ready(function () {
    ApiPatrolManager.init();
});
