package cn.bugstack.ai.trigger.job;

import cn.bugstack.ai.infrastructure.dao.IApiPatrolConfigDao;
import cn.bugstack.ai.infrastructure.dao.po.ApiPatrolConfig;
import cn.bugstack.ai.trigger.service.ApiPatrolService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * 接口巡检任务调度。
 */
@Slf4j
@Component
public class ApiPatrolJob implements DisposableBean {

    @Resource
    private IApiPatrolConfigDao apiPatrolConfigDao;

    @Resource
    private ApiPatrolService apiPatrolService;

    private TaskScheduler taskScheduler;

    private final Map<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    private final Map<Long, String> scheduledCrons = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(4);
        scheduler.setThreadNamePrefix("api-patrol-scheduler-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(30);
        scheduler.initialize();
        this.taskScheduler = scheduler;
        refreshTasks();
    }

    /**
     * 每分钟刷新一次巡检调度配置。
     */
    @Scheduled(fixedRate = 60000)
    public void refreshTasks() {
        try {
            List<ApiPatrolConfig> configs = apiPatrolConfigDao.queryAllEnabledTaskConfigs();
            Map<Long, Boolean> currentTaskIds = new ConcurrentHashMap<>();

            for (ApiPatrolConfig config : configs) {
                Long patrolId = config.getId();
                currentTaskIds.put(patrolId, true);

                if (needsReschedule(config)) {
                    cancelTask(patrolId);
                    scheduleTask(config);
                }
            }

            scheduledTasks.keySet().removeIf(patrolId -> {
                if (!currentTaskIds.containsKey(patrolId)) {
                    cancelTask(patrolId);
                    return true;
                }
                return false;
            });
        } catch (Exception e) {
            log.error("刷新接口巡检任务失败", e);
        }
    }

    private boolean needsReschedule(ApiPatrolConfig config) {
        if (!scheduledTasks.containsKey(config.getId())) {
            return true;
        }
        String oldCron = scheduledCrons.get(config.getId());
        return !StringUtils.equals(oldCron, config.getCronExpression());
    }

    private void scheduleTask(ApiPatrolConfig config) {
        try {
            ScheduledFuture<?> future = taskScheduler.schedule(
                    () -> executeTask(config.getId()),
                    new CronTrigger(config.getCronExpression())
            );
            scheduledTasks.put(config.getId(), future);
            scheduledCrons.put(config.getId(), config.getCronExpression());
            log.info("接口巡检任务调度成功 patrolId={}, cron={}", config.getId(), config.getCronExpression());
        } catch (Exception e) {
            log.error("接口巡检任务调度失败 patrolId={}", config.getId(), e);
        }
    }

    private void executeTask(Long patrolId) {
        try {
            log.info("开始执行接口巡检任务 patrolId={}", patrolId);
            apiPatrolService.execute(patrolId);
        } catch (Exception e) {
            log.error("执行接口巡检任务失败 patrolId={}", patrolId, e);
        }
    }

    private void cancelTask(Long patrolId) {
        ScheduledFuture<?> future = scheduledTasks.remove(patrolId);
        scheduledCrons.remove(patrolId);
        if (future != null) {
            future.cancel(true);
            log.info("已移除接口巡检任务 patrolId={}", patrolId);
        }
    }

    @Override
    public void destroy() {
        scheduledTasks.keySet().forEach(this::cancelTask);
        scheduledTasks.clear();
        scheduledCrons.clear();
    }
}
