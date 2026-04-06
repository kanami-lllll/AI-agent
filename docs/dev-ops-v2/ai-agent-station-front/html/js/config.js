/**
 * 全局配置文件
 * 优先使用 window.__AI_AGENT_BASE_URL__，否则自动推断当前主机的 8091 端口。
 */
const ApiConfig = {
    BASE_URL: window.__AI_AGENT_BASE_URL__ || `${window.location.protocol}//${window.location.hostname}:8091`,
    API_PREFIX: '/ai-agent-station/api/v1',
    getApiUrl: function(path) {
        return this.BASE_URL + this.API_PREFIX + path;
    }
};

Object.freeze(ApiConfig);
