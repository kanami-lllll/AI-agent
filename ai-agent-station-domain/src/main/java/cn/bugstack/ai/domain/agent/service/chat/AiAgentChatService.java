package cn.bugstack.ai.domain.agent.service.chat;

import cn.bugstack.ai.domain.agent.adapter.repository.IAgentRepository;
import cn.bugstack.ai.domain.agent.service.IAiAgentChatService;
import cn.bugstack.ai.domain.agent.service.armory.factory.DefaultArmoryStrategyFactory;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.ai.chat.client.advisor.AbstractChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY;
import static org.springframework.ai.chat.client.advisor.AbstractChatMemoryAdvisor.CHAT_MEMORY_RETRIEVE_SIZE_KEY;

/**
 * Ai智能体对话服务
 *
 */
@Slf4j
@Service
public class AiAgentChatService implements IAiAgentChatService {

    @Resource
    private IAgentRepository repository;

    @Resource
    private PgVectorStore vectorStore;

    @Resource
    private DefaultArmoryStrategyFactory defaultArmoryStrategyFactory;

    @Override
    public String aiAgentChat(Long aiAgentId, String message) {
        log.info("智能体对话请求，参数 {} {}", aiAgentId, message);

        // 一个 Agent 可以串联多个 client，按顺序执行。
        // 前一个 client 的输出，会被拼到下一个 client 的输入中继续处理。
        List<Long> aiClientIds = repository.queryAiClientIdsByAiAgentId(aiAgentId);

        String content = "";

        for (Long aiClientId : aiClientIds) {
            // 这条链路拿到的是已经装配好的 ChatClient，
            // 所以系统提示词、Advisor、客户端级 MCP 工具都会生效。
            ChatClient chatClient = defaultArmoryStrategyFactory.chatClient(aiClientId);

            content = chatClient.prompt(message + "，" + content)
                    .system(s -> s.param("current_date", LocalDate.now().toString()))
                    .advisors(a -> a
                            .param(CHAT_MEMORY_CONVERSATION_ID_KEY, "chatId-101")
                            .param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 100))
                    .call().content();

            log.info("智能体对话进行，客户端ID {}", aiClientId);
        }

        log.info("智能体对话请求，结果 {} {}", aiAgentId, content);

        return content;
    }

    @Override
    public Flux<ChatResponse> aiAgentChatStream(Long aiAgentId, Long ragId, String message) {
        log.info("智能体对话请求，参数 aiAgentId {} message {}", aiAgentId, message);

        // 查询模型ID
        // 流式链路刻意做得更轻一些：它直接根据 aiAgentId 找到绑定的模型，
        // 然后走 ChatModel 的流式输出。
        Long modelId = repository.queryAiClientModelIdByAgentId(aiAgentId);

        // 获取对话模型
        ChatModel chatModel = defaultArmoryStrategyFactory.chatModel(modelId);

        // 封装请求参数
        List<Message> messages = new ArrayList<>();

        if (null != ragId && 0 != ragId){
            // 查询RAG标签
            // 这里的 RAG 是手动做的：
            // 先查向量库拿到最相关的片段，再把这些内容拼进系统提示词后进行流式回答。
            String tag = repository.queryRagKnowledgeTag(ragId);

            SearchRequest searchRequest = SearchRequest.builder()
                    .query(message)
                    .topK(5)
                    .filterExpression("knowledge == '" + tag + "'")
                    .build();

            List<Document> documents = vectorStore.similaritySearch(searchRequest);
            String documentCollectors = documents.stream().map(Document::getFormattedContent).collect(Collectors.joining());
            Message ragMessage = new SystemPromptTemplate("""
                Use the information from the DOCUMENTS section to provide accurate answers but act as if you knew this information innately.
                If unsure, simply state that you don't know.
                Another thing you need to note is that your reply must be in Chinese!
                DOCUMENTS:
                    {documents}
                """).createMessage(Map.of("documents", documentCollectors));

            messages.add(new UserMessage(message));
            messages.add(ragMessage);
        } else {
            messages.add(new UserMessage(message));
        }

        // 最终 Prompt 要么只有用户问题，要么是“用户问题 + 检索出的知识片段”。
        return chatModel.stream(Prompt.builder()
                .messages(messages)
                .build());
    }

}

