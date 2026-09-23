(function () {
  const I18N = {
    zh: {
      kickerLeft: "研究伴随工具 · 非临床决策系统",
      kickerRight: "RSV 研究计算器",
      title: "RSV 入院后高级呼吸支持风险",
      lede: "使用入院评估数据估计随后使用高级呼吸支持的概率。计算在浏览器内完成。",
      navCalc: "计算器",
      navMethod: "方法",
      banner: "研究演示工具，不能替代床旁判断，也未验证用于治疗或出院决策。不同人群和时期的校准可能变化。",
      formTitle: "入院评估数据",
      exTypical: "示例 1",
      exEvent: "示例 2",
      exHigh: "示例 3",
      age: "月龄",
      ageHint: "纳入标准为 ≤24 个月",
      rr: "入院呼吸频率",
      rrHint: "入院时呼吸频率，次/分",
      spo2: "入院 SpO₂",
      spo2Hint: "入院时、吸氧前的脉搏血氧饱和度",
      dyspnea: "呼吸困难",
      wheeze: "喘息",
      no: "无",
      yes: "有",
      months: "月",
      bpm: "次/分",
      resultTitle: "锁定逻辑回归",
      pred: "预测概率",
      water: "相对开发队列中心的对数几率贡献",
      waterZero: "当前取值均在开发队列中心，贡献为 0。",
      formula: "风险公式",
      formulaNote: "系数作用于 RobustScaler 变换后的输入，不是原始测量值每增加 1 个单位的效应。",
      copy: "复制结果",
      copied: "已复制",
      copyFailed: "无法复制，请手动选择结果",
      exampleNote: "示例是变量组合，不代表某一名患儿。",
      print: "打印个案",
      methodTitle: "计算说明",
      methodP1: "输入月龄、入院呼吸频率、入院 SpO₂、呼吸困难和喘息情况。计算器使用固定的逻辑回归公式返回预测概率。",
      methodP2: "页面示例是演示用的变量组合，不代表某一名患儿。滑块范围仅表示界面支持范围，不代表所有取值均经过临床验证。",
      limitTitle: "使用限制",
      l1: "模型来自单中心回顾性研究，推广到其他人群前需要进一步验证。",
      l2: "模型尚未经过前瞻性临床部署验证。",
      l3: "预测概率可能存在校准偏差。",
      l4: "个体估计存在不确定性，不能仅凭此结果作出临床决策。",
      l5: "本工具给出概率，不给出处置建议。",
      footLeft: "RSV 研究计算器",
      footRight: "全部计算在本地完成，不上传输入",
      labels: {
        age_months: "月龄",
        resp_rate_admission: "呼吸频率",
        spo2_admission_pct: "SpO₂",
        dyspnea_or_breathing_difficulty: "呼吸困难",
        wheezing: "喘息",
      },
    },
    en: {
      kickerLeft: "Research companion · not a clinical decision system",
      kickerRight: "RSV research calculator",
      title: "Admission risk of advanced respiratory support in RSV",
      lede: "Estimate the probability of subsequent advanced respiratory support using admission assessment data. Calculations run in the browser.",
      navCalc: "Calculator",
      navMethod: "Methods",
      banner: "Research demonstration only. It does not replace bedside judgement and is not validated for treatment or discharge decisions. Calibration may vary across populations and periods.",
      formTitle: "Admission assessment",
      exTypical: "Example 1",
      exEvent: "Example 2",
      exHigh: "Example 3",
      age: "Age",
      ageHint: "Eligibility was ≤24 months",
      rr: "Admission respiratory rate",
      rrHint: "At admission, breaths/min",
      spo2: "Admission SpO₂",
      spo2Hint: "Admission pulse oximetry before oxygen supplementation",
      dyspnea: "Dyspnoea",
      wheeze: "Wheezing",
      no: "No",
      yes: "Yes",
      months: "mo",
      bpm: " /min",
      resultTitle: "Locked logistic regression",
      pred: "Predicted probability",
      water: "Log-odds contributions versus the development centre",
      waterZero: "All inputs sit at the development centre, so every contribution is 0.",
      formula: "Risk equation",
      formulaNote: "Coefficients apply to RobustScaler-transformed inputs, not to a one-unit change in the raw measurement.",
      copy: "Copy result",
      copied: "Copied",
      copyFailed: "Copy unavailable; select the result manually",
      exampleNote: "Examples are input profiles, not individual patients.",
      print: "Print case",
      methodTitle: "How it works",
      methodP1: "Enter age, admission respiratory rate, admission SpO₂, dyspnoea and wheezing. The calculator returns a probability using a fixed logistic regression equation.",
      methodP2: "Examples are demonstration input profiles, not individual patients. Slider limits define the supported input range, not a clinically validated range.",
      limitTitle: "Limitations",
      l1: "The model comes from a single-centre retrospective study; further validation is needed before use in other populations.",
      l2: "The model has not been validated in prospective clinical deployment.",
      l3: "Predicted probabilities may be miscalibrated.",
      l4: "Individual estimates are uncertain and should not determine clinical decisions.",
      l5: "The tool returns a probability, not a management recommendation.",
      footLeft: "RSV research calculator",
      footRight: "Scored locally; inputs are never uploaded",
      labels: {
        age_months: "Age",
        resp_rate_admission: "Resp. rate",
        spo2_admission_pct: "SpO₂",
        dyspnea_or_breathing_difficulty: "Dyspnoea",
        wheezing: "Wheeze",
      },
    },
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  let savedLang;
  try { savedLang = localStorage.getItem("rsv-lang"); } catch (_) { /* Storage is optional. */ }
  const state = {
    lang: ["zh", "en"].includes(savedLang) ? savedLang : "zh",
    values: Object.fromEntries(window.RSVModel.FEATURES.map((f) => [f.id, f.default])),
  };

  function t(key) {
    return I18N[state.lang][key];
  }

  function applyLang() {
    const pack = I18N[state.lang];
    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (pack[key] !== undefined) el.textContent = pack[key];
    });
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
    $$(".lang").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === state.lang));
    });
    try { localStorage.setItem("rsv-lang", state.lang); } catch (_) { /* Storage is optional. */ }
    render();
  }

  function currentInput() {
    return { ...state.values };
  }

  function setValue(id, value) {
    state.values[id] = value;
    const slider = document.getElementById(id);
    if (slider) slider.value = value;
    render();
  }

  function loadExample(id) {
    const example = window.RSVModel.EXAMPLES.find((item) => item.id === id);
    if (!example) return;
    window.RSVModel.FEATURES.forEach((f) => { state.values[f.id] = example[f.id]; });
    ["age_months", "resp_rate_admission", "spo2_admission_pct"].forEach((key) => {
      const el = document.getElementById(key);
      if (el) el.value = state.values[key];
    });
    $$(".chip").forEach((c) => c.classList.toggle("is-on", c.dataset.example === id));
    render();
  }

  function formatPct(p, digits) {
    return (p * 100).toFixed(digits);
  }

  function render() {
    const scored = window.RSVModel.score(currentInput());
    const p = scored.probability;
    $("#probValue").textContent = formatPct(p, 1);

    $("#valAge").textContent = `${Number(state.values.age_months).toFixed(1)} ${t("months")}`;
    $("#valRr").textContent = `${state.values.resp_rate_admission}${t("bpm")}`;
    $("#valSpo2").textContent = `${state.values.spo2_admission_pct}%`;

    $$("[data-bin]").forEach((btn) => {
      const id = btn.dataset.bin;
      const val = Number(btn.dataset.val);
      btn.setAttribute("aria-pressed", String(state.values[id] === val));
    });

    const maxAbs = Math.max(0.35, ...scored.parts.map((x) => Math.abs(x.contribution)));
    const labels = I18N[state.lang].labels;
    const active = scored.parts.filter((part) => Math.abs(part.contribution) >= 0.0005);
    if (!active.length) {
      $("#bars").innerHTML = `<p class="note">${t("waterZero")}</p>`;
    } else {
      $("#bars").innerHTML = scored.parts
        .map((part) => {
          const width = (Math.abs(part.contribution) / maxAbs) * 50;
          const up = part.contribution >= 0;
          const left = up ? 50 : 50 - width;
          return `<div class="bar-row">
            <b>${labels[part.id]}</b>
            <div class="track"><i class="${up ? "up" : "down"}" style="left:${left}%;width:${width}%"></i></div>
            <em>${up ? "+" : ""}${part.contribution.toFixed(3)}</em>
          </div>`;
        })
        .join("");
    }

    const terms = scored.parts
      .filter((part) => Math.abs(part.contribution) >= 0.0005)
      .map((part) => `${part.contribution >= 0 ? "+" : "−"} ${Math.abs(part.contribution).toFixed(3)}`)
      .join(" ");
    $("#eq").textContent = `logit = ${scored.intercept.toFixed(3)}${terms ? ` ${terms}` : ""} = ${scored.linear.toFixed(3)}`;
    $("#eqP").textContent = `P = 1 / (1 + exp(−logit)) = ${p.toFixed(4)}`;
  }

  async function copyResult() {
    const scored = window.RSVModel.score(currentInput());
    const v = state.values;
    const text = [
      state.lang === "zh" ? "RSV 入院高级呼吸支持风险（研究演示）" : "RSV admission risk of advanced respiratory support (research demo)",
      `Age ${v.age_months} mo; RR ${v.resp_rate_admission}; SpO2 ${v.spo2_admission_pct}%; dyspnoea ${v.dyspnea_or_breathing_difficulty}; wheeze ${v.wheezing}`,
      `P = ${(scored.probability * 100).toFixed(1)}%; logit = ${scored.linear.toFixed(3)}`,
      "Not for clinical use.",
    ].join("\n");
    const btn = $("#copyBtn");
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = t("copied");
    } catch (_) {
      btn.textContent = t("copyFailed");
    }
    setTimeout(() => { btn.textContent = t("copy"); }, 2500);
  }

  function bind() {
    $$(".lang").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lang = btn.dataset.lang;
        applyLang();
      });
    });
    ["age_months", "resp_rate_admission", "spo2_admission_pct"].forEach((id) => {
      document.getElementById(id).addEventListener("input", (e) => {
        state.values[id] = Number(e.target.value);
        $$(".chip").forEach((c) => c.classList.remove("is-on"));
        render();
      });
    });
    $$("[data-bin]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.values[btn.dataset.bin] = Number(btn.dataset.val);
        $$(".chip").forEach((c) => c.classList.remove("is-on"));
        render();
      });
    });
    $$(".chip").forEach((btn) => {
      btn.addEventListener("click", () => loadExample(btn.dataset.example));
    });
    $("#copyBtn").addEventListener("click", copyResult);
    $("#printBtn").addEventListener("click", () => window.print());
    applyLang();
    const preset = new URLSearchParams(window.location.search).get("example");
    if (preset && ["typical", "event", "high"].includes(preset)) {
      loadExample(preset);
    }
  }

  bind();
})();
