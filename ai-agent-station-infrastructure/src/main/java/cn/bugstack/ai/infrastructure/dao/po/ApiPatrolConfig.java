package cn.bugstack.ai.infrastructure.dao.po;

import cn.bugstack.ai.infrastructure.dao.po.base.Page;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 接口巡检配置
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ApiPatrolConfig extends Page {

    private Long id;

    /**
     * 巡检名称
     */
    private String patrolName;

    /**
     * 请求方法：GET / POST / PUT / DELETE
     */
    private String requestMethod;

    /**
     * 请求地址
     */
    private String requestUrl;

    /**
     * 请求头，JSON 字符串
     */
    private String requestHeaders;

    /**
     * 请求体，原始文本
     */
    private String requestBody;

    /**
     * 超时时间，单位毫秒
     */
    private Integer timeout;

    /**
     * 预期状态码
     */
    private Integer expectedStatusCode;

    /**
     * 预期存在的 JSON 字段，使用 a.b.c 形式
     */
    private String expectedJsonField;

    /**
     * 最大响应时间，单位毫秒
     */
    private Integer maxResponseTime;

    /**
     * 状态：0 禁用，1 启用
     */
    private Integer status;

    /**
     * 巡检调度状态：0 关闭，1 开启
     */
    private Integer taskStatus;

    /**
     * 巡检任务 cron 表达式
     */
    private String cronExpression;

    /**
     * 备注
     */
    private String remark;

    private Date createTime;

    private Date updateTime;

}
