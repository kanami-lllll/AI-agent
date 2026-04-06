const ApiPatrolResultManager = {
    init: function () {
        this.bindEvents();
        this.loadList();
    },

    bindEvents: function () {
        $('#btn-search-result').on('click', () => this.loadList());
        $('#search-result-patrol-name').on('keypress', (e) => {
            if (e.which === 13) {
                this.loadList();
            }
        });
    },

    loadList: function () {
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

    renderList: function (list) {
        if (!list.length) {
            $('#result-list').html('<tr><td colspan="7" class="text-center">暂无数据</td></tr>');
            return;
        }

        let html = '';
        list.forEach(item => {
            html += `
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
            `;
        });

        $('#result-list').html(html);
    },

    view: function (id) {
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

    formatDate: function (dateStr) {
        if (!dateStr) {
            return '-';
        }
        return new Date(dateStr).toLocaleString();
    }
};

$(document).ready(function () {
    ApiPatrolResultManager.init();
});
