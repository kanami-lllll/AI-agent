package cn.bugstack.ai.infrastructure.dao.po;

import cn.bugstack.ai.infrastructure.dao.po.base.Page;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 接口巡检结果
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ApiPatrolResult extends Page {

    private Long id;

    private Long patrolId;

    /**
     * 仅用于列表展示
     */
    private String patrolName;

    /**
     * 0 失败，1 成功
     */
    private Integer success;

    private Integer responseCode;

    /**
     * 响应耗时，单位毫秒
     */
    private Long responseTime;

    /**
     * 响应体
     */
    private String responseBody;

    /**
     * 失败原因
     */
    private String errorMessage;

    /**
     * AI 巡检报告
     */
    private String aiReport;

    private Date createTime;

}
