package cn.bugstack.ai.infrastructure.dao.po;

import cn.bugstack.ai.infrastructure.dao.po.base.Page;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.james.mime4j.dom.datetime.DateTime;

import java.time.LocalDateTime;
import java.util.Date;

@EqualsAndHashCode(callSuper = true)
@Data
public class AiClientModel extends Page {

    /**
     * 主键ID
     */
    private Long id;

    /**
     * 模型名称
     */
    private String modelName;

    /**
     * 基础URL
     */
    private String baseUrl;

    /**
     * API密钥
     */
    private String apiKey;

    /**
     * 完成路径
     */
    private String completionsPath;

    /**
     * 嵌入路径
     */
    private String embeddingsPath;

    /**
     * 模型类型(openai/azure等)
     */
    private String modelType;

    /**
     * 模型版本
     */
    private String modelVersion;

    /**
     * 超时时间(秒)
     */
    private Integer timeout;

    /**
     * 状态(0:禁用,1:启用)
     */
    private Integer status;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 当前模型所属的智能体ID，仅用于后台展示当前对话模型设置
     */
    private Long agentId;

    /**
     * 当前模型所属的智能体名称，仅用于后台展示当前对话模型设置
     */
    private String agentName;

    /**
     * 当前模型绑定的客户端ID，仅用于后台快速重载运行时配置
     */
    private Long clientId;

}
