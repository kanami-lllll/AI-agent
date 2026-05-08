package cn.bugstack.ai.trigger.http;

import cn.bugstack.ai.api.IAiAgentService;
import cn.bugstack.ai.api.response.Response;
import cn.bugstack.ai.domain.agent.service.IAiAgentChatService;
import cn.bugstack.ai.domain.agent.service.IAiAgentPreheatService;
import cn.bugstack.ai.domain.agent.service.IAiAgentRagService;
import cn.bugstack.ai.types.common.Constants;
import com.alibaba.fastjson.JSON;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.Disposable;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@CrossOrigin("*")
@RequestMapping("/api/v1/ai/agent/")
public class AiAgentController implements IAiAgentService {

    @Resource
    private IAiAgentChatService aiAgentChatService;

    @Resource
    private IAiAgentRagService aiAgentRagService;

    @Resource
    private IAiAgentPreheatService aiAgentPreheatService;

    @RequestMapping(value = "preheat", method = RequestMethod.GET)
    @Override
    public Response<Boolean> preheat(@RequestParam("aiAgentId") Long aiClientId) {
        try {
            log.info("Preheat ai agent {}", aiClientId);
            aiAgentPreheatService.preheat(aiClientId);
            return Response.<Boolean>builder()
                    .code(Constants.ResponseCode.SUCCESS.getCode())
                    .info(Constants.ResponseCode.SUCCESS.getInfo())
                    .data(true)
                    .build();
        } catch (Exception e) {
            log.error("Preheat ai agent failed {}", aiClientId, e);
            return Response.<Boolean>builder()
                    .code(Constants.ResponseCode.UN_ERROR.getCode())
                    .info(Constants.ResponseCode.UN_ERROR.getInfo())
                    .data(false)
                    .build();
        }
    }

    @RequestMapping(value = "chat_agent", method = RequestMethod.GET)
    @Override
    public Response<String> chatAgent(@RequestParam("aiAgentId") Long aiAgentId, @RequestParam("message") String message) {
        try {
            log.info("Agent chat request {} {}", aiAgentId, message);
            String content = aiAgentChatService.aiAgentChat(aiAgentId, message);
            Response<String> response = Response.<String>builder()
                    .code(Constants.ResponseCode.SUCCESS.getCode())
                    .info(Constants.ResponseCode.SUCCESS.getInfo())
                    .data(content)
                    .build();
            log.info("Agent chat response {} {}", aiAgentId, JSON.toJSONString(response));
            return response;
        } catch (Exception e) {
            log.error("Agent chat failed {} {}", aiAgentId, message, e);
            return Response.<String>builder()
                    .code(Constants.ResponseCode.UN_ERROR.getCode())
                    .info(Constants.ResponseCode.UN_ERROR.getInfo())
                    .build();
        }
    }

    @RequestMapping(value = "chat_stream", method = RequestMethod.GET, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Override
    public SseEmitter chatStream(@RequestParam("aiAgentId") Long aiAgentId,
                                 @RequestParam("ragId") Long ragId,
                                 @RequestParam("message") String message) {
        log.info("Agent stream request {} {} {}", aiAgentId, ragId, message);

        SseEmitter emitter = new SseEmitter(0L);
        Disposable[] streamRef = new Disposable[1];

        emitter.onTimeout(() -> {
            Disposable disposable = streamRef[0];
            if (disposable != null && !disposable.isDisposed()) {
                disposable.dispose();
            }
            emitter.complete();
        });

        emitter.onCompletion(() -> {
            Disposable disposable = streamRef[0];
            if (disposable != null && !disposable.isDisposed()) {
                disposable.dispose();
            }
            log.info("Agent stream completed {}", aiAgentId);
        });

        streamRef[0] = aiAgentChatService.aiAgentChatStream(aiAgentId, ragId, message)
                .subscribe(chatResponse -> {
                    try {
                        emitter.send(SseEmitter.event().data(JSON.toJSONString(chatResponse)));
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }, error -> {
                    log.error("Agent stream failed {} {} {}", aiAgentId, ragId, message, error);
                    emitter.completeWithError(error);
                }, emitter::complete);

        return emitter;
    }

    @RequestMapping(value = "file/upload", method = RequestMethod.POST, headers = "content-type=multipart/form-data")
    @Override
    public Response<Boolean> uploadRagFile(@RequestParam("name") String name,
                                           @RequestParam("tag") String tag,
                                           @RequestParam("files") List<MultipartFile> files) {
        try {
            log.info("Upload rag file {}", name);
            aiAgentRagService.storeRagFile(name, tag, files);
            return Response.<Boolean>builder()
                    .code(Constants.ResponseCode.SUCCESS.getCode())
                    .info(Constants.ResponseCode.SUCCESS.getInfo())
                    .data(true)
                    .build();
        } catch (Exception e) {
            log.error("Upload rag file failed {}", name, e);
            return Response.<Boolean>builder()
                    .code(Constants.ResponseCode.UN_ERROR.getCode())
                    .info(Constants.ResponseCode.UN_ERROR.getInfo())
                    .data(false)
                    .build();
        }
    }

}
