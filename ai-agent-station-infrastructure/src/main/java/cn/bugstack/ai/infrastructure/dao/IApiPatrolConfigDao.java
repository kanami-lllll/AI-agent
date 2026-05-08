package cn.bugstack.ai.infrastructure.dao;

import cn.bugstack.ai.infrastructure.dao.po.ApiPatrolConfig;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 接口巡检配置 DAO
 */
@Mapper
public interface IApiPatrolConfigDao {

    List<ApiPatrolConfig> queryApiPatrolConfigList(ApiPatrolConfig apiPatrolConfig);

    ApiPatrolConfig queryApiPatrolConfigById(Long id);

    List<ApiPatrolConfig> queryAllEnabledTaskConfigs();

    int insert(ApiPatrolConfig apiPatrolConfig);

    int update(ApiPatrolConfig apiPatrolConfig);

    int deleteById(Long id);

}
