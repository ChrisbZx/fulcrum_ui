//import { BigNumber } from "@0x/utils";
//import React, { ChangeEvent, Component, FormEvent } from "react";
//import TagManager from "react-gtm-module";
//import { merge, Observable, Subject } from "rxjs";
//import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
//import { Asset } from "../domain/Asset";
//import { AssetDetails } from "../domain/AssetDetails";
//import { AssetsDictionary } from "../domain/AssetsDictionary";
import { ManageCollateralRequest } from "../domain/ManageCollateralRequest";
import { CollateralSlider } from "./CollateralSlider";

//#region tradeComponent
import { BigNumber } from "@0x/utils";
import React, { ChangeEvent, Component, FormEvent } from "react";
import TagManager from "react-gtm-module";
import { merge, Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { ReactComponent as SlippageDown } from "../assets/images/ic__slippage_down.svg"
import { Asset } from "../domain/Asset";
import { AssetDetails } from "../domain/AssetDetails";
import { AssetsDictionary, AssetsDictionaryMobile } from "../domain/AssetsDictionary";
import { PositionType } from "../domain/PositionType";
//import { TradeRequest } from "../domain/TradeRequest";
import { TradeTokenKey } from "../domain/TradeTokenKey";
import { TradeType } from "../domain/TradeType";
import { FulcrumProviderEvents } from "../services/events/FulcrumProviderEvents";
import { ProviderChangedEvent } from "../services/events/ProviderChangedEvent";
import { FulcrumProvider } from "../services/FulcrumProvider";
import { CollapsibleContainer } from "./CollapsibleContainer";
import { CollateralTokenButton } from "./CollateralTokenButton";
import { CollateralTokenSelector } from "./CollateralTokenSelector";
import { UnitOfAccountSelector } from "./UnitOfAccountSelector";
import { Preloader } from "./Preloader";



interface IInputAmountLimited {
  inputAmountValue: BigNumber;
  inputAmountText: string;
  tradeAmountValue: BigNumber;
  maxTradeValue: BigNumber;
}

interface ITradeExpectedResults {
  tradedAmountEstimate: BigNumber;
  slippageRate: BigNumber;
  exposureValue: BigNumber;
}

interface ITradeAmountChangeEvent {
  isTradeAmountTouched: boolean;

  inputAmountText: string;
  inputAmountValue: BigNumber;
  tradeAmountValue: BigNumber;
  maxTradeValue: BigNumber;

  tradedAmountEstimate: BigNumber;
  slippageRate: BigNumber;
  exposureValue: BigNumber;
}
//#endregion tradeComponent

export interface IManageCollateralFormProps {
  //asset: Asset;

  onSubmit: (request: ManageCollateralRequest) => void;
  onCancel: () => void;

  //#region tradeComponent
  tradeType: TradeType;
  asset: Asset;
  positionType: PositionType;
  leverage: number;
  defaultCollateral: Asset;
  defaultUnitOfAccount: Asset;
  defaultTokenizeNeeded: boolean;
  bestCollateral: Asset;
  version: number;
  isMobileMedia: boolean;

  // onSubmit: (request: TradeRequest) => void;
  //onCancel: () => void;
  onManage: (request: ManageCollateralRequest) => void;

  //#endregion tradeComponent
}

interface IManageCollateralFormState {
  // assetDetails: AssetDetails | null;
  positionValue: number;
  currentValue: number;
  selectedValue: number;
  diffAmount: BigNumber;
  // liquidationPrice: BigNumber;

  //#region tradeComponent
  assetDetails: AssetDetails | null;
  collateral: Asset;
  tokenizeNeeded: boolean;
  interestRate: BigNumber | null;

  isTradeAmountTouched: boolean;

  inputAmountText: string;
  inputAmountValue: BigNumber;
  tradeAmountValue: BigNumber;
  maxTradeValue: BigNumber;

  balance: BigNumber | null;
  ethBalance: BigNumber | null;
  positionTokenBalance: BigNumber | null;
  maybeNeedsApproval: boolean;

  isChangeCollateralOpen: boolean;

  tradedAmountEstimate: BigNumber;
  slippageRate: BigNumber;
  pTokenAddress: string;

  currentPrice: BigNumber;
  liquidationPrice: BigNumber;
  exposureValue: BigNumber;

  isAmountExceeded: boolean;
  maxAmountMultiplier: BigNumber;

  isLoading: boolean;
  isExposureLoading: boolean;

  selectedUnitOfAccount: Asset;
  //#endregion tradeComponent
}

export class ManageCollateralForm extends Component<IManageCollateralFormProps, IManageCollateralFormState> {
  private minValue: number = 0;
  private maxValue: number = 100;

  //#region tradeComponent
  private readonly _inputPrecision = 6;
  private _input: HTMLInputElement | null = null;

  private readonly _inputChange: Subject<string>;
  private readonly _inputSetMax: Subject<BigNumber>;

  private _isMounted: boolean;
  //#endregion tradeComponent

  constructor(props: IManageCollateralFormProps, context?: any) {
    super(props, context);

    //#region tradeComponent
    let assetDetails = AssetsDictionary.assets.get(props.asset);
    if (this.props.isMobileMedia) {
      assetDetails = AssetsDictionaryMobile.assets.get(this.props.asset);
    }
    const interestRate = null;
    const balance = null;
    const ethBalance = null;
    const positionTokenBalance = null;
    const maxTradeValue = new BigNumber(0);
    const slippageRate = new BigNumber(0);
    const tradedAmountEstimate = new BigNumber(0);
    const currentPrice = new BigNumber(0);
    const liquidationPrice = new BigNumber(0);
    const exposureValue = new BigNumber(0);
    const maxAmountMultiplier = new BigNumber(0);
    this._isMounted = false;
    //#endregion tradeComponent

    this.state = {
      // assetDetails: AssetsDictionary.assets.get(this.props.asset) || null,
      positionValue: 66,
      currentValue: 66,
      selectedValue: 66,
      diffAmount: new BigNumber(0),
      // liquidationPrice: new BigNumber(700),

      //#region tradeComponent
      assetDetails: assetDetails || null,
      collateral: props.bestCollateral,
      tokenizeNeeded: props.defaultTokenizeNeeded,
      isTradeAmountTouched: false,
      inputAmountText: "",
      inputAmountValue: maxTradeValue,
      tradeAmountValue: maxTradeValue,
      maxTradeValue: maxTradeValue,
      balance: balance,
      ethBalance: ethBalance,
      positionTokenBalance: positionTokenBalance,
      isChangeCollateralOpen: false,
      tradedAmountEstimate: tradedAmountEstimate,
      slippageRate: slippageRate,
      interestRate: interestRate,
      pTokenAddress: "",
      maybeNeedsApproval: false,
      currentPrice: currentPrice,
      liquidationPrice: liquidationPrice,
      exposureValue: exposureValue,
      isAmountExceeded: false,
      maxAmountMultiplier: maxAmountMultiplier,
      isLoading: true,
      isExposureLoading: true,
      selectedUnitOfAccount: this.props.defaultUnitOfAccount
      //#endregion tradeComponent
    };

    //#region tradeComponent
    this._inputChange = new Subject();
    this._inputSetMax = new Subject();

    merge(
      this._inputChange.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap((value) => this.rxFromCurrentAmount(value))
      ),
      this._inputSetMax.pipe(
        switchMap((value) => this.rxFromMaxAmountWithMultiplier(value))
      )
    ).pipe(
      switchMap((value) => new Observable<ITradeAmountChangeEvent | null>((observer) => observer.next(value)))
    ).subscribe(next => {
      if (next) {
        this._isMounted && this.setState({ ...this.state, ...next, isLoading: false, isExposureLoading: false });
      } else {
        this._isMounted && this.setState({
          ...this.state,
          isTradeAmountTouched: false,
          inputAmountText: "",
          inputAmountValue: new BigNumber(0),
          tradeAmountValue: new BigNumber(0),
          tradedAmountEstimate: new BigNumber(0),
          slippageRate: new BigNumber(0),
          exposureValue: new BigNumber(0),
          isLoading: false,
          isExposureLoading: false
        })
      }
    });

    FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.ProviderChanged, this.onProviderChanged);

    //#endregion tradeComponent
  }

  //#region tradeComponent
  private getTradeTokenGridRowSelectionKey(leverage: number = this.props.leverage) {
    return new TradeTokenKey(
      this.props.asset,
      this.state.selectedUnitOfAccount,
      this.props.positionType,
      leverage,
      this.state.tokenizeNeeded,
      this.props.version
    );
  }

  private _setInputRef = (input: HTMLInputElement) => {
    this._input = input;
  };
  //#endregion tradeComponent

  private async derivedUpdate() {

    // TODO: calculate and update this.state.diffAmount and this.state.liquidationPrice
    this.setState({
      ...this.state,
      diffAmount: new BigNumber(this.state.selectedValue * 3),
      liquidationPrice: new BigNumber(700 - this.state.selectedValue)
    });

    //#region tradeComponent
    let assetDetails = AssetsDictionary.assets.get(this.props.asset);
    if (this.props.isMobileMedia) {
      assetDetails = AssetsDictionaryMobile.assets.get(this.props.asset);
    }
    const tradeTokenKey = this.getTradeTokenGridRowSelectionKey(this.props.leverage);
    const interestRate = await FulcrumProvider.Instance.getTradeTokenInterestRate(tradeTokenKey);
    const positionTokenBalance = await FulcrumProvider.Instance.getPTokenBalanceOfUser(tradeTokenKey);
    const balance =
      this.props.tradeType === TradeType.BUY
        ? await FulcrumProvider.Instance.getAssetTokenBalanceOfUser(this.state.collateral)
        : positionTokenBalance;
    const ethBalance = await FulcrumProvider.Instance.getEthBalance();

    // maxTradeValue is raw here, so we should not use it directly
    const maxTradeValue = await FulcrumProvider.Instance.getMaxTradeValue(this.props.tradeType, tradeTokenKey, this.state.collateral);
    const limitedAmount = await this.getInputAmountLimited(this.state.inputAmountText, this.state.inputAmountValue, tradeTokenKey, maxTradeValue, false);
    const tradeRequest = new ManageCollateralRequest(
      new BigNumber(this.state.currentValue),
      this.props.tradeType,
      this.props.asset,
      this.state.selectedUnitOfAccount,
      this.state.collateral,
      this.props.positionType,
      this.props.leverage,
      limitedAmount.tradeAmountValue,// new BigNumber(0),
      this.state.tokenizeNeeded,
      this.props.version,
      this.state.inputAmountValue
    );

    const tradeExpectedResults = await this.getTradeExpectedResults(tradeRequest);

    const address = FulcrumProvider.Instance.contractsSource
      ? await FulcrumProvider.Instance.contractsSource.getPTokenErc20Address(tradeTokenKey) || ""
      : "";

    const maybeNeedsApproval = this.props.tradeType === TradeType.BUY ?
      await FulcrumProvider.Instance.checkCollateralApprovalForTrade(tradeRequest) :
      false;

    const latestPriceDataPoint = await FulcrumProvider.Instance.getTradeTokenAssetLatestDataPoint(tradeTokenKey);
    const liquidationPrice = new BigNumber(latestPriceDataPoint.liquidationPrice);

    this._isMounted && this.setState({
      ...this.state,
      assetDetails: assetDetails || null,
      inputAmountText: limitedAmount.inputAmountText,// "",
      inputAmountValue: limitedAmount.inputAmountValue,// new BigNumber(0),
      tradeAmountValue: limitedAmount.tradeAmountValue,// new BigNumber(0),
      maxTradeValue: limitedAmount.maxTradeValue,
      balance: balance,
      ethBalance: ethBalance,
      positionTokenBalance: positionTokenBalance,
      tradedAmountEstimate: tradeExpectedResults.tradedAmountEstimate,
      slippageRate: tradeExpectedResults.slippageRate,
      interestRate: interestRate,
      pTokenAddress: address,
      // collateral: this.props.defaultCollateral,
      maybeNeedsApproval: maybeNeedsApproval,
      currentPrice: new BigNumber(latestPriceDataPoint.price),
      liquidationPrice: liquidationPrice,
      exposureValue: tradeExpectedResults.exposureValue
    });
  }

  private onProviderChanged = async (event: ProviderChangedEvent) => {
    await this.derivedUpdate();
  };

  public componentWillUnmount(): void {
    this._isMounted = false;

    window.history.back();
    FulcrumProvider.Instance.eventEmitter.removeListener(FulcrumProviderEvents.ProviderChanged, this.onProviderChanged);
  }
  //#endregion tradeComponent

  public async componentDidMount() {
    // this.derivedUpdate();

    //#region tradeComponent
    this._isMounted = true;

    await this.derivedUpdate();
    window.history.pushState(null, "Trade Modal Opened", `/#/trade/${this.props.tradeType.toLocaleLowerCase()}-${this.props.leverage}x-${this.props.positionType.toLocaleLowerCase()}-${this.props.asset}/`);

    if (this._input) {
      // this._input.select();
      this._input.focus();
      this._inputSetMax.next();
    }
    //#endregion tradeComponent
  }

  public componentDidUpdate(
    prevProps: Readonly<IManageCollateralFormProps>,
    prevState: Readonly<IManageCollateralFormState>,
    snapshot?: any
  ): void {
    if (
      prevProps.asset !== this.props.asset ||
      prevState.positionValue !== this.state.positionValue ||
      //#region tradeComponent
      this.props.tradeType !== prevProps.tradeType ||
      this.props.asset !== prevProps.asset ||
      this.props.positionType !== prevProps.positionType ||
      this.props.leverage !== prevProps.leverage ||
      this.props.defaultUnitOfAccount !== prevProps.defaultUnitOfAccount ||
      this.props.defaultTokenizeNeeded !== prevProps.defaultTokenizeNeeded ||
      this.props.version !== prevProps.version ||
      this.state.collateral !== prevState.collateral ||
      //#endregion tradeComponent
      prevState.selectedValue !== this.state.selectedValue
    ) {
      // this.derivedUpdate();
      //#region tradeComponent
      if (this.state.collateral !== prevState.collateral) {
        this._isMounted && this.setState({
          ...this.state,
          inputAmountText: "",
          inputAmountValue: new BigNumber(0),
          tradeAmountValue: new BigNumber(0)
        }, () => {
          this.derivedUpdate();
        });
      } else {
        this.derivedUpdate();
      }
      //#endregion tradeComponent

    }
  }


  public render() {
    if (!this.state.assetDetails) {
      return null;
    }

    //#region tradeComponent
    const multiplier = this.state.tradeAmountValue.dividedBy(this.state.maxTradeValue).toNumber();
    const amountMsg =
      this.state.ethBalance && this.state.ethBalance.lte(FulcrumProvider.Instance.gasBufferForTrade)
        ? "Insufficient funds for gas"
        : this.state.balance && this.state.balance.eq(0)
          ? "Your wallet is empty"
          : (this.state.tradeAmountValue.gt(0) && this.state.slippageRate.eq(0))
            && (this.state.collateral === Asset.ETH || !this.state.maybeNeedsApproval)
            ? ``// `Your trade is too small.`
            : this.state.slippageRate.gte(0.01) && this.state.slippageRate.lt(99) // gte(0.2)
              ? `Slippage:`
              : "";
    //#endregion tradeComponent

    return (
      <form className="manage-collateral-form" onSubmit={this.onSubmitClick}>
        <div className="manage-collateral-form__title">Manage your collateral</div>

        <CollateralSlider
          minValue={this.minValue}
          maxValue={this.maxValue}
          value={this.state.currentValue}
          onUpdate={this.onUpdate}
          onChange={this.onChange}
        />

        <div className="manage-collateral-form__tips">
          <div className="manage-collateral-form__tip">Withdraw</div>
          <div className="manage-collateral-form__tip">Top Up</div>
        </div>

        <hr className="manage-collateral-form__delimiter" />

        <div className="manage-collateral-form__info-liquidated-at-container">
          <div className="manage-collateral-form__info-liquidated-at-msg">
            Your loan will be liquidated if the price of
          </div>
          <div className="manage-collateral-form__info-liquidated-at-price">
            {this.state.assetDetails.displayName} falls below ${this.state.liquidationPrice.toFixed(2)}
          </div>
        </div>

        {this.state.positionValue !== this.state.selectedValue ? (
          <div className="manage-collateral-form__operation-result-container">
            <img className="manage-collateral-form__operation-result-img" src={this.state.assetDetails.logoSvg} />
            <div className="manage-collateral-form__operation-result-msg">
              You will {this.state.positionValue > this.state.selectedValue ? "withdraw" : "top up"}
            </div>
            <div className="manage-collateral-form__operation-result-amount">
              {this.state.diffAmount.toFixed(6)} {this.state.assetDetails.displayName}
            </div>
          </div>
        ) : null}

        {//#region tradeComponent
        }
        <div className={`trade-form__form-container ${this.props.tradeType === TradeType.BUY ? "buy" : "sell"}`}>
          <div className="trade-form__form-values-container">
            {/* {!this.props.isMobileMedia && this.props.tradeType === TradeType.BUY ? (
              <TradeExpectedResult value={tradeExpectedResultValue} />
            ) : null} */}

            <div className="trade-form__kv-container">
              {amountMsg.includes("Slippage:") ? (
                <div title={`${this.state.slippageRate.toFixed(18)}%`} className="trade-form__label slippage">
                  {amountMsg}
                  <span className="trade-form__slippage-amount">
                    &nbsp;{`${this.state.slippageRate.toFixed(2)}%`}<SlippageDown />
                  </span>
                </div>
              ) : (<div className="trade-form__label">{amountMsg}</div>)}

            </div>

            <div className="trade-form__amount-container">
              <input
                type="number"
                step="any"
                ref={this._setInputRef}
                className="trade-form__amount-input"
                value={!this.state.isLoading ? this.state.inputAmountText : ""}
                onChange={this.onTradeAmountChange}
              />
              {!this.state.isLoading ? null
                : <div className="preloader-container"> <Preloader width="80px" /></div>
              }
              <div className="trade-form__collateral-button-container">
                <CollateralTokenButton asset={this.state.collateral} onClick={this.onChangeCollateralOpen} isChangeCollateralOpen={this.state.isChangeCollateralOpen} />
              </div>
              {this.state.isChangeCollateralOpen
                ?
                <CollateralTokenSelector
                  selectedCollateral={this.state.collateral}
                  collateralType={this.props.tradeType === TradeType.BUY ? `Purchase` : `Withdrawal`}
                  onCollateralChange={this.onChangeCollateralClicked}
                  onClose={this.onChangeCollateralClose}
                  tradeType={this.props.tradeType} />
                :
                null
              }
            </div>
            <div className="trade-form__group-button">
              <button data-value="0.25" className={multiplier === 0.25 ? "active " : ""} onClick={this.onInsertMaxValue}>25%</button>
              <button data-value="0.5" className={multiplier === 0.5 ? "active " : ""} onClick={this.onInsertMaxValue}>50%</button>
              <button data-value="0.75" className={multiplier === 0.75 ? "active " : ""} onClick={this.onInsertMaxValue}>75%</button>
              <button data-value="1" className={multiplier === 1 ? "active " : ""} onClick={this.onInsertMaxValue}>100%</button>
            </div>

            {this.state.positionTokenBalance && this.props.tradeType === TradeType.BUY && this.state.positionTokenBalance!.eq(0) ? (
              <CollapsibleContainer titleOpen="View advanced options" titleClose="Hide advanced options" isTransparent={amountMsg !== ""}>
                <div className="trade-form__unit-of-account-container">
                  Unit of Account
                    <UnitOfAccountSelector items={[
                    Asset.USDC,
                    process.env.REACT_APP_ETH_NETWORK === "kovan"
                      ? Asset.SAI
                      : Asset.DAI
                  ]} value={this.state.selectedUnitOfAccount} onChange={this.onChangeUnitOfAccount} />
                </div>
              </CollapsibleContainer>
            ) : null}
          </div>
        </div>
        {//#endregion tradeComponent
        }

        {this.state.positionValue !== this.state.selectedValue ? (
          <div className="manage-collateral-form__actions-container">
            <button className="manage-collateral-form__action-cancel" onClick={this.props.onCancel}>
              Cancel
            </button>
            {this.state.positionValue > this.state.selectedValue ? (
              <button type="submit" className="manage-collateral-form__action-withdraw">
                Withdraw
              </button>
            ) : (
                <button type="submit" className="manage-collateral-form__action-top-up">
                  Top Up
                </button>
              )}
          </div>
        ) : (
            <div className="manage-collateral-form__actions-container">
              <button className="manage-collateral-form__action-close" onClick={this.props.onCancel}>
                Close
            </button>
            </div>
          )}
      </form>
    );
  }

  private onChange = (value: number) => {
    this.setState({ ...this.state, currentValue: value });
  };

  private onUpdate = (value: number) => {
    this.setState({ ...this.state, selectedValue: value });
  };
  /*
    public onSubmitClick = (event: FormEvent<HTMLFormElement>) => {
      this.props.onSubmit(new ManageCollateralRequest(new BigNumber(this.state.currentValue)));
    };*/



  //#region tradeComponent
  public onTradeAmountChange = async (event: ChangeEvent<HTMLInputElement>) => {
    // handling different types of empty values
    const amountText = event.target.value ? event.target.value : "";

    // setting inputAmountText to update display at the same time
    this._isMounted && this.setState({ ...this.state, inputAmountText: amountText }, () => {
      // emitting next event for processing with rx.js
      this._inputChange.next(this.state.inputAmountText);
    });
  };

  public onInsertMaxValue = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!this.state.assetDetails || !event || !event.currentTarget) {
      return null;
    }
    const buttonElement = event.currentTarget as HTMLButtonElement;
    const value = new BigNumber(parseFloat(buttonElement.dataset.value!));
    this._isMounted && this.setState({ ...this.state }, () => {
      // emitting next event for processing with rx.js
      this._inputSetMax.next(value);
    });
  };

  public onChangeCollateralOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    this._isMounted && this.setState({ ...this.state, isChangeCollateralOpen: true });
  };

  private onChangeCollateralClose = () => {
    this._isMounted && this.setState({ ...this.state, isChangeCollateralOpen: false });
  };

  public onChangeCollateralClicked = async (asset: Asset) => {
    await this._isMounted && this.setState({ ...this.state, isChangeCollateralOpen: false, collateral: asset });

    this._inputSetMax.next();
  };

  public onChangeUnitOfAccount = (asset: Asset) => {
    let version = 2;
    const key = new TradeTokenKey(this.props.asset, asset, this.props.positionType, this.props.leverage, this.state.tokenizeNeeded, version);
    if (key.erc20Address === "") {
      version = 1;
    }

    this._isMounted && this.setState({ ...this.state, selectedUnitOfAccount: asset });

    this.props.onManage(
      new ManageCollateralRequest(
        new BigNumber(this.state.currentValue),
        this.props.tradeType,
        this.props.asset,
        asset,
        this.state.collateral,
        this.props.positionType,
        this.props.leverage,
        this.state.tradeAmountValue,
        this.state.tokenizeNeeded,
        version,
        this.state.inputAmountValue
      )
    );
  };

  public onChangeTokenizeNeeded = async (event: ChangeEvent<HTMLInputElement>) => {
    this._isMounted && this.setState({ ...this.state, tokenizeNeeded: event.target.checked });
  };

  public onSubmitClick = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();



    const usdAmount = await FulcrumProvider.Instance.getSwapToUsdRate(this.props.asset)

    if (this.state.tradeAmountValue.isZero()) {
      if (this._input) {
        this._input.focus();
      }
      return;
    }

    if (!this.state.assetDetails) {
      this.props.onCancel();
      return;
    }

    if (!this.state.tradeAmountValue.isPositive()) {
      this.props.onCancel();
      return;
    }
    let usdPrice = this.state.tradeAmountValue
    if (usdPrice != null) {
      usdPrice = usdPrice.multipliedBy(usdAmount)
    }

    /*if (this.props.tradeType === TradeType.SELL) {

      const tradeTokenKey = this.getTradeTokenGridRowSelectionKey();
      if (FulcrumProvider.Instance.web3Wrapper && FulcrumProvider.Instance.contractsSource) {
        const pTokenContract = await FulcrumProvider.Instance.contractsSource.getPTokenContract(tradeTokenKey);
        if (pTokenContract) {

          const positionTokenBalance = await FulcrumProvider.Instance.getPTokenBalanceOfUser(tradeTokenKey);
          const currentLeverage = (await pTokenContract.currentLeverage.callAsync()).div(10 ** 18);
          const maxTradeValue = positionTokenBalance.multipliedBy(currentLeverage);

          let decimals: number = AssetsDictionary.assets.get(tradeTokenKey.loanAsset)!.decimals || 18;
          if (tradeTokenKey.loanAsset === Asset.WBTC && tradeTokenKey.positionType === PositionType.SHORT) {
            decimals = decimals + 10;
          }

          const amountInBaseUnits = new BigNumber(this.state.tradeAmountValue.multipliedBy(10 ** decimals).toFixed(0, 1));
          if (amountInBaseUnits.gt(maxTradeValue)) {

            this._isMounted && this.setState({ ...this.state, isAmountExceeded: true });
            console.warn("trade max amount exceeded!");

            return;
          } else {

            this._isMounted && this.setState({ ...this.state, isAmountExceeded: false });
            console.warn("trade amount is normal!");

          }
        }
      }
    }*/



    const randomNumber = Math.floor(Math.random() * 100000) + 1;
    const tagManagerArgs = {
      dataLayer: {
        event: 'purchase',
        transactionId: randomNumber,
        transactionTotal: new BigNumber(usdPrice),
        transactionProducts: [{
          name: this.props.leverage + 'x' + this.props.asset + '-' + this.props.positionType + '-' + this.state.selectedUnitOfAccount,
          sku: this.props.leverage + 'x' + this.props.asset + '-' + this.props.positionType,
          category: this.props.positionType,
          price: new BigNumber(usdPrice),
          quantity: 1
        }],
      }
    }
    TagManager.dataLayer(tagManagerArgs)
    this.props.onSubmit(
      new ManageCollateralRequest(
        new BigNumber(this.state.currentValue),
        this.props.tradeType,
        this.props.asset,
        this.state.selectedUnitOfAccount,
        this.state.collateral,
        this.props.positionType,
        this.props.leverage,
        this.state.tradeAmountValue,
        this.state.tokenizeNeeded,
        this.props.version,
        this.state.inputAmountValue
      )
    );
  };

  private rxFromMaxAmountWithMultiplier = (multiplier: BigNumber): Observable<ITradeAmountChangeEvent | null> => {
    return new Observable<ITradeAmountChangeEvent | null>(observer => {

      this._isMounted && this.setState({ ...this.state, isLoading: true });
      const tradeTokenKey = this.getTradeTokenGridRowSelectionKey();
      FulcrumProvider.Instance.getMaxTradeValue(this.props.tradeType, tradeTokenKey, this.state.collateral)
        .then(maxTradeValue => {
          // maxTradeValue is raw here, so we should not use it directly
          this.getInputAmountLimitedFromBigNumber(maxTradeValue, tradeTokenKey, maxTradeValue, multiplier, true).then(limitedAmount => {
            if (!limitedAmount.tradeAmountValue.isNaN()) {
              const tradeRequest = new ManageCollateralRequest(
                new BigNumber(this.state.currentValue),
                this.props.tradeType,
                this.props.asset,
                this.state.selectedUnitOfAccount,
                this.state.collateral,
                this.props.positionType,
                this.props.leverage,
                limitedAmount.tradeAmountValue,
                this.state.tokenizeNeeded,
                this.props.version,
                this.state.inputAmountValue
              );

              this.getTradeExpectedResults(tradeRequest).then(tradeExpectedResults => {
                observer.next({
                  isTradeAmountTouched: this.state.isTradeAmountTouched,
                  inputAmountText: limitedAmount.inputAmountText,
                  inputAmountValue: limitedAmount.inputAmountValue,
                  tradeAmountValue: limitedAmount.tradeAmountValue,
                  maxTradeValue: limitedAmount.maxTradeValue,
                  tradedAmountEstimate: tradeExpectedResults.tradedAmountEstimate,
                  slippageRate: tradeExpectedResults.slippageRate,
                  exposureValue: tradeExpectedResults.exposureValue
                });
              });
            } else {
              observer.next(null);
            }
          });
        });

    });
  };

  private rxFromCurrentAmount = (value: string): Observable<ITradeAmountChangeEvent | null> => {
    return new Observable<ITradeAmountChangeEvent | null>(observer => {

      this._isMounted && this.setState({ ...this.state, isExposureLoading: true });
      const tradeTokenKey = this.getTradeTokenGridRowSelectionKey();
      const maxTradeValue = this.state.maxTradeValue;
      this.getInputAmountLimitedFromText(value, tradeTokenKey, maxTradeValue, false).then(limitedAmount => {
        // updating stored value only if the new input value is a valid number
        if (!limitedAmount.tradeAmountValue.isNaN()) {
          const tradeRequest = new ManageCollateralRequest(
            new BigNumber(this.state.currentValue),
            this.props.tradeType,
            this.props.asset,
            this.state.selectedUnitOfAccount,
            this.state.collateral,
            this.props.positionType,
            this.props.leverage,
            limitedAmount.tradeAmountValue,
            this.state.tokenizeNeeded,
            this.props.version,
            this.state.inputAmountValue
          );

          this.getTradeExpectedResults(tradeRequest).then(tradeExpectedResults => {
            observer.next({
              isTradeAmountTouched: true,
              inputAmountText: limitedAmount.inputAmountText,
              inputAmountValue: limitedAmount.inputAmountValue,
              tradeAmountValue: limitedAmount.tradeAmountValue,
              maxTradeValue: maxTradeValue,
              tradedAmountEstimate: tradeExpectedResults.tradedAmountEstimate,
              slippageRate: tradeExpectedResults.slippageRate,
              exposureValue: tradeExpectedResults.exposureValue
            });
          });
        } else {
          observer.next(null);
        }
      });

    });
  };

  private getTradeExpectedResults = async (manageCollateralRequest: ManageCollateralRequest): Promise<ITradeExpectedResults> => {
    const tradedAmountEstimate = await FulcrumProvider.Instance.getTradedAmountEstimate(manageCollateralRequest);
    const slippageRate = await FulcrumProvider.Instance.getTradeSlippageRate(manageCollateralRequest, tradedAmountEstimate);
    const exposureValue = await FulcrumProvider.Instance.getTradeFormExposure(manageCollateralRequest);

    return {
      tradedAmountEstimate: tradedAmountEstimate,
      slippageRate: slippageRate || new BigNumber(0),
      exposureValue: exposureValue
    };
  };

  private getInputAmountLimitedFromText = async (textValue: string, tradeTokenKey: TradeTokenKey, maxTradeValue: BigNumber, skipLimitCheck: boolean): Promise<IInputAmountLimited> => {
    const inputAmountText = textValue;
    const amountTextForConversion = inputAmountText === "" ? "0" : inputAmountText[0] === "." ? `0${inputAmountText}` : inputAmountText;
    const inputAmountValue = new BigNumber(amountTextForConversion);

    return this.getInputAmountLimited(inputAmountText, inputAmountValue, tradeTokenKey, maxTradeValue, skipLimitCheck);
  };

  private getInputAmountLimitedFromBigNumber = async (bnValue: BigNumber, tradeTokenKey: TradeTokenKey, maxTradeValue: BigNumber, multiplier: BigNumber, skipLimitCheck: boolean): Promise<IInputAmountLimited> => {
    const inputAmountValue = bnValue;
    const inputAmountText = bnValue.decimalPlaces(this._inputPrecision).toFixed();

    return this.getInputAmountLimited(inputAmountText, inputAmountValue, tradeTokenKey, maxTradeValue, skipLimitCheck, multiplier);
  };

  private getInputAmountLimited = async (textValue: string, bnValue: BigNumber, tradeTokenKey: TradeTokenKey, maxTradeValue: BigNumber, skipLimitCheck: boolean, multiplier: BigNumber = new BigNumber(1)): Promise<IInputAmountLimited> => {
    let inputAmountText = textValue;
    let inputAmountValue = bnValue;

    // handling negative values (incl. Ctrl+C)
    if (inputAmountValue.isNegative()) {
      inputAmountValue = inputAmountValue.absoluteValue();
      inputAmountText = inputAmountValue.decimalPlaces(this._inputPrecision).toFixed();
    }

    let tradeAmountValue = new BigNumber(0);
    // we should normalize maxTradeValue for sell
    const pTokenBaseAsset = FulcrumProvider.Instance.getBaseAsset(tradeTokenKey);
    const destinationAsset = this.state.collateral;
    if (this.props.tradeType === TradeType.SELL) {
      const pTokenPrice = await FulcrumProvider.Instance.getPTokenPrice(tradeTokenKey);
      // console.log(`pTokenPrice: ${pTokenPrice.toFixed()}`);
      const swapRate = await FulcrumProvider.Instance.getSwapRate(pTokenBaseAsset, destinationAsset);
      // console.log(`swapRate: ${swapRate.toFixed()}`);

      const pTokenAmountMax = maxTradeValue.multipliedBy(multiplier);
      // console.log(`pTokenAmountMax: ${pTokenAmountMax.toFixed()}`);
      const pTokenBaseAssetAmountMax = pTokenAmountMax.multipliedBy(pTokenPrice);
      // console.log(`pTokenBaseAssetAmountMax: ${pTokenBaseAssetAmountMax.toFixed()}`);
      const destinationAssetAmountMax = pTokenBaseAssetAmountMax.multipliedBy(swapRate);
      // console.log(`destinationAssetAmountMax: ${destinationAssetAmountMax.toFixed()}`);

      const destinationAssetAmountLimited = skipLimitCheck ? destinationAssetAmountMax : BigNumber.min(destinationAssetAmountMax, inputAmountValue);
      // console.log(`destinationAmountLimited: ${destinationAssetAmountLimited.toFixed()}`);

      const pTokenBaseAssetAmountLimited = destinationAssetAmountLimited.dividedBy(swapRate);
      // console.log(`pTokenBaseAssetAmountLimited: ${pTokenBaseAssetAmountLimited.toFixed()}`);
      const pTokenAmountLimited = pTokenBaseAssetAmountLimited.dividedBy(pTokenPrice);
      // console.log(`pTokenAmountLimited: ${pTokenAmountLimited.toFixed()}`);

      inputAmountValue = destinationAssetAmountLimited;
      inputAmountText = destinationAssetAmountLimited.decimalPlaces(this._inputPrecision).toFixed();
      tradeAmountValue = pTokenAmountLimited;
    } else if (this.props.tradeType === TradeType.BUY) {
      tradeAmountValue = inputAmountValue;
      if (tradeAmountValue.gt(maxTrad
        eValue)) {
        inputAmountValue = maxTradeValue.multipliedBy(multiplier);
        inputAmountText = maxTradeValue.multipliedBy(multiplier).decimalPlaces(this._inputPrecision).toFixed();
        tradeAmountValue = maxTradeValue.multipliedBy(multiplier);
      }
    }

    return {
      inputAmountValue: inputAmountValue.multipliedBy(multiplier),
      inputAmountText: isNaN(parseFloat(inputAmountText)) ? "" : new BigNumber(parseFloat(inputAmountText)).multipliedBy(multiplier).toFixed(),
      tradeAmountValue: tradeAmountValue.multipliedBy(multiplier),
      maxTradeValue
    };
  };

  // private formatPrecision(output: number): string {
  //   let n = Math.log(output) / Math.LN10;
  //   let x = 3 - n;
  //   if (x < 0) x = 0;
  //   if (x > 5) x = 5;
  //   let result = new Number(output.toFixed(x)).toString();
  //   return result;
  // }

  //#endregion tradeComponent

}
