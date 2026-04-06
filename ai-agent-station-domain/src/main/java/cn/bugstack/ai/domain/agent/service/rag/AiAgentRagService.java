package cn.bugstack.ai.domain.agent.service.rag;

import cn.bugstack.ai.domain.agent.adapter.repository.IAgentRepository;
import cn.bugstack.ai.domain.agent.model.valobj.AiRagOrderVO;
import cn.bugstack.ai.domain.agent.service.IAiAgentRagService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * RAG 知识库服务
 *
 */
@Slf4j
@Service
public class AiAgentRagService implements IAiAgentRagService {

    @Resource
    private TokenTextSplitter tokenTextSplitter;

    @Resource
    private PgVectorStore vectorStore;

    @Resource
    private IAgentRepository repository;

    @Override
    public void storeRagFile(String name, String tag, List<MultipartFile> files) {
        for (MultipartFile file : files) {
            // 1）先把上传文件解析成 Spring AI 的 Document 对象。
            TikaDocumentReader documentReader = new TikaDocumentReader(file.getResource());

            // 2）再把大文本切成更小的分块，便于后续做 embedding 和检索。
            List<Document> documentList = tokenTextSplitter.apply(documentReader.get());

            // 3）给每个分块打上知识库标签，后面检索时会按标签过滤。
            documentList.forEach(doc -> doc.getMetadata().put("knowledge", tag));

            // 4）把分块做向量化并写入 pgvector。
            vectorStore.accept(documentList);

            // 5）MySQL 里只记录业务层面的 RAG 条目，
            // 真正的向量分块数据存放在 pgvector 里。
            AiRagOrderVO aiRagOrderVO = new AiRagOrderVO();
            aiRagOrderVO.setRagName(name);
            aiRagOrderVO.setKnowledgeTag(tag);
            repository.createTagOrder(aiRagOrderVO);
        }
    }

}

