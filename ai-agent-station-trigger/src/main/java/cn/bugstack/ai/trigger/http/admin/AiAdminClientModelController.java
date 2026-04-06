package cn.bugstack.ai.trigger.http.admin;

import cn.bugstack.ai.infrastructure.dao.IAiClientModelDao;
import cn.bugstack.ai.infrastructure.dao.po.AiClientModel;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;

@Slf4j
@RestController
@CrossOrigin("*")
@RequestMapping("/api/v1/ai/admin/client/model/")
public class AiAdminClientModelController {

    @Resource
    private IAiClientModelDao aiClientModelDao;

    @RequestMapping(value = "queryClientModelList", method = RequestMethod.POST)
    public ResponseEntity<List<AiClientModel>> queryClientModelList(@RequestBody AiClientModel aiClientModel) {
        try {
            List<AiClientModel> modelList = aiClientModelDao.queryClientModelList(aiClientModel);
            modelList.forEach(item -> item.setApiKey(maskApiKey(item.getApiKey())));
            return ResponseEntity.ok(modelList);
        } catch (Exception e) {
            log.error("Query client model list failed", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "queryAllModelConfig", method = RequestMethod.POST)
    public ResponseEntity<List<AiClientModel>> queryAllModelConfig() {
        try {
            List<AiClientModel> modelList = aiClientModelDao.queryAllModelConfig();
            return ResponseEntity.ok(modelList);
        } catch (Exception e) {
            log.error("Query all model config failed", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "queryClientModelById", method = RequestMethod.GET)
    public ResponseEntity<AiClientModel> queryClientModelById(@RequestParam("id") Long id) {
        try {
            AiClientModel aiClientModel = aiClientModelDao.queryModelConfigById(id);
            return ResponseEntity.ok(aiClientModel);
        } catch (Exception e) {
            log.error("Query client model detail failed {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "addClientModel", method = RequestMethod.POST)
    public ResponseEntity<Boolean> addClientModel(@RequestBody AiClientModel aiClientModel) {
        try {
            aiClientModel.setCreateTime(new Date());
            aiClientModel.setUpdateTime(new Date());
            int count = aiClientModelDao.insert(aiClientModel);
            return ResponseEntity.ok(count > 0);
        } catch (Exception e) {
            log.error("Add client model failed", e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "updateClientModel", method = RequestMethod.POST)
    public ResponseEntity<Boolean> updateClientModel(@RequestBody AiClientModel aiClientModel) {
        try {
            aiClientModel.setUpdateTime(new Date());
            int count = aiClientModelDao.update(aiClientModel);
            return ResponseEntity.ok(count > 0);
        } catch (Exception e) {
            log.error("Update client model failed {}", aiClientModel.getId(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @RequestMapping(value = "deleteClientModel", method = RequestMethod.GET)
    public ResponseEntity<Boolean> deleteClientModel(@RequestParam("id") Long id) {
        try {
            int count = aiClientModelDao.deleteById(id);
            return ResponseEntity.ok(count > 0);
        } catch (Exception e) {
            log.error("Delete client model failed {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }

    private String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            return apiKey;
        }

        if (apiKey.length() <= 8) {
            return apiKey.substring(0, Math.min(2, apiKey.length())) + "****";
        }

        return apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length() - 4);
    }

}
