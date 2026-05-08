package cn.bugstack.ai.api;

import cn.bugstack.ai.api.response.Response;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IAiAgentService {

    Response<Boolean> preheat(Long aiClientId);

    Response<String> chatAgent(Long aiAgentId, String message);

    Object chatStream(Long aiAgentId, Long ragId, String message);

    Response<Boolean> uploadRagFile(String name, String tag, List<MultipartFile> files);

}
