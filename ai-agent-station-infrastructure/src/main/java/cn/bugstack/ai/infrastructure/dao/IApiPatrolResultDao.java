package cn.bugstack.ai.infrastructure.dao;

import cn.bugstack.ai.infrastructure.dao.po.ApiPatrolResult;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 接口巡检结果 DAO
 */
@Mapper
public interface IApiPatrolResultDao {

    List<ApiPatrolResult> queryApiPatrolResultList(ApiPatrolResult apiPatrolResult);

    ApiPatrolResult queryApiPatrolResultById(Long id);

    ApiPatrolResult queryLatestApiPatrolResultByPatrolId(Long patrolId);

    int insert(ApiPatrolResult apiPatrolResult);

}
