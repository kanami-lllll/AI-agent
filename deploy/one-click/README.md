# AI Agent Station 鏈€灏忛儴缃茶鏄?
璇ョ洰褰曟彁渚涢」鐩殑鏈€灏忓彲杩愯閮ㄧ讲鏂规锛岀敤浜庡湪鏈湴蹇€熷惎鍔ㄥ悗绔湇鍔°€佸墠绔〉闈互鍙婂繀瑕佺殑鏁版嵁瀛樺偍缁勪欢銆?
## 鍖呭惈鐨勬湇鍔?
- `mysql`锛氬瓨鍌ㄦ櫤鑳戒綋銆佹ā鍨嬨€佹彁绀鸿瘝銆佷换鍔¤皟搴︺€佹帴鍙ｅ贰妫€閰嶇疆涓庣粨鏋滄暟鎹?- `vector_db`锛氬瓨鍌ㄧ煡璇嗗簱鍚戦噺鏁版嵁
- `ai-agent-station-app`锛氬悗绔湇鍔?- `frontend`锛氶潤鎬佸墠绔〉闈?
褰撳墠閮ㄧ讲鏂规宸茬粡鍖呭惈鎺ュ彛宸℃涓庡洖褰掓姤鍛婃墍闇€鐨勫墠绔〉闈㈠拰鏁版嵁搴撳垵濮嬪寲鑴氭湰锛屼笉闇€瑕侀澶栦慨鏀?`docker-compose.yml`銆?
## 鍚姩姝ラ

### 1. 澶嶅埗鐜鍙橀噺妯℃澘

```powershell
Copy-Item .env.example .env
```

### 2. 缂栬緫 `.env`

鑷冲皯闇€瑕侀厤缃互涓嬪唴瀹癸細

```env
SPRING_AI_OPENAI_BASE_URL=https://api.openai.com
SPRING_AI_OPENAI_API_KEY=sk-your-api-key
OPENAI_CHAT_MODEL=gpt-4.1-mini
AI_AGENT_STATION_APP_IMAGE=your-registry/ai-agent-station-app:latest
```

璇存槑锛?
- `SPRING_AI_OPENAI_BASE_URL`锛氭ā鍨嬫湇鍔″湴鍧€
- `SPRING_AI_OPENAI_API_KEY`锛氭ā鍨嬫湇鍔″瘑閽?- `OPENAI_CHAT_MODEL`锛氶粯璁よ亰澶╂ā鍨?- `AI_AGENT_STATION_APP_IMAGE`锛氬悗绔湇鍔￠暅鍍忓悕

### 3. 鍚姩鐜

Windows锛?
```powershell
./start.ps1
```

Linux / macOS锛?
```sh
sh ./start.sh
```

## 璁块棶鍦板潃

- 鍓嶇椤甸潰锛歚http://localhost:8080`
- 鍚庣鎺ュ彛锛歚http://localhost:8091/ai-agent-station`

濡傞渶鏁版嵁搴撶鐞嗗伐鍏凤紝鍙澶栧惎鍔細

```powershell
docker compose --profile tools up -d
```

- phpMyAdmin锛歚http://localhost:8899`
- pgAdmin锛歚http://localhost:5050`

## 榛樿鍒濆鍖栫瓥鐣?
鏈€灏忛儴缃查粯璁や繚鐣欎互涓嬭兘鍔涳細

- 娴佸紡瀵硅瘽
- 鍚庡彴閰嶇疆绠＄悊
- 鎺ュ彛宸℃閰嶇疆
- 宸℃缁撴灉璁板綍
- 鐭ヨ瘑搴撲笂浼?- RAG 妫€绱㈤棶绛?
涓洪伩鍏嶅惎鍔ㄩ樁娈典緷璧栭澶栫殑澶栭儴宸ュ叿鏈嶅姟锛屽垵濮嬪寲鑴氭湰浼氬叧闂笌澶栭儴鍐呭鍙戝竷鐩稿叧鐨勭ず渚嬩换鍔″拰宸ュ叿缁戝畾銆?
## 閲嶆柊鍒濆鍖?
濡傛灉淇敼浜嗘ā鍨嬪湴鍧€銆丄PI Key銆佹ā鍨嬪悕绉版垨鍒濆鍖栨暟鎹紝寤鸿閲嶆柊鍒濆鍖栫幆澧冿細

```powershell
docker compose down -v
docker compose up -d
```

濡傛灉姝ゅ墠宸茬粡鍚姩杩囨棫鐗堟湰鐜锛屼篃寤鸿鎵ц涓婅堪鍛戒护銆傛帴鍙ｅ贰妫€鍔熻兘鏂板浜嗘暟鎹簱琛ㄧ粨鏋勶紝鑰佺殑 MySQL 鏁版嵁鍗蜂笉浼氳嚜鍔ㄥ垱寤鸿繖浜涜〃銆?
## 璇存槑

璇ラ儴缃叉柟妗堥潰鍚戞湰鍦板紑鍙戜笌鍔熻兘楠岃瘉鍦烘櫙銆傝嫢鐢ㄤ簬姝ｅ紡鐜锛屽缓璁ˉ鍏呴暅鍍忓彂甯冦€佸弽鍚戜唬鐞嗐€佹寔涔呭寲鐩綍銆佺洃鎺у拰瀹夊叏閰嶇疆銆?
