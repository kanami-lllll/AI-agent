package cn.bugstack.ai.trigger.http.admin;

import cn.bugstack.ai.infrastructure.dao.IApiPatrolConfigDao;
import cn.bugstack.ai.infrastructure.dao.IApiPatrolResultDao;
import cn.bugstack.ai.infrastructure.dao.po.ApiPatrolConfig;
import cn.bugstack.ai.infrastructure.dao.po.ApiPatrolResult;
import cn.bugstack.ai.trigger.service.ApiPatrolService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

/**
 * API patrol admin controller.
 */
@Slf4j
@RestController
@CrossOrigin("*")
@RequestMapping("/api/v1/ai/admin/api/patrol/")
public class AiAdminApiPatrolController {

    @Resource
    private IApiPatrolConfigDao apiPatrolConfigDao;

    @Resource
    private IApiPatrolResultDao apiPatrolResultDao;

    @Resource
    private ApiPatrolService apiPatrolService;

    @RequestMapping(value = "queryApiPatrolConfigList", method = RequestMethod.POST)
    public ResponseEntity<List<ApiPatrolConfig>> queryApiPatrolConfigList(@RequestBody ApiPatrolConfig apiPatrolConfig) {
        try {
            return ResponseEntity.ok(apiPatrolConfigDao.queryApiPatrolConfigList(apiPatrolConfig));
        } catch (Exception e) {
            log.error("Query API patrol config list error", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "queryApiPatrolConfigById", method = RequestMethod.GET)
    public ResponseEntity<ApiPatrolConfig> queryApiPatrolConfigById(@RequestParam("id") Long id) {
        try {
            return ResponseEntity.ok(apiPatrolConfigDao.queryApiPatrolConfigById(id));
        } catch (Exception e) {
            log.error("Query API patrol config error", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "addApiPatrolConfig", method = RequestMethod.POST)
    public ResponseEntity<Boolean> addApiPatrolConfig(@RequestBody ApiPatrolConfig apiPatrolConfig) {
        try {
            if (null == apiPatrolConfig.getTaskStatus()) {
                apiPatrolConfig.setTaskStatus(0);
            }
            if (1 == apiPatrolConfig.getTaskStatus() && !CronExpression.isValidExpression(apiPatrolConfig.getCronExpression())) {
                return ResponseEntity.badRequest().body(false);
            }
            apiPatrolConfig.setCreateTime(new Date());
            apiPatrolConfig.setUpdateTime(new Date());
            int count = apiPatrolConfigDao.insert(apiPatrolConfig);
            return ResponseEntity.ok(count > 0);
        } catch (Exception e) {
            log.error("Add API patrol config error", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "updateApiPatrolConfig", method = RequestMethod.POST)
    public ResponseEntity<Boolean> updateApiPatrolConfig(@RequestBody ApiPatrolConfig apiPatrolConfig) {
        try {
            if (null == apiPatrolConfig.getTaskStatus()) {
                apiPatrolConfig.setTaskStatus(0);
            }
            if (1 == apiPatrolConfig.getTaskStatus() && !CronExpression.isValidExpression(apiPatrolConfig.getCronExpression())) {
                return ResponseEntity.badRequest().body(false);
            }
            apiPatrolConfig.setUpdateTime(new Date());
            int count = apiPatrolConfigDao.update(apiPatrolConfig);
            return ResponseEntity.ok(count > 0);
        } catch (Exception e) {
            log.error("Update API patrol config error", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "deleteApiPatrolConfig", method = RequestMethod.GET)
    public ResponseEntity<Boolean> deleteApiPatrolConfig(@RequestParam("id") Long id) {
        try {
            apiPatrolResultDao.deleteByPatrolId(id);
            int count = apiPatrolConfigDao.deleteById(id);
            return ResponseEntity.ok(count > 0);
        } catch (Exception e) {
            log.error("Delete API patrol config error", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "executeApiPatrol", method = RequestMethod.POST)
    public ResponseEntity<ApiPatrolResult> executeApiPatrol(@RequestParam("id") Long id) {
        try {
            return ResponseEntity.ok(apiPatrolService.execute(id));
        } catch (Exception e) {
            log.error("Execute API patrol error", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "queryApiPatrolResultList", method = RequestMethod.POST)
    public ResponseEntity<List<ApiPatrolResult>> queryApiPatrolResultList(@RequestBody ApiPatrolResult apiPatrolResult) {
        try {
            return ResponseEntity.ok(apiPatrolResultDao.queryApiPatrolResultList(apiPatrolResult));
        } catch (Exception e) {
            log.error("Query API patrol result list error", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "queryApiPatrolResultById", method = RequestMethod.GET)
    public ResponseEntity<ApiPatrolResult> queryApiPatrolResultById(@RequestParam("id") Long id) {
        try {
            return ResponseEntity.ok(apiPatrolResultDao.queryApiPatrolResultById(id));
        } catch (Exception e) {
            log.error("Query API patrol result error", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "queryLatestApiPatrolResultByPatrolId", method = RequestMethod.GET)
    public ResponseEntity<ApiPatrolResult> queryLatestApiPatrolResultByPatrolId(@RequestParam("patrolId") Long patrolId) {
        try {
            return ResponseEntity.ok(apiPatrolResultDao.queryLatestApiPatrolResultByPatrolId(patrolId));
        } catch (Exception e) {
            log.error("Query latest API patrol result error", e);
            return ResponseEntity.status(500).build();
        }
    }

}
