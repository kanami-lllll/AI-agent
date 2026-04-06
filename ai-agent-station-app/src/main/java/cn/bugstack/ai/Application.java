package cn.bugstack.ai;

import cn.bugstack.ai.domain.agent.service.IAiAgentPreheatService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Configurable;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@SpringBootApplication
@Configurable
@EnableScheduling
public class Application implements CommandLineRunner {

    @Resource
    private IAiAgentPreheatService aiAgentArmoryService;

    public static void main(String[] args){
        SpringApplication.run(Application.class);
    }

    // 应用启动后先做一次预热装配，把运行期需要的 Agent Bean 先注册好，
    // 这样后续真正有请求进来时，就可以直接从容器里拿到 ChatModel/ChatClient。
    @Override
    public void run(String... args) throws Exception {
        log.info("预热AiAgent服务，开始");
        aiAgentArmoryService.preheat();
        log.info("预热AiAgent服务，完成");
    }
}
