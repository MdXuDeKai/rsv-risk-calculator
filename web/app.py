"""Streamlit entrypoint. Run from the repository root: streamlit run web/app.py."""
import streamlit as st
from model import CONFIG, predict

TEXT = {
    "中文": {
        "title": "RSV 高级呼吸支持风险预测",
        "intro": "基于入院评估的五变量逻辑回归模型，用于研究展示。",
        "notice": "本工具尚未验证用于临床处置，不能据此作出诊断、治疗或出院决策。",
        "profile": "演示示例", "custom": "自定义输入", "example": "示例",
        "input": "入院评估数据", "result": "预测结果", "probability": "高级呼吸支持预测概率",
        "no": "无", "yes": "有", "equation": "计算公式与变量贡献",
        "contribution": "变量贡献（对数几率）", "predictor": "变量",
        "method": "模型说明", "limits": "使用范围",
        "method_text": "模型使用固定的中位数填补值、中心和尺度进行变换，再计算逻辑回归概率。变量贡献相对于模型中心值计算，不表示因果效应。",
        "limit_text": "适用于研究中住院且 RSV 阳性、年龄不超过 24 个月的人群。模型来自单中心回顾性研究，推广使用前需要进一步验证。预测概率可能存在校准偏差。",
        "input_note": "SpO₂ 使用入院时、吸氧前记录。示例是演示用的变量组合，不代表真实患儿；输入框范围不等同于经过临床验证的范围。",
        "privacy": "输入由运行本应用的服务器处理；本应用不将输入写入文件或数据库。请勿输入可识别患者身份的信息。",
    },
    "English": {
        "title": "RSV advanced respiratory support risk",
        "intro": "A five-predictor logistic regression using admission assessment data, presented for research use.",
        "notice": "This tool has not been validated for clinical management. Do not use it to make diagnosis, treatment or discharge decisions.",
        "profile": "Illustrative profile", "custom": "Custom input", "example": "Example",
        "input": "Admission assessment", "result": "Prediction", "probability": "Predicted probability of advanced respiratory support",
        "no": "No", "yes": "Yes", "equation": "Equation and predictor contributions",
        "contribution": "Contribution (log-odds)", "predictor": "Predictor",
        "method": "Model", "limits": "Scope",
        "method_text": "The model uses fixed median imputation, centring and scaling parameters before applying the logistic regression equation. Contributions are relative to the model centre and are not causal effects.",
        "limit_text": "The study population comprised hospitalised RSV-positive children aged 24 months or younger. The model comes from a single-centre retrospective study and requires further validation before wider use. Probabilities may be miscalibrated.",
        "input_note": "Use admission SpO₂ recorded before oxygen supplementation. Examples are illustrative profiles, not individual patients; supported input ranges do not imply clinical validation throughout those ranges.",
        "privacy": "Inputs are processed by the server running this app. The application does not write inputs to files or databases. Do not enter patient identifiers.",
    },
}

st.set_page_config(page_title="RSV Risk Calculator", page_icon="🫁", layout="centered")
language = st.sidebar.selectbox("Language / 语言", tuple(TEXT), key="language")
t = TEXT[language]
suffix = "zh" if language == "中文" else "en"
features = CONFIG["features"]
examples = {example["id"]: example for example in CONFIG["examples"]}

for feature in features:
    initial = float(feature["default"]) if feature["id"] == "age_months" else int(feature["default"])
    st.session_state.setdefault(feature["id"], initial)


def load_profile():
    example = examples.get(st.session_state["profile"])
    if example:
        for feature in features:
            key = feature["id"]
            st.session_state[key] = float(example[key]) if key == "age_months" else int(example[key])


def mark_custom():
    st.session_state["profile"] = "custom"


labels = {"custom": t["custom"]}
labels.update({key: f"{t['example']} {i}" for i, key in enumerate(examples, 1)})
st.sidebar.selectbox(t["profile"], tuple(labels), format_func=labels.get,
                     key="profile", on_change=load_profile)
st.title(t["title"])
st.caption(t["intro"])
st.info(t["notice"])
inputs, result = st.columns([1.1, 1], gap="large")
values = {}
with inputs:
    st.subheader(t["input"])
    for feature in features:
        key = feature["id"]
        label = feature[f"label_{suffix}"]
        unit = feature[f"unit_{suffix}"]
        if unit:
            label += f" ({unit})"
        if feature["type"] == "binary":
            values[key] = st.radio(label, (0, 1), format_func=lambda value: t["yes"] if value else t["no"],
                                   horizontal=True, key=key, on_change=mark_custom)
        else:
            number = float if key == "age_months" else int
            values[key] = st.number_input(label, min_value=number(feature["min"]),
                                          max_value=number(feature["max"]), step=number(feature["step"]),
                                          key=key, on_change=mark_custom)
    st.caption(t["input_note"])

with result:
    st.subheader(t["result"])
    try:
        score = predict(values)
    except ValueError as exc:
        st.error(str(exc))
        st.stop()
    st.metric(t["probability"], f"{score['probability']:.1%}")
    with st.expander(t["equation"]):
        st.code(f"logit = {score['linear']:.6f}\nP = 1 / (1 + exp(-logit)) = {score['probability']:.6f}")
        names = {feature["id"]: feature[f"label_{suffix}"] for feature in features}
        st.table([{t["predictor"]: names[part["id"]],
                   t["contribution"]: f"{part['contribution']:+.3f}"} for part in score["parts"]])
    st.markdown(f"**{t['method']}**")
    st.write(t["method_text"])
    st.markdown(f"**{t['limits']}**")
    st.write(t["limit_text"])

st.divider()
st.caption(t["privacy"])
