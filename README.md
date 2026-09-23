# RSV Risk Calculator

A browser-based calculator project for respiratory syncytial virus (RSV) research and educational demonstration.

## Project status

The browser calculator and its scoring code are available in this repository. Calculations run locally in the browser.

## Run locally

Download the repository and open `index.html` in a browser. For a local web server, run `python -m http.server 8080` in the repository directory and visit `http://localhost:8080`.

The interface supports Chinese and English. Example inputs are illustrative profiles, not patient records.

## Verify the implementation

Run `python scripts/verify_formula.py` with Python 3 and Node.js 18 or later installed. After editing `data/model.json`, run `python scripts/build_model.py` to regenerate the browser configuration.

## Intended use

For research and educational use only. The calculator is not a validated clinical decision-support system and should not be used to make diagnosis, treatment, or discharge decisions.

## Privacy

This repository does not include patient-level data. Please do not submit personal identifiers, medical records, or confidential research materials in public issues or pull requests.

## 中文说明

这是一个用于 RSV 相关研究展示与学习的网页计算器项目。仓库已包含网页计算器及其评分代码，计算在浏览器内完成。

本项目不用于临床诊断、治疗或出院决策。请勿在公开反馈中提交个人身份信息、病历或未公开研究资料。
