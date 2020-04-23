import { BigNumber } from "@0x/utils";
import React, { ChangeEvent, Component } from "react";
import { Subject } from "rxjs";
import { ReactComponent as ArrowRight } from "../assets/images/arrow.svg";
import { ReactComponent as CompoundImg } from "../assets/images/compound.svg";
import { ReactComponent as DownArrow } from "../assets/images/down-arrow.svg";
import { ReactComponent as Btc } from "../assets/images/ic_token_btc.svg";
import { ReactComponent as Dai } from "../assets/images/ic_token_dai.svg";
import { ReactComponent as Eth } from "../assets/images/ic_token_eth.svg";
import { ReactComponent as Knc } from "../assets/images/ic_token_knc.svg";
import { ReactComponent as Link } from "../assets/images/ic_token_link.svg";
import { ReactComponent as Rep } from "../assets/images/ic_token_rep.svg";
import { ReactComponent as Sai } from "../assets/images/ic_token_sai.svg";
import { ReactComponent as Usdc } from "../assets/images/ic_token_usdc.svg";
import { ReactComponent as Zrx } from "../assets/images/ic_token_zrx.svg";
import { ReactComponent as TopArrow } from "../assets/images/top-arrow.svg";
import { ReactComponent as TorqueLogo } from "../assets/images/torque_logo.svg";
import { Asset } from "../domain/Asset";
import { IRefinanceLoan } from "../domain/RefinanceData";
import { TorqueProviderEvents } from "../services/events/TorqueProviderEvents";
import { TorqueProvider } from "../services/TorqueProvider";
import { ReactComponent as DydxImg } from "../assets/images/dydx.svg";
import { ReactComponent as IconInfo } from "../assets/images/icon_info.svg";
import { ReactComponent as IconInfoActive } from "../assets/images/icon_info_active.svg";
import { CollateralInfo } from "./CollateralInfo";

interface IRefinanceAssetCompoundLoanItemState {
  isShow: boolean;
  isShowInfoCollateralAssetDt0: boolean;
  isShowInfoCollateralAssetDt1: boolean;
  isLoading: boolean;
  isTrack: boolean;
  inputAmountText: number;
  borrowAmount: BigNumber;
  fixedApr: BigNumber;
}

export class RefinanceAssetCompoundLoanItem extends Component<IRefinanceLoan, IRefinanceAssetCompoundLoanItemState> {
  private _input: HTMLInputElement | null = null;
  private readonly _inputTextChange: Subject<number>;

  constructor(props: IRefinanceLoan) {
    super(props);
    this.state = {
      isShow: true,
      isShowInfoCollateralAssetDt0: false,
      isShowInfoCollateralAssetDt1: false,
      inputAmountText: parseInt(this.props.balance.dp(3, BigNumber.ROUND_FLOOR).toString(), 10),
      borrowAmount: this.props.balance,
      fixedApr: new BigNumber(0),
      isLoading: false,
      isTrack: false

    };
    TorqueProvider.Instance.eventEmitter.on(TorqueProviderEvents.ProviderAvailable, this.onProviderAvailable);
    this._inputTextChange = new Subject<number>();
  }


  private onProviderAvailable = () => {
    this.derivedUpdate();
  };

  public componentWillUnmount(): void {
    TorqueProvider.Instance.eventEmitter.removeListener(TorqueProviderEvents.ProviderAvailable, this.onProviderAvailable);
  }

  public componentDidMount(): void {
    const amountText = this.props.balance;
    this.setState({
      ...this.state,
      inputAmountText: parseInt(this.props.balance.dp(3, BigNumber.ROUND_FLOOR).toString(), 10),
      borrowAmount: amountText
    }, () => {
      // emitting next event for processing with rx.js
      this._inputTextChange.next(this.state.inputAmountText);
    });
    this.derivedUpdate();
  }

  public componentDidUpdate(
    prevProps: Readonly<IRefinanceLoan>,
    prevState: Readonly<IRefinanceAssetCompoundLoanItemState>,
    snapshot?: any
  ): void {
    // if (this.props.asset !== prevProps.asset) {
    //   this.derivedUpdate();
    // }
  }


  private _setInputRef = (input: HTMLInputElement) => {
    this._input = input;
  };

  public loanAmountChange = async (event: ChangeEvent<HTMLInputElement>) => {
    // handling different types of empty values
    const amountText = event.target.value ? event.target.value : "0";
    // console.log(amountText);
    // setting inputAmountText to update display at the same time

    this.setState({
      ...this.state,
      inputAmountText: parseInt(amountText, 10),
      borrowAmount: new BigNumber(amountText)
    }, () => {
      // emitting next event for processing with rx.js
      this._inputTextChange.next(this.state.inputAmountText);
    });
  };

  public showDetails = () => {
    this.setState({ ...this.state, isShow: !this.state.isShow });
  };

  public migrateLoan = async () => {
    const loan = Object.assign({}, this.props);
    if (this.props.type == "dydx") {
      await TorqueProvider.Instance.migrateSoloLoan(loan, this.state.borrowAmount); // TODO
    } else {
      await TorqueProvider.Instance.migrateCompoundLoan(loan, this.state.borrowAmount); // TODO
    }
  };

  private derivedUpdate = async () => {
    const interestRate = await TorqueProvider.Instance.getAssetInterestRate(this.props.collateral[0].asset);
    this.setState({ ...this.state, fixedApr: interestRate });
  };

  public showInfoCollateralAssetDt0 = () => {
    this.setState({ ...this.state, isShowInfoCollateralAssetDt0: !this.state.isShowInfoCollateralAssetDt0 });
  };

  public showInfoCollateralAssetDt1 = () => {
    this.setState({ ...this.state, isShowInfoCollateralAssetDt1: !this.state.isShowInfoCollateralAssetDt1 });
  };

  public render() {
    // const assetTypeModifier = "asset-selector-item--"+this.props.asset.toLowerCase();
    const loanAssetDt: any = this.getAssetsData(this.props.asset);
    const collateralAssetDt: any = this.getAssetsData(this.props.collateral[0].asset);
    let collateralAssetDt2: any = "";
    if (this.props.collateral.length > 1) {
      collateralAssetDt2 = this.getAssetsData(this.props.collateral[1].asset);
    }
    this.getAssetsData(this.props.collateral[0].asset);
    const head_image = this.props.type == "dydx" ? <DydxImg /> : <CompoundImg />;
    const assetTypeModifier = !this.state.isShow ? "asset-collateral-show" : "asset-collateral-hide";
    const showDetailsValue = this.state.isShow ? "Show details" : "Hide details";
    const arrowIcon = !this.state.isShow ? <TopArrow /> : <DownArrow />;
    const arrowDiv = !this.state.isShow ? "arrow-div-down" : "arrow-div-top";
    let btnValue = 'Refinance with ' + this.state.fixedApr.dp(1, BigNumber.ROUND_CEIL).toString() + '% APR Fixed';
    let btnActiveValue = 'Refinance with ' + this.state.fixedApr.dp(1, BigNumber.ROUND_CEIL).toString() + '% APR Fixed'
    const refRateYear = ((parseFloat(this.props.apr.dp(0, BigNumber.ROUND_CEIL).toString()) - parseFloat(this.state.fixedApr.dp(1, BigNumber.ROUND_CEIL).toString())) * parseFloat(this.props.balance.dp(3, BigNumber.ROUND_FLOOR).toString())) / 100;
    const refRateMonth = refRateYear / 12;
    const btnCls = this.props.apr.gt(this.state.fixedApr) ? "mt30" : "";
    const iconInfoCollateralAssetDt0 = this.state.isShowInfoCollateralAssetDt0 ? <IconInfoActive /> : <IconInfo />;
    const iconInfoCollateralAssetDt1 = this.state.isShowInfoCollateralAssetDt1 ? <IconInfoActive /> : <IconInfo />;
    return (

      <div className={`refinance-asset-selector-item `}>
        <div className="refinance-asset__main-block">
          {/*<div className="refinance-asset-selector__title">CDP {this.state.RefinanceCompoundData[0].cdpId.toFixed(0)}*/}

          {/*</div>*/}
          <div className="refinance-asset-selector__non-torque">
            <div className="refinance-asset-selector__non-torque-logo">
              {head_image}
            </div>
            <div className="refinance-asset-selector__non-torque-apr">
              <div className="value">{this.props.apr.dp(0, BigNumber.ROUND_CEIL).toString()}%</div>
              <div className="text">Variable APR</div>
            </div>
            <div className="refinance__input-container">
              <input
                ref={this._setInputRef}
                className="input-amount"
                type="number"
                defaultValue={this.props.balance.dp(3, BigNumber.ROUND_FLOOR).toString()}
                placeholder={`Amount`}
                disabled={this.props.isDisabled}
                onChange={this.loanAmountChange}
              />
              <div className="refinance-details-msg--warning">
                {this.state.borrowAmount.lte(0) ? "Please enter value greater than 0" : ""}
                {this.state.borrowAmount.gt(this.props.balance) ? "Please enter value less than or equal to " + this.props.balance.dp(3, BigNumber.ROUND_FLOOR).toString() : ""}
              </div>
            </div>

              {this.props.isDisabled ? (
                <div className="collaterization-warning">Collateralization should be 150%+</div>) : null}
          </div>
          <div className="refinance-asset-selector__torque">
            <div className="refinance-asset-selector__torque-logo">
              <TorqueLogo />
            </div>
            <div className="refinance-asset-selector__torque-apr">
              <div className="value">{this.state.fixedApr.dp(1, BigNumber.ROUND_CEIL).toString()}%</div>
              <div className="text">Fixed APR</div>
            </div>
            <div className="refinance-asset-selector__torque-loan-container">
              <div className="asset-icon">
                {loanAssetDt}
              </div>
              <div className="loan-value">
                <div className="value">{this.state.borrowAmount.dp(3, BigNumber.ROUND_FLOOR).toString()}</div>
                <div className="text">Loan</div>
              </div>
              <div className="asset-name">{this.props.asset}</div>
            </div>
            <div className="refinance-asset-selector__torque-details" onClick={this.showDetails}>
              <p>{showDetailsValue}</p>
              <span className="arrow">
                {arrowIcon}
                {/*<img className="arrow-icon" src={arrowIcon}/>*/}
              </span>
            </div>
            {this.state.isShow && <div className="refinance-asset-selector__collateral-container">
              <div className="refinance-asset-selector__collateral">

                <div className="asset-icon">
                  {collateralAssetDt}
                </div>
                <div className="collateral-value">
                  <div className="value">
                    {this.props.collateral[0].balance.dp(3, BigNumber.ROUND_FLOOR).toString()}
                  </div>
                  <div className="text">Collateral</div>
                </div>
                <div className="asset-name">
                  {this.props.collateral[0].asset}

                  <div className="info-icon" onClick={this.showInfoCollateralAssetDt0}>
                    {iconInfoCollateralAssetDt0}
                  </div>
                </div>

              </div>
              {this.state.isShowInfoCollateralAssetDt0
                ? <CollateralInfo />
                : null
              }
            </div>
            }
            {this.state.isShow && collateralAssetDt2 &&
              <div className="refinance-asset-selector__collateral-container">
                <div className="refinance-asset-selector__collateral">

                  <div className="refinance-asset-selector__icon">
                    {collateralAssetDt2}
                  </div>
                  <div className="refinance-asset-selector__loan-value">
                    <div className="refinance-asset-selector__value">
                      {this.props.collateral[1].balance.dp(3, BigNumber.ROUND_FLOOR).toString()}
                    </div>
                    <div className="refinance-asset-selector__loantxt">Collateral</div>
                    <div className="refinance-asset-selector__loantxt ml7">{this.props.collateral[0].asset}</div>

                    <div className="refinance-asset-selector__info_icon" onClick={this.showInfoCollateralAssetDt1}>
                      {iconInfoCollateralAssetDt1}
                    </div>
                  </div>
                </div>
                {this.state.isShowInfoCollateralAssetDt1
                  && <CollateralInfo />
                }

              </div>}
          </div>
          {/*<div className="refinance-asset-selector__type">1.500</div>*/}
        </div>
        <div className="refinance-asset__action-block">
          {this.props.apr.gt(this.state.fixedApr) ?
            <div className="refinance-asset-selector__desc">
              Refinancing with&nbsp;<b>FIXED</b>&nbsp;rates could save you &nbsp;
              <div className="refinance-asset-selector__rs">${refRateMonth.toFixed(2)}/mo or
                ${refRateYear.toFixed(2)}/yr
              </div>
            </div>
            : <div className="refinance-asset-selector__desc" />
          }

          {this.props.isDisabled || this.state.borrowAmount.lte(0) || this.state.borrowAmount.gt(this.props.balance) || this.state.isLoading ?
            <div className={`refinance-selector-icons__item refinance-selector-icons-disabled__button ${btnCls}`}>
              {btnValue}
            </div>
            :
            <div className={`refinance-selector-icons__item refinance-selector-icons-bar__button ${btnCls}`}
              onClick={this.migrateLoan}>
              {btnActiveValue}
            </div>
          }
        </div>

      </div>
    );
  }

  private getAssetsData = (asset: Asset) => {
    switch (asset) {
      case Asset.DAI:
        return <Dai />;
      case Asset.SAI:
        return <Sai />;
      case Asset.USDC:
        return <Usdc />;
      case Asset.ETH:
        return <Eth />;
      case Asset.WBTC:
        return <Btc />;
      case Asset.LINK:
        return <Link />;
      case Asset.ZRX:
        return <Zrx />;
      case Asset.REP:
        return <Rep />;
      case Asset.KNC:
        return <Knc />;
    }
  };
}
