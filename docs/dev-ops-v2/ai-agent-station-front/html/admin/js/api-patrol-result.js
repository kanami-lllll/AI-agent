const ApiPatrolResultManager = {
    init() {
        this.bindEvents();
        this.loadList();
    },

    bindEvents() {
        $('#btn-search-result').on('click', () => this.loadList());
        $('#search-result-patrol-name').on('keypress', (event) => {
            if (event.which === 13) {
                this.loadList();
            }
        });
    },

    loadList() {
        const params = {
            patrolName: $('#search-result-patrol-name').val()
        };

        $.ajax({
            url: ApiConfig.getApiUrl('/ai/admin/api/patrol/queryApiPatrolResultList'),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
            success: (res) => this.renderList(res || []),
            error: () => alert('加载巡检结果失败')
        });
    },

    renderList(list) {
        if (!list.length) {
            $('#result-list').html('<tr><td colspan="7" class="text-center">暂无数据</td></tr>');
            return;
        }

        const html = list.map((item) => `
            <tr>
                <td>${item.id}</td>
                <td>${item.patrolName || '-'}</td>
                <td>${item.success === 1 ? '<span class="badge bg-success">成功</span>' : '<span class="badge bg-danger">失败</span>'}</td>
                <td>${item.responseCode ?? '-'}</td>
                <td>${item.responseTime ?? '-'} ms</td>
                <td>${this.formatDate(item.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="ApiPatrolResultManager.view(${item.id})">查看</button>
                </td>
            </tr>
        `).join('');

        $('#result-list').html(html);
    },

    view(id) {
        $.ajax({
            url: ApiConfig.getApiUrl(`/ai/admin/api/patrol/queryApiPatrolResultById?id=${id}`),
            type: 'GET',
            success: (res) => {
                $('#result-detail-summary').html(`
                    <div class="mb-2"><strong>巡检名称：</strong>${res.patrolName || '-'}</div>
                    <div class="mb-2"><strong>执行结果：</strong>${res.success === 1 ? '<span class="badge bg-success">成功</span>' : '<span class="badge bg-danger">失败</span>'}</div>
                    <div class="mb-2"><strong>状态码：</strong>${res.responseCode ?? '-'}</div>
                    <div class="mb-2"><strong>响应耗时：</strong>${res.responseTime ?? '-'} ms</div>
                    <div class="mb-2"><strong>失败原因：</strong>${res.errorMessage || '无'}</div>
                `);
                $('#result-detail-body').text(res.responseBody || '');
                $('#result-detail-report').text(res.aiReport || '');
                new bootstrap.Modal(document.getElementById('resultDetailModal')).show();
            },
            error: () => alert('加载巡检结果详情失败')
        });
    },

    formatDate(dateStr) {
        if (!dateStr) {
            return '-';
        }
        return new Date(dateStr).toLocaleString();
    }
};

$(document).ready(() => {
    ApiPatrolResultManager.init();
});
