# AI Agent Station

AI Agent Station 鏄竴涓熀浜?Spring AI 鐨勯厤缃┍鍔ㄦ櫤鑳戒綋骞冲彴锛屾敮鎸佸皢妯″瀷銆佺郴缁熸彁绀鸿瘝銆丷AG 鐭ヨ瘑搴撱€丮CP 宸ュ叿涓庝换鍔¤皟搴﹁兘鍔涚粍鍚堜负鍙墽琛岀殑 Agent 鑳藉姏銆傞」鐩彁渚涙祦寮忓璇濄€佺煡璇嗗簱闂瓟銆佸悗鍙伴厤缃鐞嗭紝浠ュ強闈㈠悜鏈湴鍚庣鏈嶅姟鐨勬帴鍙ｅ贰妫€涓庡洖褰掓姤鍛婂姛鑳姐€?
## 鏍稿績鑳藉姏

- 閰嶇疆椹卞姩瑁呴厤锛氬皢妯″瀷銆佹彁绀鸿瘝銆侀【闂€佸伐鍏峰拰鎵ц椤哄簭鎷嗗垎涓洪厤缃紝鍦ㄨ繍琛屾椂鍔ㄦ€佽閰嶄负 `ChatModel` 鍜?`ChatClient`
- RAG 鐭ヨ瘑搴擄細鏀寔鏂囨。瑙ｆ瀽銆佹枃鏈垏鍒嗐€丒mbedding 鍚戦噺鍖栥€乸gvector 瀛樺偍涓庢绱㈠寮?- MCP 宸ュ叿鎺ュ叆锛氭敮鎸侀€氳繃 `sse` 涓?`stdio` 涓ょ鏂瑰紡鎺ュ叆澶栭儴宸ュ叿鏈嶅姟
- 鍚庡彴閰嶇疆绠＄悊锛氭敮鎸佸鏅鸿兘浣撱€佹ā鍨嬨€佹彁绀鸿瘝銆侀【闂€佸伐鍏风瓑閰嶇疆椤硅繘琛岀粺涓€绠＄悊
- 鎺ュ彛宸℃涓庡洖褰掓姤鍛婏細鏀寔閰嶇疆寰呭贰妫€鎺ュ彛銆佹墽琛?HTTP 璇锋眰銆佹牎楠岀粨鏋滃苟鐢熸垚 AI 宸℃鎶ュ憡
- 浠诲姟璋冨害锛氭敮鎸佸熀浜庨厤缃殑瀹氭椂浠诲姟鎵ц妗嗘灦
- Docker 涓€閿儴缃诧細鎻愪緵鏈€灏忓彲杩愯鐨勯儴缃叉柟妗堬紝閫傜敤浜庢湰鍦伴獙璇佷笌鍔熻兘婕旂ず

## 鎶€鏈爤

- Spring Boot
- Spring AI
- MyBatis
- MySQL
- PostgreSQL + pgvector
- MCP
- Docker Compose

## 椤圭洰缁撴瀯

- `ai-agent-station-app`锛氬簲鐢ㄥ惎鍔ㄦā鍧椾笌鍩虹閰嶇疆
- `ai-agent-station-api`锛氭帴鍙ｅ畾涔変笌缁熶竴鍝嶅簲缁撴瀯
- `ai-agent-station-domain`锛氭牳蹇冮鍩熸湇鍔′笌 Agent 瑁呴厤閫昏緫
- `ai-agent-station-infrastructure`锛欴AO銆佷粨鍌ㄤ笌鎸佷箙鍖栧疄鐜?- `ai-agent-station-trigger`锛欻TTP 鎺ュ彛銆佸悗鍙版帶鍒跺櫒涓庝换鍔¤皟搴﹀叆鍙?- `ai-agent-station-types`锛氬叕鍏卞父閲忋€佸紓甯镐笌鍝嶅簲鐮?- `docs/dev-ops-v2/ai-agent-station-front`锛氶潤鎬佸墠绔〉闈?- `deploy/one-click`锛氭渶灏忓寲 Docker 閮ㄧ讲鏂规

## 蹇€熷紑濮?
鎺ㄨ崘浣跨敤 `deploy/one-click` 涓殑鏈€灏忛儴缃叉柟妗堝惎鍔ㄩ」鐩€?
### 1. 杩涘叆閮ㄧ讲鐩綍

```powershell
cd deploy\one-click
```

### 2. 澶嶅埗鐜鍙橀噺妯℃澘

```powershell
Copy-Item .env.example .env
```

### 3. 閰嶇疆鐜鍙橀噺

鑷冲皯闇€瑕佸～鍐欎互涓嬮厤缃細

```env
SPRING_AI_OPENAI_BASE_URL=https://api.openai.com
SPRING_AI_OPENAI_API_KEY=sk-your-api-key
OPENAI_CHAT_MODEL=gpt-4.1-mini
AI_AGENT_STATION_APP_IMAGE=your-registry/ai-agent-station-app:latest
```

### 4. 鍚姩鏈嶅姟

Windows锛?
```powershell
./start.ps1
```

Linux / macOS锛?
```sh
sh ./start.sh
```

### 5. 璁块棶鍦板潃

- 鍓嶇椤甸潰锛歚http://localhost:8080`
- 鍚庣鎺ュ彛锛歚http://localhost:8091/ai-agent-station`

濡傞渶鏁版嵁搴撶鐞嗗伐鍏凤紝鍙澶栧惎鍔細

```powershell
docker compose --profile tools up -d
```

- phpMyAdmin锛歚http://localhost:8899`
- pgAdmin锛歚http://localhost:5050`

## 閮ㄧ讲璇存槑

鏈€灏忛儴缃查粯璁ゅ惎鐢ㄤ互涓嬫湇鍔★細

- `mysql`锛氬瓨鍌ㄦ櫤鑳戒綋銆佹ā鍨嬨€佹彁绀鸿瘝銆佷换鍔¤皟搴︿笌宸℃閰嶇疆
- `pgvector`锛氬瓨鍌ㄧ煡璇嗗簱鍚戦噺鏁版嵁
- `ai-agent-station-app`锛氬悗绔湇鍔?- `frontend`锛氶潤鎬佸墠绔〉闈?
鎺ュ彛宸℃涓庡洖褰掓姤鍛婂姛鑳戒笉闇€瑕侀澶栦慨鏀?`docker-compose.yml`銆傚墠绔〉闈㈢洰褰曚笌鏁版嵁搴撳垵濮嬪寲鑴氭湰宸茬粡閫氳繃鎸傝浇鏂瑰紡鎺ュ叆瀹瑰櫒銆?
涓轰繚璇佹渶灏忕幆澧冨彲绋冲畾鍚姩锛屽垵濮嬪寲鑴氭湰榛樿鍙繚鐣欏熀纭€瀵硅瘽銆丷AG 涓庡悗鍙扮鐞嗙浉鍏宠兘鍔涳紝骞剁鐢ㄤ緷璧栧閮ㄥ伐鍏锋湇鍔＄殑绀轰緥鏁版嵁銆?
濡傛灉淇敼浜嗘ā鍨嬪湴鍧€銆丄PI Key銆佹ā鍨嬪悕绉版垨鍒濆鍖栨暟鎹紝寤鸿閲嶆柊鍒濆鍖栫幆澧冿細

```powershell
docker compose down -v
docker compose up -d
```

濡傛灉鏄粠鏃х増鏈幆澧冨崌绾у埌褰撳墠鐗堟湰锛屼篃寤鸿鎵ц涓婅堪鍛戒护銆傚師鍥犳槸鎺ュ彛宸℃鍔熻兘鏂板浜嗘暟鎹簱琛ㄧ粨鏋勶紝宸叉湁 MySQL 鏁版嵁鍗蜂笉浼氳嚜鍔ㄩ噸鏀惧垵濮嬪寲 SQL銆?
## 榛樿鑳藉姏

鏈€灏忛儴缃查粯璁ゅ惎鐢細

- 娴佸紡瀵硅瘽
- 鍚庡彴閰嶇疆绠＄悊
- 鎺ュ彛宸℃閰嶇疆
- 宸℃缁撴灉璁板綍
- 鐭ヨ瘑搴撲笂浼?- RAG 妫€绱㈤棶绛?
## 璁稿彲璇存槑

鏈」鐩伒寰粨搴撲腑澹版槑鐨勮鍙崗璁娇鐢ㄣ€?
