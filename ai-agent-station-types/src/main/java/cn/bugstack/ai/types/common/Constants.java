package cn.bugstack.ai.types.common;

public class Constants {


    public final static String SPLIT = ",";

    public enum ResponseCode {

        SUCCESS("0000", "成功"),
        UN_ERROR("0001", "未知失败"),
        ILLEGAL_PARAMETER("0002", "非法参数"),
        INDEX_EXCEPTION("0003", "唯一索引冲突"),
        UPDATE_ZERO("0004", "更新记录为0"),
        HTTP_EXCEPTION("0005", "HTTP接口调用异常"),

        ;

        private String code;
        private String info;

        ResponseCode(String code, String info) {
            this.code = code;
            this.info = info;
        }

        public String getCode() {
            return code;
        }

        public String getInfo() {
            return info;
        }

    }

}
