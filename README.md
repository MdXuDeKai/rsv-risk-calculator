# RSV Risk Prediction

Research software accompanying a study of admission-based prediction of advanced respiratory support in children hospitalised with respiratory syncytial virus (RSV).

## Research overview

The study examines whether routinely recorded admission variables can estimate the probability of subsequent advanced respiratory support and whether prediction performance is maintained across admission periods. The outcome concerns respiratory support during hospitalisation, rather than the diagnosis of RSV infection.

This repository provides the inference implementation of the study's five-predictor, L2-penalised logistic regression model and an interactive Streamlit calculator. The fitted parameters are fixed during inference; the application does not train or update the model from submitted inputs.

## Model

The model uses the following admission predictors:

| Predictor | Input |
| --- | --- |
| Age | Months |
| Respiratory rate | Breaths per minute |
| Peripheral oxygen saturation | SpO₂ (%) |
| Dyspnoea or breathing difficulty | Absent / present |
| Wheezing | Absent / present |

Preprocessing applies the development-set median imputation values and RobustScaler centring and scaling parameters. The transformed inputs are combined with the regression coefficients and intercept, then converted to a probability through the logistic function. The inference parameters are stored in `web/model.json`; prediction logic is implemented in `web/model.py` using the Python standard library.

The intended research population is hospitalised RSV-positive children aged 24 months or younger. The application is a research demonstration, not a validated clinical decision-support system. It should not determine diagnosis, treatment or discharge decisions. Further validation is needed before use in other settings.

## Repository structure

```text
.
├── README.md
├── LICENSE
├── web/                  # Files required to deploy the Streamlit app
│   ├── app.py            # Application entrypoint
│   ├── model.py          # Preprocessing and probability calculation
│   ├── model.json        # Fixed inference parameters and illustrative profiles
│   └── requirements.txt  # Application dependency
└── tests/
    ├── test_model.py     # Formula, input validation and example checks
    └── test_app.py       # Streamlit interaction checks
```

## Run locally

Use Python 3.12. From the repository root:

```bash
python -m pip install -r web/requirements.txt
python -m streamlit run web/app.py
```

Open the local address printed by Streamlit. The interface supports English and Chinese. The example profiles contain illustrative input combinations, not individual patient records.

## Deploy with Streamlit Community Cloud

Select this repository and use:

| Setting | Value |
| --- | --- |
| Repository | `MdXuDeKai/rsv-risk-calculator` |
| Branch | `main` |
| Main file path | `web/app.py` |
| Python version | `3.12` |

The dependency file is located beside the entrypoint at `web/requirements.txt`. No database, API key or training dataset is required. See the [Streamlit deployment documentation](https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app).

## Verification

```bash
python -m unittest discover -s tests -v
```

The tests cover fixed example probabilities, individual predictor contributions, missing-value handling, invalid inputs and interface behaviour. These checks assess implementation consistency; they are not a substitute for clinical model validation.

## Data and privacy

Patient-level data, institutional identifiers and unpublished study results are not distributed in this repository. Please do not include identifiable records in issues or pull requests.

Streamlit processes inputs on the server that hosts the application. This application has no patient identifier fields and does not write submitted values to files or databases. Use illustrative inputs on a public deployment.

## License

The software is distributed under the [MIT License](LICENSE).
